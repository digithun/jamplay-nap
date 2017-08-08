/* eslint-env jest */
const _NOW_PLUS_60SEC_ISO = new Date(+new Date() + 1000 * 60).toISOString()

describe('UserResolver', () => {
  it('should return null if session not provided', async () => {
    const { user: willReadUser } = require('../UserResolver')
    const context = { nap: { errors: [] } }
    const user = await willReadUser({ context })
    expect(user).toBeNull()
  })

  it('should return user data if has session', async () => {
    // mock
    const userData = { foo: 'bar' }

    // stub
    global.NAP = {}
    NAP.User = {
      findById: jest.fn().mockImplementationOnce(() =>
        Promise.resolve(
          Object.assign(
            {
              _id: '592c0bb4484d740e0e73798b',
              role: 'user'
            },
            userData
          )
        )
      )
    }

    const { user: willReadUser } = require('../UserResolver')
    const context = { nap: { session: { userId: 'foo', expireAt: _NOW_PLUS_60SEC_ISO } } }
    const user = await willReadUser({ context })

    expect(user).toMatchSnapshot()
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
    expect(updateEmail({ context, args })).rejects.toMatchObject(require('../../../errors/codes').AUTH_EMAIL_ALREADY_IN_USE)
  })
})
