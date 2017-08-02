const SESSIONS_TTL = require('./config').sessions_ttl
const validateSession = async ({ expireAt }) => {
  // Guard
  const { guard } = require('./errors')
  guard({ expireAt })

  // No expire limit?
  if (SESSIONS_TTL === -1 || expireAt === -1) {
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

module.exports = { validateSession }
