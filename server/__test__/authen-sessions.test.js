/* eslint-env jest */
const _SESSIONS_TTL = 1000 * 60
process.env.SESSIONS_TTL = _SESSIONS_TTL

const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

// Seeder
const { setup, teardown, seedUserWithManyDevices, seedInstalledAndVerifiedUser } = require('./mongoose-helper')

describe('authen-sessions', async () => {
  beforeAll(setup)

  afterAll(teardown)

  describe('Single sessions', () => {
    it('should create user and return user data', async () => {
      // mock
      const userData = { name: 'foo' }

      const { willCreateUser } = require('../authen-sessions')
      const user = await willCreateUser(userData)

      expect(user).toEqual(
        expect.objectContaining({
          _id: expect.any(ObjectId),
          __v: 0,
          name: 'foo',
          role: 'user',
          emailVerified: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      )
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

    it('should install and authen then return authen', async () => {
      // Seed
      const authen = await seedInstalledAndVerifiedUser('foo@bar.com', 'foobar', 'foo')

      // Is valid format
      expect(authen).toEqual(
        expect.objectContaining({
          _id: expect.any(ObjectId),
          installationId: expect.any(ObjectId),
          userId: expect.any(ObjectId),
          isLoggedIn: true,
          loggedInAt: expect.any(Date)
        })
      )

      // Dispose
      await mongoose.connection.collection('users').drop()
      await mongoose.connection.collection('authens').drop()
    })

    it('should provide sessionToken information', async () => {
      // Seed
      const { sessionToken } = await seedInstalledAndVerifiedUser('foo@bar.com', 'foobar', 'foo')
      const { willDecodeSessionToken } = require('../jwt-token')
      const { jwt_secret } = require('../config')
      const decoded = await willDecodeSessionToken(sessionToken, jwt_secret)
      expect(decoded).toEqual(
        expect.objectContaining({
          installationId: expect.any(String),
          userId: expect.any(String),
          createdAt: expect.any(String),
          expireAt: expect.any(String)
        })
      )

      // Dispose
      await mongoose.connection.collection('users').drop()
      await mongoose.connection.collection('authens').drop()
    })
  })

  describe('Multiple sessions', () => {
    it('should provide latest logged in device list sort by loggedInAt.', async () => {
      // Seed
      const userId = new ObjectId('597c695ae60d9000711f4131')
      seedUserWithManyDevices(userId, [
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
        userId: new ObjectId('597c695ae60d9000711f4132'),
        isLoggedIn: true,
        installationId: new ObjectId('597c6973e60d9000711f4133'),
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
            _id: expect.any(ObjectId),
            installationId: expect.any(ObjectId),
            userId: expect.any(ObjectId),
            isLoggedIn: true,
            loggedInAt: expect.any(Date)
          })
        )

        // Is correctly sorted by _loggedInAt
        expect(+_loggedInAt).toBeGreaterThanOrEqual(+authen.loggedInAt)
      })

      // Dispose
      // await mongoose.connection.collection('users').drop()
      await mongoose.connection.collection('authens').drop()
    })

    it('should let sessionToken expire if user logged in more than 5 devices.', async () => {
      // Seed authens
      const userId = new ObjectId('597c695ae60d9000711f4131')
      seedUserWithManyDevices(userId, [
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
      const email = 'foo@bar.com'
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

      // Dispose
      await mongoose.connection.collection('users').drop()
      await mongoose.connection.collection('authens').drop()
    })
  })
})
