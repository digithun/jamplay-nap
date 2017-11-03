/* eslint-env jest */

process.env.MAILGUN_API_KEY = 'FOO_MAILGUN_API_KEY'
process.env.MAILGUN_DOMAIN = 'BAR_MAILGUN_DOMAIN'

process.env.BASE_URL = 'http://127.0.0.1:8080'

process.env.AUTH_LOCAL_URI = 'http://localhost:4000/auth/local'
process.env.AUTH_RESET_URI = 'http://localhost:4000/auth/reset'
process.env.AUTH_NEW_RESET_URI = 'http://localhost:4000/auth/reset'
process.env.AUTH_VERIFIED_URI = 'http://localhost:4000/auth/verified'

process.env.STATIC_RESOLVE_URL = 'foo'
process.env.SHARE_IMAGE_SERVICE_URL = 'bar'
process.env.SHARE_IMAGE_SERVICE_API_KEY = 'baz'
process.env.OPTICS_API_KEY = 'bas'

process.env.SESSIONS_TTL = 0

const config = require('../config')

describe('config', () => {
  it('should return config', () => {
    expect(config).toMatchSnapshot()
  })
})
