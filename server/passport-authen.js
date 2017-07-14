const willAuthenWithPassport = (strategy, req) =>
  new Promise((resolve, reject) => {
    const passport = require('passport')
    // @ts-ignore
    passport.authenticate(strategy, (err, user) => {
      // Error?
      if (err) {
        return reject(err)
      }

      // User?
      return user
        ? resolve(user)
        : reject(require('./errors/codes').AUTH_PASSPORT_FAILED)
    })(req)
  })

module.exports = { willAuthenWithPassport }
