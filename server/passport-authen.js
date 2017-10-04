const { AUTH_PASSPORT_FAILED, AUTH_CREDENTIAL_ALREADY_IN_USE } = require('./errors/codes')

const _willCreateUserWithPayload = async (provider, payload) => {
  const { profile } = payload[provider]

  // Guard used provider -> not allow
  const providerUser = await NAP.User.findOne({ [`${provider}.id`]: profile.id })
  if (providerUser) throw AUTH_CREDENTIAL_ALREADY_IN_USE

  // Guard used email -> ask to login and link
  const { email } = payload
  const emailUser = await NAP.User.findOne({ email, emailVerified: true })
  if (emailUser) throw AUTH_CREDENTIAL_ALREADY_IN_USE

  // Create new user
  return NAP.User.create(payload, { new: true, upsert: true })
}

const willAuthenWithPassport = (strategy, req) =>
  new Promise((resolve, reject) => {
    const passport = require('passport')
    // @ts-ignore
    passport.authenticate(strategy, (err, payload) => {
      // Error?
      if (err) return reject(err)

      switch (strategy) {
        case 'local':
          return payload ? resolve(payload) : reject(AUTH_PASSPORT_FAILED)
        case 'facebook-token':
          return _willCreateUserWithPayload('facebook', payload).then(resolve).catch(reject)
        default:
          return reject(AUTH_PASSPORT_FAILED)
      }
    })(req)
  })

const willGetProfileWithPassport = (provider, strategy, req) =>
  new Promise((resolve, reject) => {
    const passport = require('passport')

    // Guard : Not support local
    if (strategy === 'local') {
      throw Error('Not support local strategy')
    }

    // @ts-ignore
    passport.authenticate(strategy, (err, payload) => {
      // Error?
      if (err) {
        try {
          return reject(new Error(JSON.parse(err.oauthError.data).error.message))
        } catch (err) {
          // Ignore wrong error format
        }

        return reject(err)
      }

      // Payload?
      const { profile } = payload[provider]
      return profile ? resolve(profile) : reject(require('./errors/codes').AUTH_PASSPORT_FAILED)
    })(req)
  })

const __private = { _willCreateUserWithPayload }
module.exports = { willAuthenWithPassport, willGetProfileWithPassport, __private }
