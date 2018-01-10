const { AUTH_PASSPORT_FAILED } = require('./errors/codes')

const _willCreateUserWithPayload = async (provider, payload, req) => {
  const { profile, token } = payload[provider]

  // Already linked or any Facebook user, will let user login
  const user = await NAP.User.findOne({ [`${provider}.id`]: profile.id })
  if (user) return user

  // Guard used email -> auto link
  const { email } = payload
  const emailUser = await NAP.User.findOne({ email, emailVerified: true })
  if (emailUser) {
    const { willGetFacebookProfile } = require('./authen-facebook')
    const { willLinkWithFacebook } = require('./authen-link')

    const profile = await willGetFacebookProfile(req, token)
    return willLinkWithFacebook(emailUser, profile, token)
  }

  // Already register but not verify, will update
  const unverifiedUser = await NAP.User.findOneAndUpdate({ email, emailVerified: { $ne: true } }, payload)
  if (unverifiedUser) return unverifiedUser

  // Create new user
  const { willCreateUser } = require('./authen-sessions')
  return willCreateUser(payload)
}

const _willCreateUnverifiedUserWithPayload = async (provider, payload) => {
  const { unverifiedEmail } = payload

  // Email already use and verified
  const emailUser = await NAP.User.findOne({ email: unverifiedEmail, emailVerified: true })
  if (emailUser) {
    const { AUTH_EMAIL_ALREADY_IN_USE } = require('./errors/codes')
    throw AUTH_EMAIL_ALREADY_IN_USE
  }

  const { profile } = payload[provider]

  // Already use Facebook id, will use existing user
  const user = await NAP.User.findOne({ [`${provider}.id`]: profile.id })
  if (user) {
    if (user.emailVerified) {
      // Already verify, will throw error
      const { AUTH_EMAIL_ALREADY_IN_USE } = require('./errors/codes')
      throw AUTH_EMAIL_ALREADY_IN_USE
    } else {
      // Not verify yet, will return user and continue
      return user
    }
  }

  // Create new unverified user
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
          // Login with facebook and email
          if (req.body.custom_email) {
            payload.email = null
            delete payload.email
            payload.unverifiedEmail = req.body.custom_email.toLowerCase().trim()
            console.log(payload)
            return _willCreateUnverifiedUserWithPayload('facebook', payload).then(resolve).catch(reject)
          }

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
