/* eslint-env jest */

process.env.MAILGUN_API_KEY = 'FOO_MAILGUN_API_KEY'
process.env.MAILGUN_DOMAIN = 'BAR_MAILGUN_DOMAIN'

const { errorBy } = require('../errors')

const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

// Seeder
const {
  setup,
  teardown,
  seedUserWithEmailAndPassword,
  seedUserWithData,
  seedVerifiedLocalUser,
  __mocked__verifiedLocalUserPayload,
  __expected__seedVerifiedLocalUser
} = require('./mongoose-helper')

describe('authen-local', () => {
  beforeAll(setup)
  afterAll(teardown)

  it('should throw error if has no email and password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }
    const email = null
    const password = null

    const { willLogin } = require('../authen-local')
    await willLogin(req, email, password).catch(err => {
      expect(() => {
        throw err
      }).toThrowError(require('../errors/codes').AUTH_MISSING_EMAIL)
    })
  })

  it('should throw error if has no email', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }
    const email = null
    const password = 'foobar'

    const { willLogin } = require('../authen-local')

    await willLogin(req, email, password).catch(err => {
      expect(() => {
        throw err
      }).toThrowError(require('../errors/codes').AUTH_MISSING_EMAIL)
    })
  })

  it('should throw error if has no password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }
    const email = 'katopz@gmail.com'
    const password = null

    const { willLogin } = require('../authen-local')
    expect(willLogin(req, email, password)).rejects.toEqual(errorBy('NAP_INVALID_ARGUMENT', 'Required : password'))
  })

  it('should throw `auth/invalid-login` error for not exist email', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }
    const email = 'exist@bar.com'
    const not_exiting_email = 'not_exiting@bar.com'
    const password = 'foobar'

    // Seed
    await seedUserWithEmailAndPassword(email, password, true)

    const { willLogin } = require('../authen-local')
    await willLogin(req, not_exiting_email, password).catch(err => {
      expect(() => {
        throw err
      }).toThrow(require('../errors/codes').AUTH_INVALID_LOGIN)
    })

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should throw `auth/invalid-login` error for wrong password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }
    const email = 'foo@bar.com'
    const password = 'foobar'
    const wrong_password = 'notfoobar'

    // Seed
    await seedUserWithEmailAndPassword(email, password, true)

    const { willLogin } = require('../authen-local')
    await willLogin(req, email, password).catch(err => {
      expect(() => {
        throw err
      }).toThrow(require('../errors/codes').AUTH_INVALID_LOGIN)
    })

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should throw `auth/invalid-login` error for short password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }
    const email = 'foo@bar.com'
    const password = 'foobar'
    const short_password = 'short'

    // Seed
    await seedUserWithEmailAndPassword(email, password, true)

    const { willLogin } = require('../authen-local')
    await willLogin(req, email, short_password).catch(err => {
      expect(() => {
        throw err
      }).toThrow(require('../errors/codes').AUTH_INVALID_LOGIN)
    })

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should able to login with user and password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }

    // Seed
    await seedVerifiedLocalUser()

    const { willLogin } = require('../authen-local')
    const { email, password } = __mocked__verifiedLocalUserPayload
    const user = await willLogin(req, email, password)

    // Expect
    expect(user).toEqual(expect.objectContaining(__expected__seedVerifiedLocalUser))

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should able to login with uppercase email but register with lowercase', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }

    // Seed
    await seedVerifiedLocalUser()

    const { willLogin } = require('../authen-local')
    const { password } = __mocked__verifiedLocalUserPayload
    const user = await willLogin(req, 'FoO@bar.com', password)

    // Expect
    expect(user).toEqual(expect.objectContaining(__expected__seedVerifiedLocalUser))

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should able to register with uppercase but login with lowercase', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }

    // Seed
    const { email, password } = __mocked__verifiedLocalUserPayload
    const { willSignUp } = require('../authen-local')
    const signUpUser = await willSignUp(req, 'FoO@bar.com', password)
    signUpUser.emailVerified = true
    await signUpUser.save()

    const { willLogin } = require('../authen-local')
    const user = await willLogin(req, email, password)

    // Expect
    expect(user).toEqual(expect.objectContaining(__expected__seedVerifiedLocalUser))

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should logout', async () => {
    const userId = await seedVerifiedLocalUser()
    const user = { _id: userId, emailVerified: true }
    const { willInstallAndLimitAuthen } = require('../authen-sessions')
    const authen = await willInstallAndLimitAuthen({ deviceInfo: 'foo' }, user, 'local')

    const { willLogout } = require('../authen-local')
    const { sessionToken } = authen

    // Is valid format
    expect(await willLogout(sessionToken)).toEqual(
      expect.objectContaining({
        _id: expect.any(ObjectId),
        installationId: expect.any(ObjectId),
        userId: new ObjectId(userId),
        isLoggedIn: false,
        loggedOutAt: expect.any(Date)
      })
    )

    // Dispose
    await mongoose.connection.collection('authens').drop()
    await mongoose.connection.collection('users').drop()
  })

  it('should reset password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }
    const email = 'foo@bar.com'
    const password = 'foobar'
    const token = 'aa90f9ca-ced9-4cad-b4a2-948006bf000d'

    await seedUserWithData({
      email,
      password,
      token,
      emailVerified: true
    })

    const { willResetPasswordViaEmail } = require('../authen-local')
    const result = await willResetPasswordViaEmail(req, email, token)
    expect(result).toEqual(
      expect.objectContaining({
        _id: expect.any(ObjectId),
        status: 'WAIT_FOR_EMAIL_RESET'
      })
    )

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should able to signup', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }

    const email = 'foo@bar.com'
    const password = 'password'

    const { willSignUp } = require('../authen-local')

    expect(await willSignUp(req, email, password)).toEqual(
      expect.objectContaining({
        _id: expect.any(ObjectId),
        email,
        status: 'WAIT_FOR_EMAIL_VERIFICATION',
        emailVerified: false,
        hashed_password: expect.any(String),
        token: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    )

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should able to change email by token and password', async () => {
    // mock
    const req = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }
    const email = 'foo@bar.com'
    const unverifiedEmail = 'new_foo@gmail.com'
    const password = 'foobar'
    const token = 'aa90f9ca-ced9-4cad-b4a2-948006bf000d'

    await seedUserWithData({
      email,
      password,
      emailVerified: true
    })

    const { willLogin, willSendVerificationForUpdateEmail } = require('../authen-local')
    const user = await willLogin(req, email, password)
    const result = await willSendVerificationForUpdateEmail(user, unverifiedEmail, token)

    expect(result).toEqual(
      expect.objectContaining({
        _id: expect.any(ObjectId),
        token,
        unverifiedEmail,
        status: 'WAIT_FOR_NEW_EMAIL_VERIFICATION'
      })
    )

    // Simulate user click link from email
    // http://localhost:3000/auth/local/aa90f9ca-ced9-4cad-b4a2-948006bf000d
    const { willVerifyEmailByToken } = require('../authen-local-passport')
    const updatedUser = await willVerifyEmailByToken(token, password)

    expect(updatedUser).toEqual(
      expect.objectContaining({
        _id: expect.any(ObjectId),
        email: unverifiedEmail,
        status: 'VERIFIED_BY_EMAIL',
        unverifiedEmail: null,
        emailVerified: true,
        token: null,
        usedEmails: expect.objectContaining([email])
      })
    )

    // Dispose
    await mongoose.connection.collection('users').drop()
  })
})
