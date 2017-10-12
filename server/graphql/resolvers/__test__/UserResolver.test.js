/* eslint-env jest */
const _NOW_PLUS_60SEC_ISO = new Date(+new Date() + 1000 * 60).toISOString()

// Seeder
const mongoose = require('mongoose')
const { setup, teardown, seedVerifiedLocalUser, __expected__seedVerifiedLocalUser } = require('../../../__test__/mongoose-helper')

describe('UserResolver', () => {
  beforeAll(setup)
  afterAll(teardown)

  it('should return null if session not provided', async () => {
    const { user: willReadUser } = require('../UserResolver')
    const context = {
      nap: { errors: [] },
      body: { isMockServer: true }
    }

    const user = await willReadUser({ context })
    expect(user).toBeNull()
  })

  it('should return user data if has session', async () => {
    // Seed
    const userId = await seedVerifiedLocalUser()
    const { user: willReadUser } = require('../UserResolver')
    const context = {
      nap: { session: { userId, expireAt: _NOW_PLUS_60SEC_ISO } },
      body: { isMockServer: true }
    }
    const user = await willReadUser({ context })

    // Expect
    expect(user).toEqual(expect.objectContaining(__expected__seedVerifiedLocalUser))

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should able to forget password', async () => {
    const context = {
      headers: { host: 'localhost:3000' },
      nap: {
        willResetPasswordViaEmail: async () => ({
          status: 'WAIT_FOR_EMAIL_RESET'
        })
      }
    }
    const email = 'foo@bar.com'
    const args = { email }
    const { forget } = require('../UserResolver')
    const user = await forget({ context, args })
    expect(user).toMatchSnapshot()
  })

  it('should able to delete existing user', async () => {
    // Seed
    const userId = await seedVerifiedLocalUser()
    const { willDeleteUser } = require('../../../authen-sessions')
    const { user: willReadUser } = require('../UserResolver')
    const context = {
      nap: {
        session: { userId, expireAt: _NOW_PLUS_60SEC_ISO },
        willDeleteUser
      },
      body: { isMockServer: true }
    }

    // Mock
    const password = 'foobar'
    const args = { password }
    const { deleteUser } = require('../UserResolver')
    const deletedUser = await deleteUser({ context, args })

    // Delete succeed
    expect(deletedUser).toEqual(
      expect.objectContaining({
        _id: userId
      })
    )

    // Should not exist
    const user = await willReadUser({ context })
    expect(user).toBeNull()

    // Dispose
    await mongoose.connection.collection('users').drop()
  })

  it('should able to update email', async () => {
    const context = {
      nap: {
        session: {
          userId: '592c0bb4484d740e0e73798b',
          expireAt: _NOW_PLUS_60SEC_ISO
        },
        willUpdateEmail: require('../../../../server/authen-local-passport').willUpdateEmail
      }
    }
    const args = { email: 'foo@bar.com' }

    // stub
    const _NAP = global.NAP
    global.NAP = {}
    NAP.User = {
      findById: jest.fn().mockImplementationOnce(async () => ({
        _id: '592c0bb4484d740e0e73798b',
        save: async () => ({
          _id: '592c0bb4484d740e0e73798b'
        })
      })),
      findOne: jest.fn().mockImplementationOnce(async () => null)
    }

    const { updateEmail } = require('../UserResolver')
    const user = await updateEmail({ context, args })
    delete user.save
    expect(user).toMatchSnapshot()

    global.NAP = _NAP
  })

  it('should not able to update existing email', async () => {
    const context = {
      nap: {
        session: {
          userId: '592c0bb4484d740e0e73798b',
          expireAt: _NOW_PLUS_60SEC_ISO
        },
        willUpdateEmail: require('../../../../server/authen-local-passport').willUpdateEmail,
        errors: []
      }
    }
    const args = { email: 'foo@bar.com' }

    // stub
    const _NAP = global.NAP
    global.NAP = {}
    NAP.User = {
      findById: jest.fn().mockImplementationOnce(async () => ({
        _id: '592c0bb4484d740e0e73798b',
        save: async () => ({
          _id: '592c0bb4484d740e0e73798b'
        })
      })),
      findOne: jest.fn().mockImplementationOnce(async () => ({
        _id: '592c0bb4484d740e0e73798c'
      }))
    }

    const { updateEmail } = require('../UserResolver')
    const result = await updateEmail({ context, args }).catch(err => {
      expect(() => {
        throw err
      }).toThrowError(require('../../../errors/codes').AUTH_EMAIL_ALREADY_IN_USE)
    })

    expect(result).toBeUndefined()

    global.NAP = _NAP
  })
})
