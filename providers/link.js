const { guard } = require('../server/errors')

const willLinkWithFacebook = async (user, profile, token) => {
  // Guard
  guard({ user })
  guard({ profile })
  guard({ token })

  return willLink('facebook', user, profile)
}

const willLink = async (provider, user, profile, token) => {
  // Guard
  guard({ provider })
  guard({ user })
  guard({ profile })
  guard({ token })

  // Consume
  const { id } = provider

  // User should have email
  if (!user.email) throw require('../server/errors/codes').AUTH_INVALID_EMAIL

  // Email should be verified
  if (!user.emailVerified) throw require('../server/errors/codes').AUTH_EMAIL_NOT_VERIFIED

  // Already link to current user?
  if (id) throw require('../server/errors/codes').AUTH_PROVIDER_ALREADY_LINKED

  // Already link to other user?
  const linkedAccount = await NAP.User.findOne({ [[provider] + '.id']: id })
  if (linkedAccount) throw require('../server/errors/codes').AUTH_CREDENTIAL_ALREADY_IN_USE

  // Link
  user.facebook = new NAP.Provider({
    id,
    token,
    profile
  })
  await user.save()

  return user
}

module.exports = { willLinkWithFacebook, willLink }
