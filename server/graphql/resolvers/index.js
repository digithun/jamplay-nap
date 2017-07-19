const willInstallAndAuthen = async (args, user, provider) => {
  // Guard
  const { guard } = require('../../errors')
  guard({ user })

  // Link
  const { willInstall } = require('./InstallationResolver')
  const { willAuthen } = require('./AuthenResolver')
  const installation = await willInstall(args)
  return willAuthen(installation.id, user, provider)
}

module.exports = {
  willInstallAndAuthen
}
