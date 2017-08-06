const { guard, onError } = require('../../errors')
const { willGetUserFromSession } = require('../../../server/authen-sessions')

const willReadUser = async ({ context }) => willGetUserFromSession(context).catch(onError(context))

const unlinkFromFacebook = async ({ context }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  return context.nap.willUnlinkFromFacebook(user).catch(onError(context))
}

const linkWithFacebook = async ({ args, context }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  const token = args.accessToken
  const profile = await context.nap.willGetFacebookProfile(context, token).catch(onError(context))
  return context.nap.willLinkWithFacebook(user, profile, token).catch(onError(context))
}

const updateEmail = async ({ args, context }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  const { email } = args
  guard({ email })

  return context.nap.willUpdateEmail(user, email).catch(onError(context))
}

const forget = async ({ context, args }) => context.nap.willResetPasswordViaEmail(context, args.email).catch(onError(context))

const updatePassword = async ({ context, args }) => context.nap.willUpdatePasswordByToken(args.token, args.password).catch(onError(context))

module.exports = {
  user: willReadUser,
  linkWithFacebook,
  unlinkFromFacebook,
  updateEmail,
  forget,
  updatePassword
}
