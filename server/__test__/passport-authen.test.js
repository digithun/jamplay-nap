/* eslint-env jest */
const mongoose = require('mongoose')

process.env.FACEBOOK_APP_ID = '113587919136550'
process.env.FACEBOOK_APP_SECRET = '149ac8dcc38afe95decf442fc4e63ec8'

// Seeder
const { setup, teardown, seedVerifiedLocalUser, getMockedFacebookUser, seedFacebookUser, EMAIL } = require('./mongoose-helper')

describe('passport-authen', async () => {
  beforeAll(setup)
  afterAll(teardown)

  it('should allow user to login if matched provider id has been found', async () => {
    // Seed
    await seedFacebookUser()

    // Mock
    const provider = 'facebook'
    const payload = {
      name: 'foo',
      email: 'not-foo@bar.com',
      facebook: getMockedFacebookUser()
    }
    const req = {
      body: {
        access_token: 'VALID_ACCESS_TOKEN'
      }
    }
    const { _willCreateUserWithPayload } = require('../passport-authen').__private
    const user = await _willCreateUserWithPayload(provider, payload, req)

    expect(user).toEqual(
      expect.objectContaining({
        email: EMAIL,
        emailVerified: true,
        facebook: expect.objectContaining({
          id: payload.facebook.id
        })
      })
    )

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should link and allow user to login if matched email has been found', async () => {
    // Seed
    await seedVerifiedLocalUser()

    // Mock
    const provider = 'facebook'
    const payload = {
      name: 'foo',
      email: EMAIL,
      facebook: getMockedFacebookUser()
    }
    const req = {
      body: {
        access_token: 'VALID_ACCESS_TOKEN'
      }
    }
    const { _willCreateUserWithPayload } = require('../passport-authen').__private
    const user = await _willCreateUserWithPayload(provider, payload, req)

    expect(user).toEqual(
      expect.objectContaining({
        email: EMAIL,
        emailVerified: true,
        facebook: expect.objectContaining({
          id: payload.facebook.id
        })
      })
    )

    // Dispose
    await mongoose.connection.collection('users').drop()
  })
})
