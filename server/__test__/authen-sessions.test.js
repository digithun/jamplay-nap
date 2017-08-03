/* eslint-env jest */
const _SESSIONS_TTL = 1000 * 60
process.env.SESSIONS_TTL = _SESSIONS_TTL

const mongoose = require('mongoose')
const MongodbMemoryServer = require('mongodb-memory-server')
mongoose.Promise = Promise

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

let mongoServer

describe('authen-sessions', async () => {
  beforeAll(async () => {
    mongoServer = new MongodbMemoryServer.default()
    const mongoUri = await mongoServer.getConnectionString()
    mongoose.connect(mongoUri, err => err && console.error(err))

    global.NAP = {}
    NAP.Authen = require('../graphql/models/Authen')().Authen
  })

  afterAll(() => {
    mongoose.disconnect()
    mongoServer.stop()
  })

  describe('Multiple sessions', () => {
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

    it('should provide latest logged in device list sort by loggedInAt.', async () => {
      const { listSessionByUser } = require('../authen-sessions')
      const userId = new mongoose.Types.ObjectId('597c695ae60d9000711f4131')

      // Me with 2 devices
      const installs = ['597c6478d5901c0062984128', '597c6973e60d9000711f4132']
      let i = 0
      const loggedInAts = [new Date('2017-08-02T12:45:59.928Z'), new Date('2017-08-03T12:45:59.928Z')]
      installs.map(installationId =>
        mongoose.connection.collection('authens').insert({
          userId,
          isLoggedIn: true,
          installationId: new mongoose.Types.ObjectId(installationId),
          loggedInAt: loggedInAts[i++]
        })
      )

      // Others
      mongoose.connection.collection('authens').insert({
        userId: new mongoose.Types.ObjectId('597c695ae60d9000711f4132'),
        isLoggedIn: true,
        installationId: new mongoose.Types.ObjectId('597c6973e60d9000711f4133')
      })

      // Gimme users
      const _users = await listSessionByUser(userId)

      // Avoid no match _id
      let users = _users.map(user => ({
        userId: user.userId,
        isLoggedIn: user.isLoggedIn,
        installationId: user.installationId,
        loggedInAt: user.loggedInAt
      }))

      // Viola!
      expect(users).toMatchSnapshot()
    })
  })
})
