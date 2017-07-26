const { willLoginWithFacebook, willGetFacebookProfile } = require('./authen-facebook')

const { willSignUp, willLogin, willLogout, willResetPassword } = require('./authen-local')

const { willChangePasswordByToken } = require('./authen-local-passport')

const { willInstallAndAuthen } = require('./graphql/resolvers')

const { willCreateUser } = require('./graphql/resolvers/UserResolver')

class nap {
  constructor () {
    this.session = null
    this.errors = []

    this.willLoginWithFacebook = willLoginWithFacebook
    this.willGetFacebookProfile = willGetFacebookProfile
    this.willSignUp = willSignUp
    this.willLogin = willLogin
    this.willLogout = willLogout
    this.willResetPassword = willResetPassword
    this.willChangePasswordByToken = willChangePasswordByToken
    this.willInstallAndAuthen = willInstallAndAuthen
    this.willCreateUser = willCreateUser
  }
}

module.exports = nap
