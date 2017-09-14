const { willLoginWithFacebook, willGetFacebookProfile } = require('./authen-facebook')
const { willLinkWithFacebook, willUnlinkFromFacebook } = require('./authen-link')
const { willSignUp, willLogin, willLogout, willResetPasswordViaEmail } = require('./authen-local')
const { willUpdatePassword, willUpdatePasswordByToken, willUpdateEmail } = require('./authen-local-passport')
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
    this.willInstallAndAuthen = willInstallAndAuthen
    this.willCreateUser = willCreateUser

    // event hook service
    this.userEventHookService = require('./user-event-hook')(config)
    // Notification service
    this.notificationService = require('../notification/controller').services
  }
}

module.exports = nap
