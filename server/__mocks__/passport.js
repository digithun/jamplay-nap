/* eslint-env jest */
const passport = jest.genMockFromModule('passport')
passport.authenticate = (strategy, callback) => {
  switch (strategy) {
    case 'local':
      return req => {
        if (!req.body.email || !req.body.password) {
          callback(require('../errors/codes').AUTH_WRONG_PASSWORD, null)
        } else {
          if (req.body.isMockServer) {
            const { validateLocalStrategy } = require('../authen-local-passport')
            validateLocalStrategy(req.body.email, req.body.password, callback)
          } else {
            callback(null, { _id: '58d0e20e7ff032b39c2a9a18', name: 'bar', email: 'foo@bar.com' })
          }
        }
      }
    case 'facebook-token':
      return req => {
        if (req.body.access_token === 'WRONG_ACCESS_TOKEN') {
          callback(require('../errors/codes').AUTH_FACEBOOK_INVALID_TOKEN, null)
        } else if (req.body.access_token === 'EMAIL_NOT_ALLOW_ACCESS_TOKEN') {
          const { getMockedFacebookUser } = require('../__test__/mongoose-helper')

          callback(null, {
            _id: '58d0e20e7ff032b39c2a9a18',
            name: 'bar',
            facebook: getMockedFacebookUser(req.body.access_token)
          })
        } else {
          const { getMockedFacebookUser } = require('../__test__/mongoose-helper')
          const facebook = getMockedFacebookUser(req.body.access_token)

          callback(null, {
            _id: '58d0e20e7ff032b39c2a9a18',
            name: 'bar',
            email: 'foo@bar.com',
            facebook
          })
        }
      }
  }
}

module.exports = passport
