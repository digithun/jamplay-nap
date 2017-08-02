const { guard, onError } = require('../../errors')

// Guard
const _getUserIdFromSession = session => (session ? session.userId : null)
const _willGetUserFromSession = async context => {
  const { session } = context.nap
  const userId = _getUserIdFromSession(session)

  // Guard
  if (!userId) {
    // TOFIX : onError(context)(require('../../errors/codes').AUTH_MISSING_UID)
    throw require('../../errors/codes').AUTH_MISSING_UID
  }

  // Expire?
  const { validateSession } = require('../../../server/authen-sessions')
  validateSession(session)

  // User
  return NAP.User.findById(userId).catch(onError(context))
}

const willCreateUser = async user => NAP.User.create(Object.assign(user, { role: 'user' }))
const willReadUser = async ({ context }) => _willGetUserFromSession(context)

const unlinkFromFacebook = async ({ context }) => {
  const user = await _willGetUserFromSession(context).catch(onError(context))
  return context.nap.willUnlinkFromFacebook(user).catch(onError(context))
}

const linkWithFacebook = async ({ args, context }) => {
  const user = await _willGetUserFromSession(context).catch(onError(context))
  const token = args.accessToken
  const profile = await context.nap.willGetFacebookProfile(context, token).catch(onError(context))
  return context.nap.willLinkWithFacebook(user, profile, token).catch(onError(context))
}

const updateEmail = async ({ args, context }) => {
  const user = await _willGetUserFromSession(context)
  const { email } = args
  guard({ email })

  return context.nap.willUpdateEmail(user, email)
}

const forget = async ({ context, args }) => context.nap.willResetPasswordViaEmail(context, args.email).catch(onError(context))

const updatePassword = async ({ context, args }) => context.nap.willUpdatePasswordByToken(args.token, args.password).catch(onError(context))

module.exports = {
  willCreateUser,
  user: willReadUser,
  linkWithFacebook,
  unlinkFromFacebook,
  updateEmail,
  forget,
  updatePassword
}
