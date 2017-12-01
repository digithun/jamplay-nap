const { guard } = require('./errors')
const ERRORS = require('./errors/codes')

const { URL } = require('url')
const { isPasswordMatch, willValidateEmail, willValidatePassword, willValidateEmailAndPassword } = require('./validator')

const createVerificationForChangeEmailURL = (oldEmail, newEmail, auth_change_email_uri, base_url, token) => {
  const url = new URL(auth_change_email_uri, base_url)
  url.pathname += `/${token}`
  url.search = `oldEmail=${oldEmail}&newEmail=${newEmail}`
  return url.toString()
}

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
  // Guard
  guard({ email })
  guard({ password })

  // Clean up
  email = email.toLowerCase().trim()

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

  // Clean up
  email = email.toLowerCase().trim()

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
      projection: { _id: 1, status: 1, first_name: 1, last_name: 1 },
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

const _getUserByEmailAndPassword = async (email, password) => {
  // Guard
  await willValidateEmailAndPassword(email, password)

  // Clean up
  email = email.toLowerCase().trim()

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

  const isMatched = await isPasswordMatch(password, user.hashed_password)
  if (!isMatched) {
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
        case ERRORS.AUTH_INVALID_ARGUMENT.code:
        case ERRORS.AUTH_EMAIL_NOT_VERIFIED.code:
          done(ERRORS.AUTH_INVALID_LOGIN)
          break
        default:
          done(err, null)
          break
      }
    })
}

const _guardToken = (token, res) => {
  if (!token || token.trim() === '') {
    return res.redirect(`${require('./config').auth_error_uri}?name=auth/token-not-provided`)
  }
}

const auth_change_email_token = (req, res, next) => {
  // Guard
  const token = req.params.token
  _guardToken(token, res)

  // Verify
  _willValidateToken(token).then(() => next()).catch(() => {
    res.redirect(`${require('./config').auth_error_action_token_not_exist}`)
  })
}

const auth_reset_token = (req, res, next) => {
  // Guard
  const token = req.params.token
  _guardToken(token, res)

  // Verify
  _willValidateToken(token)
    .then(() => {
      res.redirect(`${require('./config').auth_reset_uri}/${token}`)
    })
    .catch(() => {
      res.redirect(`${require('./config').auth_error_action_token_not_exist}`)
    })
}

const auth_local_token = (req, res) => {
  // Guard
  const token = req.params.token
  _guardToken(token, res)

  // Verify
  _willMarkUserAsVerifiedByToken(token)
    .then(() => {
      res.redirect(require('./config').auth_verified_uri)
    })
    .catch(() => {
      res.redirect(`${require('./config').auth_error_action_token_not_exist}`)
    })
}

const willUpdatePasswordByToken = async (token, password) => {
  // Guard token
  let user = await NAP.User.findOne({ token })
  if (!user) throw ERRORS.AUTH_INVALID_ACTION_CODE

  // Guard email
  const isValid = await willValidatePassword(password)
  if (!isValid) throw ERRORS.AUTH_WRONG_PASSWORD

  user = _withHashedPassword(user, password)
  user = Object.assign(user, _verifiedByEmailPayload())

  return user.save()
}

const willAddUnverifiedEmail = async (user, unverifiedEmail, token) => {
  // Guard invalid arguments
  guard({ user })
  const isValid = await willValidateEmail(unverifiedEmail)
  if (!isValid) throw ERRORS.AUTH_INVALID_EMAIL

  // Clean up
  unverifiedEmail = unverifiedEmail.toLowerCase().trim()

  // Guard existing user that's not owner
  const otherUser = await NAP.User.findOne({ _id: { $ne: user._id }, email: unverifiedEmail })
  _guardDuplicatedUserByEmail(otherUser)

  // Update user status
  user.token = token
  user.unverifiedEmail = unverifiedEmail
  user.status = 'WAIT_FOR_NEW_EMAIL_VERIFICATION'
  await user.save()

  return user
}

const willVerifyEmailByToken = async (token, password) => {
  // Guard token
  let user = await NAP.User.findOne({ token })
  if (!user) throw ERRORS.AUTH_INVALID_ACTION_CODE

  // Guard Password
  const isMatched = await isPasswordMatch(password, user.hashed_password)
  if (!isMatched) throw ERRORS.AUTH_INVALID_PASSWORD

  const email = user.unverifiedEmail
  await willUpdateEmail(user, email)

  // Clean up
  user = Object.assign(user, _verifiedByEmailPayload())
  user.unverifiedEmail = null

  return user.save()
}

const willUpdateEmail = async (user, email) => {
  // Guard
  guard({ user })
  guard({ email })

  // Clean up
  email = email.toLowerCase().trim()

  // Guard : valid email
  await willValidateEmail(email)

  // Guard : unique
  const existingUser = await NAP.User.findOne({ email, _id: { $nin: user._id } })
  _guardDuplicatedUserByEmail(existingUser)

  // Backup previous email
  user.usedEmails = user.usedEmails || []
  user.usedEmails.push(user.email)

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
    let result = {}
    const user = await willUpdatePasswordByToken(token, password).catch(err => (result = { errors: [err.message] }))
    const AUTH_USER_NOT_FOUND = require('./errors/commons').AUTH_USER_NOT_FOUND
    if (!user) {
      result.errors = result.errors ? result.errors.concat(AUTH_USER_NOT_FOUND) : AUTH_USER_NOT_FOUND
    }

    return res.json(Object.assign(result, { data: { succeed: !result.errors, /* Will deprecated isReset */ isReset: !result.errors } }))
  })()
}

const change_email_by_token = (req, res) => {
  const { token, password } = req.body
  ;(async () => {
    let result = {}
    const user = await willVerifyEmailByToken(token, password).catch(err => (result = { errors: [err.message] }))
    if (!user) {
      const AUTH_USER_NOT_FOUND = require('./errors/commons').AUTH_USER_NOT_FOUND
      result.errors = result.errors ? result.errors.concat(AUTH_USER_NOT_FOUND) : [AUTH_USER_NOT_FOUND]
    }

    result = Object.assign(result, { data: { succeed: !result.errors } })
    console.log(result)
    return res.json(result)
  })()
}

const auth_local = (req, res) => res.redirect('/auth/welcome')

const handler = {
  auth_local_token,
  auth_reset_token,
  auth_change_email_token,
  reset_password_by_token,
  change_email_by_token,
  auth_local
}

module.exports = {
  createVerificationURL,
  createPasswordResetURL,
  createNewPasswordResetURL,
  createVerificationForChangeEmailURL,
  willSignUpNewUser,
  willSetUserStatusAsWaitForEmailReset,
  willUpdatePasswordByToken,
  willAddUnverifiedEmail,
  willUpdateEmail,
  willVerifyEmailByToken,
  willUpdatePassword,
  validateLocalStrategy,
  handler,
  toHashedPassword
}
