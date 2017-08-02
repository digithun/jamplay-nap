/* eslint-env jest */

process.env.MAILGUN_API_KEY = 'FOO_MAILGUN_API_KEY'
process.env.MAILGUN_DOMAIN = 'BAR_MAILGUN_DOMAIN'
process.env.PASSWORD_RESET_BASE_URL = 'http://localhost:3000'
process.env.VERIFIED_URL = '/auth/verified'

const config = require('../config')

describe('config', () => {
  it('should return config', () => {
    expect(config).toMatchSnapshot()
  })
})
