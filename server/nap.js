const { willSignUpWithFacebookAndEmail, willLoginWithFacebook, willGetFacebookProfile } = require('./authen-facebook')
const { willLinkWithFacebook, willUnlinkFromFacebook } = require('./authen-link')
const { willSignUp, willLogin, willLogout, willResetPasswordViaEmail, willSendVerificationForUpdateEmail, willChallengeEmail } = require('./authen-local')
const { willUpdatePassword, willUpdatePasswordByToken, willUpdateEmail, willVerifyEmailByToken } = require('./authen-local-passport')
const { willInstallAndAuthen, loginWithFacebook, signUpWithFacebookAndEmail } = require('./graphql/resolvers')
const { willCreateUser, willDeleteUser } = require('./authen-sessions')
const { decodeToken } = require('./jwt-token')
const config = require('./config')

class nap {
  constructor () {
    // Core
    this.session = null
    this.errors = []

    this.willLinkWithFacebook = willLinkWithFacebook
    this.willUnlinkFromFacebook = willUnlinkFromFacebook

    // export for content can login with facebook by himself
    this.loginWithFacebook = loginWithFacebook
    this.signUpWithFacebookAndEmail = signUpWithFacebookAndEmail

    this.willLoginWithFacebook = willLoginWithFacebook
    this.willSignUpWithFacebookAndEmail = willSignUpWithFacebookAndEmail
    this.willChallengeEmail = willChallengeEmail
    this.willGetFacebookProfile = willGetFacebookProfile
    this.willSignUp = willSignUp
    this.willLogin = willLogin
    this.willLogout = willLogout
    this.willResetPasswordViaEmail = willResetPasswordViaEmail
    this.willUpdatePassword = willUpdatePassword
    this.willUpdatePasswordByToken = willUpdatePasswordByToken
    this.willUpdateEmail = willUpdateEmail
    this.willSendVerificationForUpdateEmail = willSendVerificationForUpdateEmail
    this.willVerifyEmailByToken = willVerifyEmailByToken
    this.willInstallAndAuthen = willInstallAndAuthen
    this.willCreateUser = willCreateUser
    this.willDeleteUser = willDeleteUser
    this.decodeToken = decodeToken

    // Notification service
    this.notificationService = require('../notification/controller').services
    // event hook service
    this.userEventHookService = require('./user-event-hook')(config, this.notificationService)
  }
}

module.exports = nap
