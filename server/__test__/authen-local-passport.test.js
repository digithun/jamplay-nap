/* eslint-env jest */

const { setup, teardown } = require('./mongoose-helper')
const mongoose = require('mongoose')

describe('authen-local-passport', () => {
  describe('mock', () => {
    const base_url = 'http://localhost:3000'
    const other_base_url = 'http://localhost:4000'
    const token = 'FOO_TOKEN'

    it('should create email verification url', async () => {
      const { createVerificationURL } = require('../authen-local-passport')
      const auth_local_uri = '/auth/local'
      const verification_url = createVerificationURL(auth_local_uri, base_url, token)

      // URL
      expect(verification_url).toMatchSnapshot()

      // Path
      expect(createVerificationURL(`${other_base_url}/${auth_local_uri}`, base_url, token)).toMatchSnapshot()
    })

    it('should create verification for email change url', async () => {
      const { createVerificationForChangeEmailURL } = require('../authen-local-passport')
      const auth_change_email_uri = '/auth/change-email'
      const verification_url = createVerificationForChangeEmailURL(auth_change_email_uri, base_url, token)

      // URL
      expect(verification_url).toMatchSnapshot()

      // Path
      expect(createVerificationForChangeEmailURL(`${other_base_url}/${auth_change_email_uri}`, base_url, token)).toMatchSnapshot()
    })

    it('should create password reset url', async () => {
      const { createPasswordResetURL } = require('../authen-local-passport')
      const auth_reset_uri = '/auth/reset'
      const password_reset_url = createPasswordResetURL(auth_reset_uri, base_url, token)

      // URL
      expect(password_reset_url).toMatchSnapshot()

      // Path
      expect(createPasswordResetURL(`${other_base_url}/${auth_reset_uri}`, base_url, token)).toMatchSnapshot()
    })

    it('should create new password reset url', async () => {
      const { createNewPasswordResetURL } = require('../authen-local-passport')
      const auth_new_reset_uri = '/auth/reset'
      const new_password_reset_url = createNewPasswordResetURL(auth_new_reset_uri, base_url)

      // URL
      expect(new_password_reset_url).toMatchSnapshot()

      // Path
      expect(createNewPasswordResetURL(`${other_base_url}/${auth_new_reset_uri}`, base_url)).toMatchSnapshot()
    })

    it('should throw error for empty email', async () => {
      const { willValidateEmail } = require('../authen-local-passport')
      await willValidateEmail().catch(err => {
        expect(() => {
          throw err
        }).toThrow('Required : email')
      })
    })

    it('should throw error for invalid email', async () => {
      const { willValidateEmail } = require('../authen-local-passport')
      await willValidateEmail('').catch(err => {
        expect(() => {
          throw err
        }).toThrow(require('../errors/codes').AUTH_INVALID_EMAIL)
      })
    })

    it('should be true for valid email', async () => {
      const { willValidateEmail } = require('../authen-local-passport')
      expect(await willValidateEmail('foo@bar.com')).toMatchSnapshot()
    })

    it('should throw error for empty password', async () => {
      const { willValidatePassword } = require('../authen-local-passport')
      await willValidatePassword().catch(err => {
        expect(() => {
          throw err
        }).toThrow('Required : password')
      })
    })

    it('should throw error for invalid password', async () => {
      const { willValidatePassword } = require('../authen-local-passport')
      const { AUTH_WEAK_PASSWORD } = require('../errors/codes')
      await willValidatePassword('foo').catch(err => {
        expect(() => {
          throw err
        }).toThrow(AUTH_WEAK_PASSWORD)
      })
    })

    it('should be true for valid password', async () => {
      const { willValidatePassword } = require('../authen-local-passport')
      expect(await willValidatePassword('foofoobarbar')).toMatchSnapshot()
    })

    it('should be true for valid email and password', async () => {
      const { willValidateEmailAndPassword } = require('../authen-local-passport')
      expect(await willValidateEmailAndPassword('foo@bar.com', 'foofoobarbar')).toMatchSnapshot()
    })

    it('should throw error if email already in use when signup new user', async () => {
      // mock
      const userData = { foo: 'bar' }

      // stub
      global.NAP = {}
      NAP.User = {
        findOne: jest.fn().mockImplementationOnce(async () =>
          Object.assign(
            {
              _id: '592c0bb4484d740e0e73798b',
              status: 'VERIFIED_BY_EMAIL',
              role: 'user'
            },
            userData
          )
        ),
        _create: jest.fn().mockImplementationOnce(async () =>
          Object.assign(
            {
              _id: '592c0bb4484d740e0e73798b',
              role: 'user'
            },
            userData
          )
        )
      }

      const { willSignUpNewUser } = require('../authen-local-passport')
      const token = require('uuid/v4')()
      const { AUTH_EMAIL_ALREADY_IN_USE } = require('../errors/codes')

      await willSignUpNewUser('foo@bar.com', 'foofoobarbar', token).catch(err => {
        expect(() => {
          throw err
        }).toThrow(AUTH_EMAIL_ALREADY_IN_USE)
      })
    })

    it('should signup new user and return user data', async () => {
      // mock
      const userData = { foo: 'bar' }

      // stub
      global.NAP = {}
      NAP.User = {
        findOne: jest.fn().mockImplementationOnce(() => null),
        create: jest.fn().mockImplementationOnce(async () =>
          Object.assign(
            {
              _id: '592c0bb4484d740e0e73798b',
              role: 'user'
            },
            userData
          )
        )
      }

      const { willSignUpNewUser } = require('../authen-local-passport')
      const token = require('uuid/v4')()
      expect(await willSignUpNewUser('foo@bar.com', 'foofoobarbar', token)).toMatchSnapshot()
    })

    it('should reset password if user exist', async () => {
      // mock
      const email = 'foo@bar.com'
      const token = 'aa90f9ca-ced9-4cad-b4a2-948006bf000d'

      // stub
      global.NAP = {}
      NAP.User = {
        findOne: jest.fn().mockImplementationOnce(async () => ({
          save: async () => ({
            _id: '592c0bb4484d740e0e73798b',
            role: 'user',
            email,
            token
          })
        })),
        findOneAndUpdate: jest.fn().mockImplementationOnce(async () => ({
          _id: '592c0bb4484d740e0e73798b',
          role: 'user',
          email,
          token
        }))
      }

      const { willSetUserStatusAsWaitForEmailReset } = require('../authen-local-passport')
      expect(await willSetUserStatusAsWaitForEmailReset(email, token)).toMatchSnapshot()
    })

    it('should redirect null token to /auth/error?name=token-not-provided', async () => {
      const { auth_local_token } = require('../authen-local-passport').handler
      const req = { params: { token: null } }
      const res = {
        redirect: route => expect(route).toMatchSnapshot()
      }
      auth_local_token(req, res)
    })

    it('should redirect non exist token to /auth/error?name=token-not-exist', async () => {
      // Config
      const config = require('../config')
      config.auth_error_uri = '/auth/error'

      // stub
      global.NAP = {}
      NAP.User = {
        findOne: jest.fn().mockImplementationOnce(async () => null)
      }

      const { auth_local_token } = require('../authen-local-passport').handler
      const req = { params: { token: 'NOT_EXIST_TOKEN' } }
      const res = {
        redirect: route => expect(route).toMatchSnapshot()
      }

      auth_local_token(req, res)
    })
  })

  describe('mock-server', () => {
    beforeAll(setup)
    afterAll(teardown)

    it('should update password by token correctly', async () => {
      const email = 'foo@bar.com'
      const password = 'OLD_PASSWORD'
      const token = 'aa90f9ca-ced9-4cad-b4a2-948006bf000d'

      const { toHashedPassword } = require('../authen-local-passport')
      const hashed_password = toHashedPassword(password)
      const { willCreateUser } = require('../authen-sessions')
      const userData = { email, emailVerified: true, hashed_password, token }
      const user = await willCreateUser(userData)

      const { willUpdatePasswordByToken } = require('../authen-local-passport')
      const new_password = 'NEW_PASSWORD'
      const updated_user = await willUpdatePasswordByToken(token, new_password)

      expect(user.hashed_password).not.toBe(updated_user.hashed_password)

      // Dispose
      await mongoose.connection.collection('users').drop()
    })

    it('should throw error if verify token for reset password has been use', async () => {
      const { willUpdatePasswordByToken } = require('../authen-local-passport')
      const token = 'SOME_TOKEN'
      const password = 'SOME_PASSWORD'
      expect(willUpdatePasswordByToken(token, password)).rejects.toMatchObject(require('../errors/codes').AUTH_INVALID_ACTION_CODE)
    })

    it('should throw error if verify token for reset email has been use', async () => {
      const { willVerifyEmailByToken } = require('../authen-local-passport')
      const token = 'SOME_TOKEN'
      const password = 'SOME_PASSWORD'
      expect(willVerifyEmailByToken(token, password)).rejects.toMatchObject(require('../errors/codes').AUTH_INVALID_ACTION_CODE)
    })

    it('should redirect valid token to /auth/verified', async () => {
      const { auth_local_token } = require('../authen-local-passport').handler
      const req = { params: { token: 'VALID_TOKEN' } }
      const res = {
        redirect: route => expect(route).toMatchSnapshot()
      }
      auth_local_token(req, res)
    })

    it('should redirect invalid reset token to predefined path', async () => {
      const { auth_reset_token } = require('../authen-local-passport').handler
      const req = { params: { token: 'NOT_EXIST_TOKEN' } }
      const res = {
        redirect: route => expect(route).toMatchSnapshot()
      }
      const next = () => console.log(`This shouldn't be call`)

      auth_reset_token(req, res, next)
    })

    it('should validate local strategy', async () => {
      // mock
      const email = 'foo@bar.com'
      const password = 'foobar'
      const { toHashedPassword } = require('../authen-local-passport')
      const hashed_password = toHashedPassword(password)
      const { willCreateUser } = require('../authen-sessions')
      const userData = { email, emailVerified: true, hashed_password }
      const _user = await willCreateUser(userData)

      const { validateLocalStrategy } = require('../authen-local-passport')
      const { promisify } = require('util')
      const willValidateLocalStrategy = promisify(validateLocalStrategy)

      const user = await willValidateLocalStrategy(email, password)
      expect(user.toObject()).toEqual(_user.toObject())

      // Dispose
      await mongoose.connection.collection('users').drop()
    })

    it('can update password', async () => {
      const email = 'foo@bar.com'
      const password = 'foobar'
      const { toHashedPassword } = require('../authen-local-passport')
      const hashed_password = toHashedPassword(password)
      const { willCreateUser } = require('../authen-sessions')
      const userData = { email, emailVerified: true, hashed_password }
      const user = await willCreateUser(userData)

      const { willUpdatePassword } = require('../authen-local-passport')
      const new_password = 'newfoobar'
      const updated_user = await willUpdatePassword(user, password, new_password)

      expect(user.hashed_password).not.toBe(updated_user.hashed_password)

      // Dispose
      await mongoose.connection.collection('users').drop()
    })
  })
})
