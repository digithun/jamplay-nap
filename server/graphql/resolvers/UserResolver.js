const { guard, onError } = require('../../errors')

// Guard
const _getUserIdFromSession = context => (context.nap.session ? context.nap.session.userId : null)
const _willGetUserFromSession = async context => {
  const userId = _getUserIdFromSession(context)

  // Guard
  if (!userId) {
    // TOFIX : onError(context)(require('../../errors/codes').AUTH_MISSING_UID)
    throw require('../../errors/codes').AUTH_MISSING_UID
  }

  return NAP.User.findById(userId).catch(onError(context))
}

const willCreateUser = async user => NAP.User.create(Object.assign(user, { role: 'user' }))
const willReadUser = async ({ context }) => _willGetUserFromSession(context)

const unlinkFromFacebook = async ({ context }) => {
  const user = await _willGetUserFromSession(context).catch(onError(context))
  return context.nap.willUnlinkFromFacebook(user).catch(onError(context))
}

const linkWithFacebook = async ({ args, context }) => {
  const user = await _willGetUserFromSession(context)
  const token = args.accessToken
  const profile = await context.nap.willGetFacebookProfile(context, token).catch(onError(context))
  return context.nap.willLinkWithFacebook(user, profile, token).catch(onError(context))
}

const changeEmail = async ({ args, context }) => {
  const user = await _willGetUserFromSession(context)

  // Guard
  const is = require('is_js')
  if (is.not.email(args.email)) {
    throw require('../../errors/codes').AUTH_INVALID_EMAIL
  }

  if (user) {
    user.email = args.email
    await user.save()
  }

  return user
}

const forget = async ({ context, args }) => context.nap.willResetPassword(context, args.email).catch(onError(context))

const resetPassword = async ({ context, args }) => context.nap.willChangePasswordByToken(args.email, args.token).catch(onError(context))

module.exports = {
  willCreateUser,
  user: willReadUser,
  linkWithFacebook,
  unlinkFromFacebook,
  changeEmail,
  forget,
  resetPassword
}
