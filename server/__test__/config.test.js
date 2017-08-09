/* eslint-env jest */

process.env.MAILGUN_API_KEY = 'FOO_MAILGUN_API_KEY'
process.env.MAILGUN_DOMAIN = 'BAR_MAILGUN_DOMAIN'

process.env.BASE_URL = 'http://127.0.0.1:8080'

process.env.AUTH_LOCAL_URI = 'http://localhost:4000/auth/local'
process.env.AUTH_RESET_URI = 'http://localhost:4000/auth/reset'
process.env.AUTH_NEW_RESET_URI = 'http://localhost:4000/auth/reset'
process.env.AUTH_VERIFIED_URI = 'http://localhost:4000/auth/verified'

const config = require('../config')

describe('config', () => {
  it('should return config', () => {
    expect(config).toMatchSnapshot()
  })
})
