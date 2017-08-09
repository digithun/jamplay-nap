const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const willDecodeSessionToken = promisify(jwt.verify)

const _willAttachSessionFromSessionToken = async req => {
  // Ensure no session
  req.nap.session = null

  // Guard : Ignore empty token
  const { token } = req
  if (!token) {
    return req
  }

  const { jwt_secret } = require('./config')
  return willDecodeSessionToken(token, jwt_secret)
}

const authenticate = (req, res, next) =>
  _willAttachSessionFromSessionToken(req).then(decoded => {
    req.nap.session = decoded
    next()
  })

const createSessionToken = (installationId, userId) => {
  const { sessions_ttl, jwt_secret } = require('./config')
  const jwt = require('jsonwebtoken')
  const expires = +new Date() + sessions_ttl
  const createdAt = new Date().toISOString()
  const expireAt = new Date(expires).toISOString()

  const sessionToken = jwt.sign(
    {
      installationId,
      userId,
      createdAt,
      expireAt
    },
    jwt_secret
  )

  return sessionToken
}

module.exports = {
  authenticate,
  createSessionToken,
  willDecodeSessionToken
}
