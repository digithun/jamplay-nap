const { willLoginWithFacebook, willGetFacebookProfile } = require('./authen-facebook')
const { willLinkWithFacebook, willUnlinkFromFacebook } = require('./authen-link')
const { willSignUp, willLogin, willLogout, willResetPasswordViaEmail } = require('./authen-local')
const { willUpdatePasswordByToken, willUpdateEmail } = require('./authen-local-passport')
const { willInstallAndAuthen } = require('./graphql/resolvers')
const { willCreateUser } = require('./authen-sessions')

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
    this.willUpdatePasswordByToken = willUpdatePasswordByToken
    this.willUpdateEmail = willUpdateEmail
    this.willInstallAndAuthen = willInstallAndAuthen
    this.willCreateUser = willCreateUser
  }
}

module.exports = nap
