/* eslint-env jest */
const mongoose = require('mongoose')

// Seeder
const { setup, teardown, seedVerifiedLocalUser, getMockedFacebookUser, seedFacebookUser, EMAIL } = require('./mongoose-helper')

describe('passport-authen', async () => {
  beforeAll(setup)
  afterAll(teardown)

  it('should not allow to signup with facebook if local user exists', async () => {
    // Seed
    await seedVerifiedLocalUser()

    // Test
    const { AUTH_CREDENTIAL_ALREADY_IN_USE } = require('../errors/codes')
    const provider = 'facebook'
    const payload = {
      name: 'foo',
      email: EMAIL,
      facebook: getMockedFacebookUser()
    }
    const { _willCreateUserWithPayload } = require('../passport-authen').__private
    await _willCreateUserWithPayload(provider, payload).catch(err =>
      expect(() => {
        throw err
      }).toThrow(AUTH_CREDENTIAL_ALREADY_IN_USE.message)
    )

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should not allow to signup with facebook if facebook id has been use', async () => {
    // Seed
    await seedFacebookUser()

    // Test
    const { AUTH_CREDENTIAL_ALREADY_IN_USE } = require('../errors/codes')
    const provider = 'facebook'
    const payload = {
      name: 'foo',
      email: 'NOT_FOO@bar.com',
      facebook: getMockedFacebookUser()
    }

    const { _willCreateUserWithPayload } = require('../passport-authen').__private
    await _willCreateUserWithPayload(provider, payload).catch(err =>
      expect(() => {
        throw err
      }).toThrow(AUTH_CREDENTIAL_ALREADY_IN_USE.message)
    )

    // Dispose
    await mongoose.connection.collection('users').drop()
  })
})
