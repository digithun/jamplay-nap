const { guard } = require('../server/errors')

const _willLink = async (provider, user, profile, token) => {
  // Guard
  guard({ provider })
  guard({ user })
  guard({ profile })
  guard({ token })

  // User should have email
  if (!user.email) throw require('../server/errors/codes').AUTH_INVALID_EMAIL

  // Email should be verified
  if (!user.emailVerified) throw require('../server/errors/codes').AUTH_EMAIL_NOT_VERIFIED

  // Already link to current user?
  const current_user_provider_id = user[provider] && user[provider].id
  if (current_user_provider_id) throw require('../server/errors/codes').AUTH_PROVIDER_ALREADY_LINKED

  // Already link to other user?
  const profile_id = profile.id
  guard({ profile_id })

  const linkedAccount = await NAP.User.findOne({ [[provider] + '.id']: profile_id })
  if (linkedAccount) throw require('../server/errors/codes').AUTH_CREDENTIAL_ALREADY_IN_USE

  // Link
  user.facebook = new NAP.Provider({
    id: profile_id,
    token,
    profile
  })
  await user.save()

  return user
}

const _willUnlink = async (provider, user) => {
  // Guard
  guard({ user })
  guard({ provider })

  // Unlink
  user[provider] = undefined
  await user.save()

  // Ensure return null instead of undefined
  delete user[provider]
  return user
}

const willLinkWithFacebook = async (user, profile, token) => _willLink('facebook', user, profile, token)

const willUnlinkFromFacebook = async user => _willUnlink('facebook', user)

module.exports = { willLinkWithFacebook, willUnlinkFromFacebook }
