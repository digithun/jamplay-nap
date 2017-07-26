const { guard, onError } = require('../../errors')

// Guard
const _getUserIdFromSession = context => (context.nap.session ? context.nap.session.userId : null)
const _willGetUserFromSession = async context => {
  const userId = _getUserIdFromSession(context)

  // Guard
  if (!userId) {
    throw require('../../errors/codes').AUTH_MISSING_UID
  }

  return NAP.User.findById(userId).catch(onError(context))
}

const willCreateUser = async user => NAP.User.create(Object.assign(user, { role: 'user' }))
const willReadUser = async ({ context }) => _willGetUserFromSession(context)

const unlinkFromFacebook = async ({ context }) => {
  const user = await _willGetUserFromSession(context)
  return unlinkUserFromProvider(user, 'facebook')
}

const unlinkUserFromProvider = async (user, provider) => {
  // Guard
  guard({ user })
  guard({ provider })

  // Unlink
  delete user[provider]
  await user.save()

  return user
}

const linkWithFacebook = async ({ args, context }) => {
  const user = await _willGetUserFromSession(context)
  const profile = await context.nap.willGetFacebookProfile(context, args.accessToken).catch(onError(context))
  return context.nap.willLinkWithFacebook(user, profile, args.accessToken)
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
