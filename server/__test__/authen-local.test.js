/* eslint-env jest */

process.env.MAILGUN_API_KEY = 'FOO_MAILGUN_API_KEY'
process.env.MAILGUN_DOMAIN = 'BAR_MAILGUN_DOMAIN'

const { errorBy } = require('../errors')

const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

// Seeder
const { setup, teardown, seedUserWithEmailAndPassword } = require('./mongoose-helper')

describe('authen-local', () => {
  beforeAll(setup)

  afterAll(teardown)

  it('should throw error if has no email and password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: {}
    }
    const email = null
    const password = null

    const { willLogin } = require('../authen-local')
    expect(willLogin(req, email, password)).rejects.toEqual(errorBy('NAP_INVALID_ARGUMENT', 'Required : email'))
  })

  it('should throw error if has no email', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: {}
    }
    const email = null
    const password = 'foobar'

    const { willLogin } = require('../authen-local')
    expect(willLogin(req, email, password)).rejects.toEqual(errorBy('NAP_INVALID_ARGUMENT', 'Required : email'))
  })

  it('should throw error if has no password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: {}
    }
    const email = 'katopz@gmail.com'
    const password = null

    const { willLogin } = require('../authen-local')
    expect(willLogin(req, email, password)).rejects.toEqual(errorBy('NAP_INVALID_ARGUMENT', 'Required : password'))
  })

  it('should able to login with user and password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: {}
    }
    const email = 'katopz@gmail.com'
    const password = 'foobar'

    // Seed
    seedUserWithEmailAndPassword(email, password)

    const { willLogin } = require('../authen-local')
    const user = await willLogin(req, email, password)
    expect(user).toMatchSnapshot()
  })

  it('should logout', async () => {
    const userId = await seedUserWithEmailAndPassword('katopz@gmail.com', 'foobar')
    const user = { _id: userId, emailVerified: true }
    const { willInstallAndLimitAuthen } = require('../authen-sessions')
    const authen = await willInstallAndLimitAuthen({ deviceInfo: 'foo' }, user, 'local')

    const { willLogout } = require('../authen-local')
    const { sessionToken } = authen
    const _authen = await willLogout(sessionToken)

    // Is valid format
    expect(_authen).toEqual(
      expect.objectContaining({
        _id: expect.any(ObjectId),
        installationId: expect.any(ObjectId),
        userId: expect.any(ObjectId),
        isLoggedIn: false,
        loggedInAt: expect.any(Date)
      })
    )

    // Dispose
    await mongoose.connection.collection('authens').drop()
    await mongoose.connection.collection('users').drop()
  })

  it('should reset password', async () => {
    // mock
    const req = { headers: { host: 'localhost:3000' } }
    const email = 'foo@bar.com'
    const token = 'aa90f9ca-ced9-4cad-b4a2-948006bf000d'

    // stub
    global.NAP = {}
    NAP.User = {
      findOneAndUpdate: jest.fn().mockImplementationOnce(async () => ({
        _id: '592c0bb4484d740e0e73798b',
        email,
        role: 'user',
        token
      }))
    }

    const { willResetPasswordViaEmail } = require('../authen-local')
    const result = await willResetPasswordViaEmail(req, email)
    expect(result).toMatchSnapshot()
  })

  it('should able to signup', async () => {
    // mock
    const req = { headers: { host: 'localhost:3000' } }
    const email = 'foo@bar.com'
    const password = 'password'

    // stub
    global.NAP = {}
    NAP.User = {
      findOne: jest.fn().mockImplementationOnce(() => null),
      create: jest.fn().mockImplementationOnce(async () => ({
        _id: '592c0bb4484d740e0e73798b',
        role: 'user'
      }))
    }

    const { willSignUp } = require('../authen-local')
    const result = await willSignUp(req, email, password)
    expect(result).toMatchSnapshot()
  })
})
