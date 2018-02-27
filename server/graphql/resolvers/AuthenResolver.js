const { onError } = require('../../errors')

const signUpWithFacebookAndEmail = async ({ context, args }) => {
  const user = await context.nap.willSignUpWithFacebookAndEmail(context, args.accessToken, args.email).catch(onError(context))
  return user && context.nap.willChallengeEmail(user, args.email).catch(onError(context))
}

const loginWithFacebook = async ({ context, args }) => {
  const user = await context.nap.willLoginWithFacebook(context, args.accessToken).catch(onError(context))
  return user && context.nap.willInstallAndAuthen(args, user, 'facebook').catch(onError(context))
}

const login = async ({ context, args }) => {
  const user = await context.nap.willLogin(context, args.email, args.password).catch(onError(context))
  return user && context.nap.willInstallAndAuthen(args, user, 'local').catch(onError(context))
}

const signUpWithEmailAndPassword = async ({ context, args }) => context.nap.willSignUp(context, args.email, args.password).catch(onError(context))

const signup = async ({ context, args }) =>
  context.nap
    .willSignUp(context, args.record.email, args.record.password, {
      name: args.record.name,
      gender: args.record.gender,
      first_name: args.record.first_name,
      last_name: args.record.last_name,
      birthday: args.record.birthday
    })
    .catch(onError(context))

const logout = async ({ context }) => {
  // Logout from cookie
  context.logout && context.logout()
  context.session && context.session.destroy()

  // Guard
  if (!context.nap.session) {
    return {
      isLoggedIn: false,
      sessionToken: null
    }
  }

  // Logout
  return context.nap.willLogout(context.token).catch(onError(context))
}

const authen = async ({ context }) => {
  const _noAuthen = {
    isLoggedIn: false,
    sessionToken: null
  }

  // Guard
  if (!context.nap.session) {
    return _noAuthen
  }

  // Expired?
  const { willValidateSessionAndForceExpireIfNeed } = require('../../authen-sessions')
  const isValid = await willValidateSessionAndForceExpireIfNeed(context.nap.session).catch(() => {})
  if (!isValid) return _noAuthen

  const { installationId, userId } = context.nap.session
  return NAP.Authen.findOne({ userId, installationId }).catch(err => onError(context)(err) && _noAuthen)
}

module.exports = {
  signUpWithFacebookAndEmail,
  loginWithFacebook,
  signup,
  signUpWithEmailAndPassword,
  login,
  logout,
  authen
}
