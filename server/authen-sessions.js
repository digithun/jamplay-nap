const SESSIONS_TTL = require('./config').sessions_ttl
const validateSession = async ({ expireAt }) => {
  // Guard
  if (!expireAt) return false

  // No expire limit?
  if (SESSIONS_TTL === -1) {
    return true
  }

  // Expired?
  const expires = new Date(expireAt).valueOf()
  const now = new Date().valueOf()

  if (now - expires > SESSIONS_TTL) {
    throw require('./errors/codes').AUTH_USER_TOKEN_EXPIRED
  }

  // No errors
  return true
}

const listSessionByUser = async userId => {
  // Guard
  const { guard } = require('./errors')
  guard({ userId })

  return NAP.Authen.find({ userId, isLoggedIn: true }).sort({ loggedInAt: -1 })
}

const _killOldestAuthen = async userId =>
  NAP.Authen.findOneAndUpdate(
    {
      userId
    },
    {
      projection: { _id: 1 },
      isLoggedIn: false,
      sessionToken: undefined,
      loggedOutAt: new Date().toISOString()
    },
    {
      sort: { loggedInAt: -1 }
    }
  )

const willLimitAuthen = async (installationId, user, provider) => {
  // Expire oldest one
  await _killOldestAuthen(user._id)

  return willAuthen(installationId, user, provider)
}

const willAuthen = async (installationId, { _id: userId, emailVerified }, provider) => {
  // Base data
  let authenData = {
    isLoggedIn: false,
    installationId,
    userId
  }

  // Create session token
  const { createSessionToken } = require('./jwt-token')
  const sessionToken = createSessionToken(installationId, userId)

  // Guard by verifications
  switch (provider) {
    case 'local':
      // User use local strategy, but not verify by email yet.
      if (!emailVerified) {
        throw require('./errors/codes').AUTH_EMAIL_NOT_VERIFIED
      }
      break
    default:
      // User use some other provider, will do nothing.
      break
  }

  // Define authen data
  authenData = Object.assign(authenData, {
    isLoggedIn: true,
    loggedInAt: new Date().toISOString(),
    loggedInWith: provider,
    sessionToken
  })

  // Allow to authen
  return NAP.Authen.findOneAndUpdate({ installationId, userId }, authenData, {
    new: true,
    upsert: true
  })
}

const willInstall = async device => NAP.Installation.create(device)

const _getUserIdFromSession = session => (session ? session.userId : null)
const willGetUserFromSession = async context => {
  const { session } = context.nap
  const userId = _getUserIdFromSession(session)

  // Guard
  if (!userId) {
    return null
  }

  // Expire?
  const isValid = await validateSession(session)

  // User
  return isValid ? NAP.User.findById(userId) : null
}

const willCreateUser = async user => NAP.User.create(Object.assign(user, { role: 'user' }))

const willInstallAndAuthen = async (args, user, provider) => {
  // Guard
  const { guard } = require('./errors')
  guard({ user })

  // Link
  const { willInstall, willAuthen } = require('./authen-sessions')
  const installation = await willInstall(args)
  return willAuthen(installation.id, user, provider)
}

const willInstallAndLimitAuthen = async (args, user, provider) => {
  // Guard
  const { guard } = require('./errors')
  guard({ user })

  // Link
  const { willInstall, willLimitAuthen } = require('./authen-sessions')
  const installation = await willInstall(args)
  return willLimitAuthen(installation.id, user, provider)
}

module.exports = {
  validateSession,
  listSessionByUser,
  willInstall,
  willAuthen,
  willLimitAuthen,
  willGetUserFromSession,
  willCreateUser,
  willInstallAndAuthen,
  willInstallAndLimitAuthen
}
