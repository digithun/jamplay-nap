/* eslint-env jest */
const passport = jest.genMockFromModule('passport')

passport.authenticate = (strategy, callback) => {
  switch (strategy) {
    case 'local':
      return req => {
        if (!req.body.email || !req.body.password) {
          callback(require('../errors/codes').AUTH_WRONG_PASSWORD, null)
        } else {
          callback(null, { _id: '58d0e20e7ff032b39c2a9a18', name: 'bar', email: 'foo@bar.com' })
        }
      }
    case 'facebook-token':
      return req => {
        if (req.body.access_token === 'WRONG_ACCESS_TOKEN') {
          callback(require('../errors/codes').AUTH_FACEBOOK_INVALID_TOKEN, null)
        } else {
          callback(null, { _id: '58d0e20e7ff032b39c2a9a18', name: 'bar', email: 'foo@bar.com' })
        }
      }
  }
}

module.exports = passport
