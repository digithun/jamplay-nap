/* eslint-env jest */

process.env.MAILGUN_API_KEY = 'FOO_MAILGUN_API_KEY'
process.env.MAILGUN_DOMAIN = 'BAR_MAILGUN_DOMAIN'

const mongoose = require('mongoose')

// Seeder
const {
  setup,
  teardown,
  seedUserWithData,
  seedFacebookNoEmailWithUnverifiedEmailUser,
  getMockedFacebookUser,
  EMAIL
} = require('../../__test__/mongoose-helper')

describe('events', () => {
  beforeAll(setup)
  afterAll(teardown)

  it('should emit USER_VERIFIED_BY_EMAIL', async done => {
    const { auth_local_token } = require('../../authen-local-passport').handler
    const Mitt = require('mitt')

    const unverifiedEmail = `foo@gmail.com`
    const email = `foo+lc.${+new Date()}@gmail.com`
    const password = 'foobar'
    const token = 'VALID_TOKEN'

    const req = {
      params: { token },
      nap: {
        emitter: new Mitt(),
        errors: []
      },
      body: { isMockServer: true }
    }

    await seedUserWithData({
      email,
      password,
      token,
      emailVerified: false,
      unverifiedEmail
    })

    // Watch for USER_VERIFIED_BY_EMAIL
    const { USER_VERIFIED_BY_EMAIL } = require('../')
    req.nap.emitter.on(USER_VERIFIED_BY_EMAIL, async payload => {
      expect(payload.req).toBeDefined()
      expect(payload.user).toEqual(
        expect.objectContaining({
          email: unverifiedEmail,
          emailVerified: true
        })
      )

      // Dispose
      await mongoose.connection.collection('users').drop()
      done()
    })

    // Execute
    auth_local_token(req, { redirect: () => {} })
  })

  it('should emit USER_VERIFIED_BY_FACEBOOK_AND_EMAIL', async done => {
    const { auth_local_token } = require('../../authen-local-passport').handler
    const Mitt = require('mitt')

    const unverifiedEmail = `foo@gmail.com`
    const email = `foo+fb.${+new Date()}@gmail.com`
    const token = 'VALID_TOKEN'

    const req = {
      params: { token },
      nap: {
        emitter: new Mitt(),
        errors: []
      },
      body: { isMockServer: true }
    }

    // Seed
    await seedFacebookNoEmailWithUnverifiedEmailUser({
      token,
      unverifiedEmail,
      email
    })

    // Watch for USER_VERIFIED_BY_EMAIL
    const { USER_VERIFIED_BY_FACEBOOK_AND_EMAIL } = require('../')
    req.nap.emitter.on(USER_VERIFIED_BY_FACEBOOK_AND_EMAIL, async payload => {
      expect(payload.req).toBeDefined()
      expect(payload.user).toEqual(
        expect.objectContaining({
          email: unverifiedEmail,
          emailVerified: true
        })
      )

      // Dispose
      await mongoose.connection.collection('users').drop()
      done()
    })

    // Execute
    auth_local_token(req, { redirect: () => {} })
  })

  it('should emit USER_VERIFIED_BY_FACEBOOK', async done => {
    const Mitt = require('mitt')

    // Mock
    const provider = 'facebook'
    const payload = {
      name: 'foo',
      email: EMAIL,
      facebook: getMockedFacebookUser('VALID_ACCESS_TOKEN')
    }

    const token = 'VALID_TOKEN'

    const req = {
      params: { token },
      nap: {
        emitter: new Mitt(),
        errors: []
      },
      body: { isMockServer: true, access_token: 'VALID_ACCESS_TOKEN' }
    }

    // Watch for USER_VERIFIED_BY_EMAIL
    const { USER_VERIFIED_BY_FACEBOOK } = require('../')
    req.nap.emitter.on(USER_VERIFIED_BY_FACEBOOK, async payload => {
      expect(payload.req).toBeDefined()
      expect(payload.user).toEqual(
        expect.objectContaining({
          email: EMAIL,
          emailVerified: true
        })
      )

      // Dispose
      await mongoose.connection.collection('users').drop()
      done()
    })

    const { _willCreateUserWithPayload } = require('../../passport-authen').__private
    await _willCreateUserWithPayload(provider, payload, req)
  })
})
