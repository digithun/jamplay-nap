/* eslint-env jest */
process.env.MAILGUN_API_KEY = 'FOO_MAILGUN_API_KEY'
process.env.MAILGUN_DOMAIN = 'BAR_MAILGUN_DOMAIN'

require('../debug')

describe('authen-facebook', () => {
  it('should throw error when no FACEBOOK_APP_ID, FACEBOOK_APP_SECRET provide', async () => {
    delete process.env.FACEBOOK_APP_ID
    delete process.env.FACEBOOK_APP_SECRET

    const authen = require('../authen-facebook')
    await authen.willLoginWithFacebook().catch(err => {
      process.env.FACEBOOK_APP_ID = 'FOO_FACEBOOK_APP_ID'

      expect(() => {
        throw err
      }).toThrow('Required : FACEBOOK_APP_ID')
    })

    await authen.willLoginWithFacebook().catch(err => {
      expect(() => {
        throw err
      }).toThrow('Required : FACEBOOK_APP_SECRET')
    })
  })

  it('should login with Facebook and return user', async () => {
    process.env.FACEBOOK_APP_ID = 'FOO_FACEBOOK_APP_ID'
    process.env.FACEBOOK_APP_SECRET = 'BAR_FACEBOOK_APP_SECRET'

    // stub
    global.NAP = {}
    NAP.User = {
      findOneAndUpdate: jest.fn().mockImplementationOnce(async () => ({
        _id: '58d0e20e7ff032b39c2a9a18',
        name: 'bar',
        email: 'foo@bar.com'
      }))
    }

    const authen = require('../authen-facebook')
    const accessToken = 'FOO_BAR_TOKEN'
    const user = await authen.willLoginWithFacebook({ body: {} }, accessToken)

    expect(user).toMatchSnapshot()
  })

  it('should not login with Facebook and return error for wrong token', async () => {
    process.env.FACEBOOK_APP_ID = 'FOO_FACEBOOK_APP_ID'
    process.env.FACEBOOK_APP_SECRET = 'BAR_FACEBOOK_APP_SECRET'

    const authen = require('../authen-facebook')
    const accessToken = 'WRONG_ACCESS_TOKEN'
    const user = await authen.willLoginWithFacebook({ body: {}, nap: { errors: [] } }, accessToken).catch(err => {
      expect(() => {
        throw err
      }).toThrow(require('../errors/codes').AUTH_FACEBOOK_INVALID_TOKEN)
    })
  })

  it('should attach current user from session token after authenticate', async () => {
    const { authenticate, createSessionToken } = require('../jwt-token')
    const installationId = '58d119431e2107009b2cad55'
    const userId = '58d0e20e7ff032b39c2a9a18'
    const sessionToken = createSessionToken(installationId, userId)
    const req = { token: sessionToken, nap: {} }
    await authenticate(req, {}, () => {
      expect(req.nap.session).toEqual(
        expect.objectContaining({
          userId: expect.any(String),
          installationId: expect.any(String),
          createdAt: expect.any(String),
          expireAt: expect.any(String)
        })
      )
    })
  })

  it('should create session token', () => {
    const { createSessionToken } = require('../jwt-token')
    const installationId = '58d119431e2107009b2cad55'
    const userId = '58d0e20e7ff032b39c2a9a18'
    const sessionToken = createSessionToken(installationId, userId)

    expect(sessionToken).toBeDefined()
  })

  it('should not attach current user to nap from wrong session token after authenticate', async () => {
    const { authenticate } = require('../jwt-token')
    const sessionToken = 'WRONG_TOKEN'
    const req = { token: sessionToken, nap: { errors: [] } }

    await authenticate(req, {}, () => {
      // Should be no user
      expect(req.nap.session).toBeNull()

      // Expected : JsonWebTokenError { name: 'JsonWebTokenError', message: 'jwt malformed' }
      expect(req.nap).toMatchSnapshot()
    }).catch(err => {
      expect(err).toMatchSnapshot()
    })
  })
})
