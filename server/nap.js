const { willLoginWithFacebook, willGetFacebookProfile } = require('./authen-facebook')
const { willLinkWithFacebook, willUnlinkFromFacebook } = require('./authen-link')
const { willSignUp, willLogin, willLogout, willResetPasswordViaEmail, willSendVerificationForUpdateEmail } = require('./authen-local')
const { willUpdatePassword, willUpdatePasswordByToken, willUpdateEmail, willUpdateEmailByToken } = require('./authen-local-passport')
const { willInstallAndAuthen } = require('./graphql/resolvers')
const { willCreateUser } = require('./authen-sessions')
const config = require('./config')

class nap {
  constructor () {
    this.session = null
    this.errors = []

    this.willLinkWithFacebook = willLinkWithFacebook
    this.willUnlinkFromFacebook = willUnlinkFromFacebook

    this.willLoginWithFacebook = willLoginWithFacebook
    this.willGetFacebookProfile = willGetFacebookProfile
    this.willSignUp = willSignUp
    this.willLogin = willLogin
    this.willLogout = willLogout
    this.willResetPasswordViaEmail = willResetPasswordViaEmail
    this.willUpdatePassword = willUpdatePassword
    this.willUpdatePasswordByToken = willUpdatePasswordByToken
    this.willUpdateEmail = willUpdateEmail
    this.willSendVerificationForUpdateEmail = willSendVerificationForUpdateEmail
    this.willUpdateEmailByToken = willUpdateEmailByToken
    this.willInstallAndAuthen = willInstallAndAuthen
    this.willCreateUser = willCreateUser

    // Notification service
    this.notificationService = require('../notification/controller').services
    // event hook service
    this.userEventHookService = require('./user-event-hook')(config, this.notificationService)
  }
}

module.exports = nap
