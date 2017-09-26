const { guard } = require('./errors')
const ERRORS = require('./errors/codes')

const { URL } = require('url')

const createVerificationURL = (auth_local_uri, base_url, token) => {
  const url = new URL(auth_local_uri, base_url)
  url.pathname += `/${token}`
  return url.toString()
}
const createPasswordResetURL = (auth_reset_uri, base_url, token) => {
  const url = new URL(auth_reset_uri, base_url)
  url.pathname += `/${token}`
  return url.toString()
}
const createNewPasswordResetURL = (auth_new_reset_uri, base_url) => {
  const url = new URL(auth_new_reset_uri, base_url)
  return url.toString()
}

const willValidateEmail = async email => {
  const is = require('is_js')

  guard({ email })

  if (is.not.email(email)) {
    throw ERRORS.AUTH_INVALID_EMAIL
  }

  return true
}

const willValidateEmptyPassword = async password => {
  guard({ password })
  return true
}

const willValidatePassword = async password => {
  const is = require('is_js')

  guard({ password })

  if (is.not.within(password.length, 5, 256)) {
    throw ERRORS.AUTH_WEAK_PASSWORD
  }

  return true
}

const willValidateEmailAndPassword = async (email, password) => {
  let isValid = await willValidateEmail(email)
  isValid = isValid && (await willValidatePassword(password))
  return isValid
}

const willValidateEmailAndEmptyPassword = async (email, password) => {
  let isValid = await willValidateEmail(email)
  isValid = isValid && (await willValidateEmptyPassword(password))
  return isValid
}

const toHashedPassword = password => {
  const bcrypt = require('bcryptjs')
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

const _withHashedPassword = (user, password) => {
  user.hashed_password = toHashedPassword(password)
  return user
}

const _verifiedByEmailPayload = () => ({
  token: null,
  emailVerified: true,
  emailVerifiedAt: new Date().toISOString(),
  status: 'VERIFIED_BY_EMAIL'
})

const _createNewUserData = (email, password, extraFields, token) =>
  _withHashedPassword(
    Object.assign(
      {
        email,
        name: email.split('@')[0],
        token,
        role: 'user',
        emailVerified: false,
        status: 'WAIT_FOR_EMAIL_VERIFICATION'
      },
      extraFields
    ),
    password
  )

const _guardUnverifiedUserForSignUp = user => {
  // No user, which is great
  if (!user) {
    return
  }

  // User, but...
  switch (user.status) {
    case 'WAIT_FOR_EMAIL_VERIFICATION':
      throw ERRORS.AUTH_EMAIL_ALREADY_SENT
    case 'VERIFIED_BY_EMAIL':
      throw ERRORS.AUTH_EMAIL_ALREADY_IN_USE
  }
}

const _guardDuplicatedUserByEmail = user => {
  if (user) {
    throw ERRORS.AUTH_EMAIL_ALREADY_IN_USE
  }
}

const willSignUpNewUser = async (email, password, extraFields, token) => {
  // Guard existing user
  const user = await NAP.User.findOne({ email })
  _guardDuplicatedUserByEmail(user)
  _guardUnverifiedUserForSignUp(user)

  // Create user with email and token, password if any
  const userData = _createNewUserData(email, password, extraFields, token)
  return NAP.User.create(userData)
}

const willSetUserStatusAsWaitForEmailReset = async (email, token) => {
  // Guard
  guard({ email })
  guard({ token })

  // Guard
  await willValidateEmail(email)

  // Use existing user
  return NAP.User.findOneAndUpdate(
    {
      email
    },
    {
      token,
      status: 'WAIT_FOR_EMAIL_RESET'
    },
    {
      projection: { _id: 1, status: 1 },
      new: true,
      upsert: false
    }
  )
}

const _willValidateToken = async token => {
  // Guard
  guard(token)

  // Look up user by token
  const user = await NAP.User.findOne({ token })
  if (!user) {
    throw ERRORS.AUTH_INVALID_USER_TOKEN
  }

  return user
}

const _willMarkUserAsVerifiedByToken = async token => {
  // Guard
  guard(token)

  // Look up user by token
  const user = await NAP.User.findOneAndUpdate({ token }, _verifiedByEmailPayload())
  if (!user) {
    throw ERRORS.AUTH_INVALID_USER_TOKEN
  }

  return user
}

const _willValidatePassword = async (password, hashed_password) => {
  // Guard
  guard({ password })
  guard({ hashed_password })

  // Password matched?
  const bcrypt = require('bcryptjs')
  const isPasswordMatch = bcrypt.compareSync(password, hashed_password)
  if (!isPasswordMatch) {
    throw ERRORS.AUTH_WRONG_PASSWORD
  }

  return true
}

const _getUserByEmailAndPassword = async (email, password) => {
  // Guard
  await willValidateEmailAndPassword(email, password)

  // Guard unverified or not existing user
  const user = await NAP.User.findOne({ email })

  // No user for that email, will throw invalid login
  if (!user) {
    throw ERRORS.AUTH_USER_NOT_FOUND
  }

  // User for that email exist but not verify
  if (!user.emailVerified) {
    throw ERRORS.AUTH_EMAIL_NOT_VERIFIED
  }

  const isPasswordMatch = await _willValidatePassword(password, user.hashed_password)
  if (!isPasswordMatch) {
    throw ERRORS.AUTH_WRONG_PASSWORD
  } else {
    return user
  }
}

const validateLocalStrategy = (email, password, done) => {
  _getUserByEmailAndPassword(email, password)
    .then(user => {
      done(null, user)
    })
    .catch(err => {
      switch (err.code) {
        // Will throw invalid login for these cases
        case ERRORS.AUTH_USER_NOT_FOUND.code:
        case ERRORS.AUTH_WRONG_PASSWORD.code:
        case ERRORS.AUTH_WEAK_PASSWORD.code:
          done(ERRORS.AUTH_INVALID_LOGIN)
          break
        default:
          done(err, null)
          break
      }
    })
}

const auth_reset_token = (req, res, next) => {
  const { auth_error_uri } = require('./config')
  // Guard
  const token = req.params.token
  if (!token || token.trim() === '') {
    return res.redirect(`${auth_error_uri}?name=auth/token-not-provided`)
  }

  // Verify
  _willValidateToken(token).then(() => next()).catch(() => {
    res.redirect(`${auth_error_uri}?name=auth/token-not-exist`)
  })
}

const auth_local_token = (req, res) => {
  const { auth_verified_uri, auth_error_uri } = require('./config')
  // Guard
  const token = req.params.token
  if (!token || token.trim() === '') {
    return res.redirect(`${auth_error_uri}?name=auth/token-not-provided`)
  }

  // Verify
  _willMarkUserAsVerifiedByToken(token).then(() => res.redirect(auth_verified_uri)).catch(() => {
    res.redirect(`${auth_error_uri}?name=auth/token-not-exist`)
  })
}

const willUpdatePasswordByToken = async (token, password) => {
  // Guard token
  let user = await NAP.User.findOne({ token })
  if (!user) throw ERRORS.AUTH_INVALID_ACTION_CODE

  // Guard email
  const isValid = await willValidatePassword(password)
  if (!isValid) throw ERRORS.AUTH_INVALID_PASSWORD

  user = _withHashedPassword(user, password)
  user = Object.assign(user, _verifiedByEmailPayload())

  return user.save()
}

const willUpdateEmail = async (user, email) => {
  // Guard
  guard({ user })
  guard({ email })

  // Guard : valid email
  await willValidateEmail(email)

  // Guard : unique
  const existingUser = await NAP.User.findOne({ email, _id: { $nin: user._id } })
  _guardDuplicatedUserByEmail(existingUser)

  // Update email
  user.email = email
  return user.save()
}

const willUpdatePassword = async (user, password, new_password) => {
  // Guard
  guard({ user })
  guard({ password })
  guard({ new_password })

  // Guard : valid password
  await willValidatePassword(new_password)

  // User exist?
  const existingUser = await _getUserByEmailAndPassword(user.email, password)
  if (!existingUser) throw require('./errors/commons').NAP_USER_NOT_FOUND

  _withHashedPassword(existingUser, new_password)

  return existingUser.save()
}

const reset_password_by_token = (req, res) => {
  const { token, password } = req.body
  ;(async () => {
    const result = await willUpdatePasswordByToken(token, password).catch(err => res.json({ errors: [err.message] }))

    return res.json({ data: { isReset: !!result } })
  })()
}

const auth_local = (req, res) => res.redirect('/auth/welcome')

const handler = {
  auth_local_token,
  auth_reset_token,
  reset_password_by_token,
  auth_local
}

module.exports = {
  createVerificationURL,
  createPasswordResetURL,
  createNewPasswordResetURL,
  willSignUpNewUser,
  willValidateEmail,
  willValidateEmptyPassword,
  willValidateEmailAndEmptyPassword,
  willValidatePassword,
  willValidateEmailAndPassword,
  willSetUserStatusAsWaitForEmailReset,
  willUpdatePasswordByToken,
  willUpdateEmail,
  willUpdatePassword,
  validateLocalStrategy,
  handler,
  toHashedPassword
}
