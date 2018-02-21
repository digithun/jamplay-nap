const { guard, errorBy } = require('./errors')
const _emailError = msg => errorBy('AUTH_EMAIL_NOT_SENT', msg)

const willSendVerificationForUpdateEmail = async (user, email, token) => {
  // Token
  token = token || require('uuid/v4')()

  const { willAddUnverifiedEmail } = require('./authen-local-passport')
  await willAddUnverifiedEmail(user, email, token)

  // Guard
  if (!user) {
    throw require('./errors/codes').AUTH_USER_NOT_FOUND
  }

  const msg = await _sendChangeEmailVerification(user.first_name + ' ' + user.last_name, user.email, email, token)

  // Got msg?
  if (!msg) throw _emailError(` (${email})`)

  return user
}

const _sendChangeEmailVerification = async (fullName, oldEmail, email, token) => {
  // Will send email verification
  const { auth_change_email_uri, base_url } = require('./config')
  const { createVerificationForChangeEmailURL } = require('./authen-local-passport')
  const verification_url = createVerificationForChangeEmailURL(oldEmail, email, auth_change_email_uri, base_url, token)

  // New user, will need verification by email
  const config = require('./config')
  const mailer = require('./mailer')

  const msg = await mailer
    .willSendVerificationForChangeEmail({
      mailgun_api_key: config.mailgun_api_key,
      mailgun_domain: config.mailgun_domain,
      email,
      verification_url,
      fullName
    })
    .catch(err => {
      throw _emailError(` (${email}) : ${err.message}`)
    })
  return msg
}

// Forget password
const willResetPasswordViaEmail = async (req, email, token) => {
  // Token
  token = token || require('uuid/v4')()

  const { willSetUserStatusAsWaitForEmailReset } = require('./authen-local-passport')
  const user = await willSetUserStatusAsWaitForEmailReset(email, token)

  // Guard
  if (!user) {
    throw require('./errors/codes').AUTH_USER_NOT_FOUND
  }

  // Will send email verification
  const { auth_validate_reset_uri, auth_new_reset_uri, base_url } = require('./config')
  const { createPasswordResetURL, createNewPasswordResetURL } = require('./authen-local-passport')
  const password_reset_url = createPasswordResetURL(auth_validate_reset_uri, base_url, token)
  const new_password_reset_url = createNewPasswordResetURL(auth_new_reset_uri, base_url)
  const fullName = user.first_name + ' ' + user.last_name

  // New user, will need verification by email
  const { mailgun_api_key, mailgun_domain } = require('./config')
  guard({ mailgun_api_key })
  guard({ mailgun_domain })

  const mailer = require('./mailer')
  const msg = await mailer
    .willSendPasswordReset({
      mailgun_api_key,
      mailgun_domain,
      email,
      password_reset_url,
      new_password_reset_url,
      fullName
    })
    .catch(err => {
      throw _emailError(` (${email}) : ${err.message}`)
    })

  // Got msg?
  if (!msg) {
    throw _emailError(` (${email})`)
  }
  return user
}

const _sendEmailVerification = async (email, token, fullName) => {
  // Will send email verification
  const { auth_local_uri, base_url } = require('./config')
  const { createVerificationURL } = require('./authen-local-passport')
  const verification_url = createVerificationURL(auth_local_uri, base_url, token)

  // New user, will need verification by email
  const config = require('./config')
  const mailer = require('./mailer')

  const msg = await mailer
    .willSendVerification({
      mailgun_api_key: config.mailgun_api_key,
      mailgun_domain: config.mailgun_domain,
      email,
      verification_url,
      fullName
    })
    .catch(err => {
      throw _emailError(` (${email}) : ${err.message}`)
    })
  return msg
}

// Register with email and password
const willSignUp = async (req, email, password, extraFields) => {
  // Guard
  const { willValidateEmailAndPassword } = require('./validator')
  const isValidEmailAndPassword = await willValidateEmailAndPassword(email, password)
  if (!isValidEmailAndPassword) {
    throw require('./errors/codes').AUTH_WRONG_PASSWORD
  }

  // Clean up
  email = email.toLowerCase().trim()

  // Token
  const token = require('uuid/v4')()

  // Validate receiver
  const { willSignUpNewUser } = require('./authen-local-passport')
  const user = await willSignUpNewUser(email, password, extraFields, token)

  // Guard
  if (!user) {
    throw require('./errors/codes').AUTH_USER_NOT_FOUND
  }

  const msg = await _sendEmailVerification(email, token, user.first_name + ' ' + user.last_name)

  // Got msg?
  if (!msg) throw _emailError(` (${email})`)

  // User has been signup and wait for email verification
  NAP.emitter.emit(require('./events').USER_SIGNUP_WITH_EMAIL, {
      req,
      user
    })

  return user
}

// Register with email and password
const willChallengeEmail = async (user, unverifiedEmail) => {
  // Guard
  const { willValidateEmail } = require('./validator')
  const isValidEmail = await willValidateEmail(unverifiedEmail)
  if (!isValidEmail) {
    throw require('./errors/codes').AUTH_INVALID_EMAIL
  }

  // Clean up
  unverifiedEmail = unverifiedEmail.toLowerCase().trim()

  // Mark
  const token = require('uuid/v4')()
  user.unverifiedEmail = unverifiedEmail
  user.token = token
  user.emailVerified = false
  user.status = 'WAIT_FOR_EMAIL_VERIFICATION'

  // Send
  const msg = await _sendEmailVerification(unverifiedEmail, token, user.first_name + ' ' + user.last_name)

  // Got msg?
  if (!msg) throw _emailError(` (${unverifiedEmail})`)

  return user.save()
}

// Login with email
const willLogin = async (req, email, password) => {
  // Guard
  const { willValidateEmailAndEmptyPassword } = require('./validator')
  const isValidEmail = await willValidateEmailAndEmptyPassword(email, password)

  if (!isValidEmail) {
    throw require('./errors/codes').AUTH_INVALID_LOGIN
  }

  // Clean up
  email = email.toLowerCase().trim()

  // To let passport-local consume
  req.body.email = email
  req.body.password = password

  // Validate local
  const { willAuthenWithPassport } = require('./passport-authen')
  return willAuthenWithPassport('local', req)
}

const willLogout = async sessionToken =>
  NAP.Authen.findOneAndUpdate(
    { sessionToken },
    {
      loggedOutAt: new Date().toISOString(),
      isLoggedIn: false,
      sessionToken: null
    },
    { new: true, upsert: false }
  )

module.exports = {
  willSignUp,
  willLogin,
  willLogout,
  willResetPasswordViaEmail,
  willSendVerificationForUpdateEmail,
  willChallengeEmail
}
