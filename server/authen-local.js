const { guard, errorBy } = require('./errors')

const _emailError = msg => errorBy('AUTH_EMAIL_NOT_SENT', msg)

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
  const { auth_reset_uri, auth_new_reset_uri, base_url } = require('./config')
  const { createPasswordResetURL, createNewPasswordResetURL } = require('./authen-local-passport')
  const password_reset_url = createPasswordResetURL(auth_reset_uri, base_url, token)
  const new_password_reset_url = createNewPasswordResetURL(auth_new_reset_uri, base_url)

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
      new_password_reset_url
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

// Register with email and password
const willSignUp = async (req, email, password, extraFields) => {
  // Guard
  const { willValidateEmailAndPassword } = require('./authen-local-passport')
  const isValidEmailAndPassword = await willValidateEmailAndPassword(email, password)
  if (!isValidEmailAndPassword) {
    throw require('./errors/codes').AUTH_WRONG_PASSWORD
  }

  // Token
  const token = require('uuid/v4')()

  // Validate receiver
  const { willSignUpNewUser } = require('./authen-local-passport')
  const user = await willSignUpNewUser(email, password, extraFields, token)

  // Guard
  if (!user) {
    throw require('./errors/codes').AUTH_USER_NOT_FOUND
  }

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
      verification_url
    })
    .catch(err => {
      console.log(err)
      throw _emailError(` (${email}) : ${err.message}`)
    })

  // Got msg?
  if (!msg) {
    throw _emailError(` (${email})`)
  }
  return user
}

// Login with email
const willLogin = async (req, email, password) => {
  // Guard
  const { willValidateEmailAndEmptyPassword } = require('./authen-local-passport')
  const isValidEmail = await willValidateEmailAndEmptyPassword(email, password)

  if (!isValidEmail) {
    throw require('./errors/codes').AUTH_INVALID_LOGIN
  }

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
  willResetPasswordViaEmail
}
