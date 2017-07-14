const willInstall = async device => await NAP.Installation.create(device)

const _willUpdateField = async (installationId, fieldObject) =>
  await NAP.Installation.findOneAndUpdate(
    { installationId }, // Find
    fieldObject, // Update
    { new: true, upsert: false } // Options
  )

const willUpdateField = field => async ({ context, args }) => {
  if (!context.nap.session) { throw require('../../errors/commons').NAP_SESSION_NOT_FOUND }

  const installation = await _willUpdateField(
    context.nap.session.installationId,
    { [field]: args[field] }
  )
  if (!installation) { throw require('../../errors/commons').NAP_INSTALLATION_NOT_FOUND }
  return installation
}

module.exports = { willInstall, willUpdateField }
