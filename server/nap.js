const {
  willLoginWithFacebook
} = require('./authen-facebook')

const {
  willSignUp,
  willLogin,
  willLogout,
  willResetPassword,
  signup
} = require('./authen-local')

const {
  willInstallAndAuthen
} = require('./graphql/resolvers')

const { willCreateUser } = require('./graphql/resolvers/UserResolver')

class nap {
  constructor () {
    this.session = null
    this.errors = []

    this.signup = signup
    this.willLoginWithFacebook = willLoginWithFacebook
    this.willSignUp = willSignUp
    this.willLogin = willLogin
    this.willLogout = willLogout
    this.willResetPassword = willResetPassword
    this.willInstallAndAuthen = willInstallAndAuthen
    this.willCreateUser = willCreateUser
  }
}

module.exports = nap
