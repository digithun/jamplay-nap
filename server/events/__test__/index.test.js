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

const Mitt = require('mitt')

describe('events', () => {
  beforeAll(setup)
  afterAll(teardown)

  it('should emit USER_SIGNUP_WITH_EMAIL', async done => {
    // mock
    const userData = {
      unverifiedEmail: EMAIL,
      emailVerified: true
    }
    const req = {
      nap: {
        emitter: new Mitt(),
        errors: [],
        willChallengeEmail: async () => userData
      },
      body: { isMockServer: true }
    }

    // Watch
    const { USER_SIGNUP_WITH_EMAIL } = require('../')
    req.nap.emitter.on(USER_SIGNUP_WITH_EMAIL, async payload => {
      expect(payload.req).toBeDefined()
      expect(payload.user).toEqual(
        expect.objectContaining({
          unverifiedEmail: EMAIL,
          emailVerified: false
        })
      )

      // Dispose
      await mongoose.connection.collection('users').drop()
      done()
    })

    // trigger
    const password = 'foobar'
    const { willSignUp } = require('../../authen-local')
    await willSignUp(req, EMAIL, password)
  })

  it('should emit USER_VERIFIED_BY_EMAIL', async done => {
    const { auth_local_token } = require('../../authen-local-passport').handler

    const unverifiedEmail = `foo@bar.com`
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

    // Watch
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

  it('should emit USER_SIGNUP_WITH_FACEBOOK_AND_EMAIL', async done => {
    const unverifiedEmail = `foo@bar.com`
    const token = 'VALID_TOKEN'

    const req = {
      params: { token },
      body: { isMockServer: true },
      nap: {
        emitter: new Mitt(),
        errors: []
      }
    }

    // Watch
    const { USER_SIGNUP_WITH_FACEBOOK_AND_EMAIL } = require('../')
    req.nap.emitter.on(USER_SIGNUP_WITH_FACEBOOK_AND_EMAIL, async payload => {
      expect(payload.req).toBeDefined()
      expect(payload.user).toEqual(
        expect.objectContaining({
          unverifiedEmail,
          emailVerified: false
        })
      )

      // Dispose
      await mongoose.connection.collection('users').drop()
      done()
    })

    process.env.FACEBOOK_APP_ID = 'FOO_FACEBOOK_APP_ID'
    process.env.FACEBOOK_APP_SECRET = 'BAR_FACEBOOK_APP_SECRET'

    const { willSignUpWithFacebookAndEmail } = require('../../authen-facebook')
    const accessToken = 'EMAIL_NOT_ALLOW_ACCESS_TOKEN'
    const email = 'foo@bar.com'
    await willSignUpWithFacebookAndEmail(req, accessToken, email)
  })

  it('should emit USER_VERIFIED_BY_FACEBOOK_AND_EMAIL', async done => {
    const { auth_local_token } = require('../../authen-local-passport').handler

    const unverifiedEmail = `foo@bar.com`
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

    // Watch
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

  it('should emit USER_SIGNUP_WITH_FACEBOOK', async done => {
    const email = EMAIL
    const token = 'VALID_TOKEN'

    const req = {
      params: { token },
      body: { isMockServer: true },
      nap: {
        emitter: new Mitt(),
        errors: []
      }
    }

    // Watch
    const { USER_SIGNUP_WITH_FACEBOOK } = require('../')
    req.nap.emitter.on(USER_SIGNUP_WITH_FACEBOOK, async payload => {
      expect(payload.req).toBeDefined()
      expect(payload.user).toEqual(
        expect.objectContaining({
          email,
          emailVerified: true,
          emailVerifiedAt: expect.any(Date)
        })
      )

      // Dispose
      await mongoose.connection.collection('users').drop()
      done()
    })

    process.env.FACEBOOK_APP_ID = 'FOO_FACEBOOK_APP_ID'
    process.env.FACEBOOK_APP_SECRET = 'BAR_FACEBOOK_APP_SECRET'

    const { willLoginWithFacebook } = require('../../authen-facebook')
    const accessToken = 'FOO_BAR_TOKEN'
    await willLoginWithFacebook(req, accessToken)
  })

  it('should emit USER_VERIFIED_BY_FACEBOOK', async done => {
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

    // Watch
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
