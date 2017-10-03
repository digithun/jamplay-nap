const { guard } = require('./errors')

const _willSendByBuilder = async ({ mailgun_api_key, mailgun_domain, email, verification_url, builder }) => {
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
  const data = builder(mailgun_domain, email, verification_url)

  // Send
  return mailgunClient.messages.create(mailgun_domain, data)
}

const willSendVerification = async ({ mailgun_api_key, mailgun_domain, email, verification_url }) => {
  const builder = require('../templates/email-signin')
  return _willSendByBuilder({ mailgun_api_key, mailgun_domain, email, verification_url, builder })
}

const willSendVerificationForChangeEmail = async ({ mailgun_api_key, mailgun_domain, email, verification_url }) => {
  const builder = require('../templates/email-change-email')
  return _willSendByBuilder({ mailgun_api_key, mailgun_domain, email, verification_url, builder })
}

const willSendPasswordReset = async ({ mailgun_api_key, mailgun_domain, email, password_reset_url, new_password_reset_url }) => {
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
  const data = builder(mailgun_domain, email, password_reset_url, new_password_reset_url)

  // Send
  return mailgunClient.messages.create(mailgun_domain, data)
}

module.exports = { willSendVerification, willSendVerificationForChangeEmail, willSendPasswordReset }
