/* eslint-env jest */
const _SESSIONS_TTL = 1000 * 60
process.env.SESSIONS_TTL = _SESSIONS_TTL

const mongoose = require('mongoose')
const MongodbMemoryServer = require('mongodb-memory-server')
mongoose.Promise = Promise

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

let mongoServer

// Seeder
const _seedUserWithManyDevices = (userId, authens) => {
  // Me with many devices
  const installs = authens.map(authen => authen.installationId)
  let i = 0
  const loggedInAt = authens.map(authen => authen.loggedInAt)
  installs.map(installationId =>
    mongoose.connection.collection('authens').insert({
      userId,
      isLoggedIn: true,
      installationId: new mongoose.Types.ObjectId(installationId),
      loggedInAt: loggedInAt[i++]
    })
  )

  return userId
}

describe('authen-sessions', async () => {
  beforeAll(async () => {
    mongoServer = new MongodbMemoryServer.default()
    const mongoUri = await mongoServer.getConnectionString()
    mongoose.connect(mongoUri, err => err && console.error(err))

    global.NAP = {}
    NAP.Authen = require('../graphql/models/Authen')().Authen
    NAP.Installation = require('../graphql/models/Installation')().Installation
    NAP.User = require('../graphql/models/User')().User
  })

  afterAll(() => {
    mongoose.disconnect()
    mongoServer.stop()
  })

  describe('Single sessions', () => {
    it('should create user and return user data', async () => {
      // mock
      const userData = { name: 'foo' }

      const { willCreateUser } = require('../authen-sessions')
      const user = await willCreateUser(userData)

      expect(user).toEqual(
        expect.objectContaining({
          _id: expect.any(mongoose.Types.ObjectId),
          __v: 0,
          name: 'foo',
          role: 'user',
          emailVerified: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      )
    })

    it('should provide sessionToken that never expire', async () => {
      const { validateSession } = require('../authen-sessions')

      // Never expire as -1
      expect(await validateSession({ expireAt: -1 })).toBe(true)
    })

    it('should provide sessionToken that can be expire', async () => {
      const { validateSession } = require('../authen-sessions')

      // Expired after 1 ms pass.
      expect(
        validateSession({
          expireAt: new Date(+new Date() - _SESSIONS_TTL - 1).toISOString()
        })
      ).rejects.toMatchObject(require('../errors/codes').AUTH_USER_TOKEN_EXPIRED)
    })
  })

  describe('Multiple sessions', () => {
    it('should provide latest logged in device list sort by loggedInAt.', async () => {
      // Seed
      const userId = new mongoose.Types.ObjectId('597c695ae60d9000711f4131')
      _seedUserWithManyDevices(userId, [
        {
          installationId: '597c6478d5901c0062984128',
          loggedInAt: new Date('2017-08-02T12:45:59.928Z')
        },
        {
          installationId: '597c6973e60d9000711f4132',
          loggedInAt: new Date('2017-08-03T12:45:59.928Z')
        }
      ])

      // Others
      mongoose.connection.collection('authens').insert({
        userId: new mongoose.Types.ObjectId('597c695ae60d9000711f4132'),
        isLoggedIn: true,
        installationId: new mongoose.Types.ObjectId('597c6973e60d9000711f4133'),
        loggedInAt: new Date('2017-08-04T12:45:59.928Z')
      })

      // Gimme users
      const { listSessionByUser } = require('../authen-sessions')
      const _authens = await listSessionByUser(userId)

      // Validate
      const _loggedInAt = _authens[0].loggedInAt
      _authens.map(authen => {
        // Is valid format
        expect(authen).toEqual(
          expect.objectContaining({
            _id: expect.any(mongoose.Types.ObjectId),
            installationId: expect.any(mongoose.Types.ObjectId),
            userId: expect.any(mongoose.Types.ObjectId),
            isLoggedIn: true,
            loggedInAt: expect.any(Date)
          })
        )

        // Is correctly sorted by _loggedInAt
        expect(+_loggedInAt).toBeGreaterThanOrEqual(+authen.loggedInAt)
      })

      // Dispose
      await mongoose.connection.collection('authens').drop()
    })

    it('should let sessionToken expire if user logged in more than 5 devices.', async () => {
      // Seed authens
      const userId = new mongoose.Types.ObjectId('597c695ae60d9000711f4131')
      _seedUserWithManyDevices(userId, [
        {
          installationId: '597c6478d5901c0062984128',
          loggedInAt: new Date('2017-08-02T12:45:00.928Z')
        },
        {
          installationId: '597c6973e60d9000711f4132',
          loggedInAt: new Date('2017-08-03T12:45:01.928Z')
        },
        {
          installationId: '597c6973e60d9000711f4133',
          loggedInAt: new Date('2017-08-03T12:45:02.928Z')
        },
        {
          installationId: '597c6973e60d9000711f4134',
          loggedInAt: new Date('2017-08-03T12:45:03.928Z')
        },
        {
          installationId: '597c6973e60d9000711f4135',
          loggedInAt: new Date('2017-08-03T12:45:04.928Z')
        }
      ])

      // Seed users
      const email = 'katopz@gmail.com'
      const password = 'foobar'
      mongoose.connection.collection('users').insert({
        _id: userId,
        email,
        hashed_password: '$2a$10$r9yAY4TYm88cpIOzyaaIJOjEz0S8DBZs8NS/3C1sUlyXWez82r.ki',
        emailVerified: true
      })

      // Gimme users
      const { listSessionByUser } = require('../authen-sessions')
      const _authens = await listSessionByUser(userId)
      expect(_authens.length).toBe(5)

      // Login
      const req = {
        nap: { errors: [] },
        body: { isMockServer: true }
      }

      const { willLogin } = require('../authen-local')
      const { willInstallAndLimitAuthen } = require('../graphql/resolvers')

      const user = await willLogin(req, email, password)
      // User can logged in
      expect(user).toMatchSnapshot()

      const authen = await willInstallAndLimitAuthen({ deviceInfo: 'foo' }, user, 'local')
      // User can properly authen
      expect(authen.userId).toMatchObject(userId)

      // User total should be remain same amount
      const _after_authens = await listSessionByUser(userId)
      expect(_after_authens.length).toBe(5)

      // User should be at index 0
      expect(_after_authens[0].installationId).toMatchObject(authen.installationId)

      // Users should match capped list
      _authens.pop()
      _authens.unshift(authen)
      const _userIds = _authens.map(authen => authen.userId)
      const _after_userIds = _after_authens.map(authen => authen.userId)

      expect(_userIds).toMatchObject(_after_userIds)
    })
  })
})
