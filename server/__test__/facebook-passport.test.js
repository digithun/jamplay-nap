/* eslint-env jest */

// Seeder
const { setup, teardown, seedVerifiedLocalUser, getMockedFacebookUser } = require('./mongoose-helper')

describe('passport-authen', async () => {
  beforeAll(setup)
  afterAll(teardown)

  it('should not allow to signup if local user exists', async () => {
    // Seed
    const _user = await seedVerifiedLocalUser()

    // Test
    const { AUTH_CREDENTIAL_ALREADY_IN_USE } = require('../errors/codes')
    const provider = 'facebook'
    const payload = {
      name: 'foo',
      email: _user.email,
      facebook: getMockedFacebookUser()
    }
    const { _willCreateUserWithPayload } = require('../passport-authen').__private
    await _willCreateUserWithPayload(provider, payload).catch(err =>
      expect(() => {
        throw err
      }).toThrow(AUTH_CREDENTIAL_ALREADY_IN_USE.message)
    )
  })
})
