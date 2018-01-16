const willInstallAndAuthen = async (args, user, provider) => {
  // Guard
  const { guard } = require('../../errors')
  guard({ user })

  // Link
  const { willInstall, willAuthen } = require('../../authen-sessions')
  const installation = await willInstall(args)
  return willAuthen(installation.id, user, provider)
}

const willInstallAndLimitAuthen = async (args, user, provider) => {
  // Guard
  const { guard } = require('../../errors')
  guard({ user })

  // Link
  const { willInstall, willLimitAuthen } = require('../../authen-sessions')
  const installation = await willInstall(args)
  return willLimitAuthen(installation.id, user, provider)
}

const loginWithFacebook = require('./AuthenResolver').loginWithFacebook
const signUpWithFacebookAndEmail = require('./AuthenResolver').signUpWithFacebookAndEmail

module.exports = {
  willInstallAndAuthen,
  willInstallAndLimitAuthen,
  loginWithFacebook,
  signUpWithFacebookAndEmail
}
