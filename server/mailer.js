const { guard } = require('./errors')

const _willSendByBuilder = async ({ mailgun_api_key, mailgun_domain, email, verification_url, builder, fullName }) => {
  // Guard
  guard({ mailgun_api_key }, 'Required : mailgun_api_key, Missing .env MAILGUN_API_KEY?')
  guard({ mailgun_domain }, 'Required : mailgun_domain, Missing .env MAILGUN_DOMAIN?')
  guard({ email })
  guard({ verification_url })

  // Client
  const MailGun = require('mailgun.js')
  const mailgunClient = MailGun.client({
    username: 'api',
    key: mailgun_api_key
  })

  // Template
  const data = builder({ mailgun_domain, email, verification_url, fullName })

  console.log("mailgunClient data", data)
  // Send
  return mailgunClient.messages.create(mailgun_domain, data)
}

const willSendVerification = async ({ mailgun_api_key, mailgun_domain, email, verification_url, fullName }) => {
  const builder = require('../templates/email-signup')
  return _willSendByBuilder({ mailgun_api_key, mailgun_domain, email, verification_url, builder, fullName })
}

const willSendVerificationForChangeEmail = async ({ mailgun_api_key, mailgun_domain, email, verification_url, fullName }) => {
  const builder = require('../templates/email-change-email')
  return _willSendByBuilder({ mailgun_api_key, mailgun_domain, email, verification_url, builder, fullName })
}

const willSendPasswordReset = async ({ mailgun_api_key, mailgun_domain, email, password_reset_url, new_password_reset_url, fullName }) => {
  // Guard
  guard({ mailgun_api_key }, 'Required : mailgun_api_key, Missing .env MAILGUN_API_KEY?')
  guard({ mailgun_domain }, 'Required : mailgun_domain, Missing .env MAILGUN_DOMAIN?')
  guard({ email })
  guard({ password_reset_url })
  guard({ new_password_reset_url })

  // Client
  const MailGun = require('mailgun.js')
  const mailgunClient = MailGun.client({
    username: 'api',
    key: mailgun_api_key
  })

  // Template
  const builder = require('../templates/email-forget')
  const data = builder({ mailgun_domain, email, verification_url: password_reset_url, fullName })

  // Send
  return mailgunClient.messages.create(mailgun_domain, data)
}

module.exports = { willSendVerification, willSendVerificationForChangeEmail, willSendPasswordReset }
