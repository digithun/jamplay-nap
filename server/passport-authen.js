const { guard, errorBy } = require('./errors')
const AUTH_PASSPORT_FAILED = require('./errors/codes').AUTH_PASSPORT_FAILED

const willAuthenWithPassport = (strategy, req) =>
  new Promise((resolve, reject) => {
    const passport = require('passport')
    // @ts-ignore
    passport.authenticate(strategy, (err, payload) => {
      // Error?
      if (err) {
        return reject(err)
      }

      switch (strategy) {
        case 'local':
          return payload ? resolve(payload) : reject(AUTH_PASSPORT_FAILED)
        default:
          const { email } = payload
          guard({ email })

          // Will find someone that has this email and update token
          const user = NAP.User
            .findOneAndUpdate(
            {
              email
            },
              payload,
              { new: true, upsert: true }
            )
            .catch(err => {
              reject(errorBy('AUTH_PASSPORT_FAILED', err.message))
            })

          // User?
          return user ? resolve(user) : reject(AUTH_PASSPORT_FAILED)
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

module.exports = { willAuthenWithPassport, willGetProfileWithPassport }
