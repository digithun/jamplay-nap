const { AUTH_PASSPORT_FAILED, AUTH_CREDENTIAL_ALREADY_IN_USE } = require('./errors/codes')

const _willCreateUserWithPayload = async (provider, payload, req) => {
  const { profile, token } = payload[provider]

  // Guard used email -> auto link
  const { email } = payload
  const emailUser = await NAP.User.findOne({ email, emailVerified: true })
  if (emailUser) {
    const { willGetFacebookProfile } = require('./authen-facebook')
    const { willLinkWithFacebook } = require('./authen-link')

    const profile = await willGetFacebookProfile(req, token)
    return willLinkWithFacebook(emailUser, profile, token)
  }

  // Already linked or any Facebook user, will let user login
  const user = await NAP.User.findOne({ [`${provider}.id`]: profile.id })
  if (user) return user

  // Already register but not verify, will update
  const unverifiedUser = await NAP.User.findOneAndUpdate({ email, emailVerified: false }, payload)
  if (unverifiedUser) return unverifiedUser

  // Create new user
  const { willCreateUser } = require('./authen-sessions')
  return willCreateUser(payload)
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
          return _willCreateUserWithPayload('facebook', payload, req).then(resolve).catch(reject)
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
