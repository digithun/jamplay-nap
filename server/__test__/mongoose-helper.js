const mongoose = require('mongoose')
const MongodbMemoryServer = require('mongodb-memory-server')
mongoose.Promise = Promise

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

let mongoServer

// Seeder
const seedAuthenByUserWithManyDevices = async (userId, authens) => {
  // Me with many devices
  const installs = authens.map(authen => authen.installationId)
  let i = 0
  const loggedInAt = authens.map(authen => authen.loggedInAt)
  const payloads = installs.map(installationId => ({
    userId,
    isLoggedIn: true,
    installationId: new mongoose.Types.ObjectId(installationId),
    loggedInAt: loggedInAt[i++]
  }))
  await mongoose.connection.collection('authens').insertMany(payloads)

  return userId
}

const seedUserWithEmailAndPassword = async (email, password, emailVerified = false) =>
  seedUserWithData({
    email,
    password,
    emailVerified
  })

const seedUserWithData = async data =>
  mongoose.connection
    .collection('users')
    .insert(
      Object.assign(data, {
        hashed_password: require('../../server/authen-local-passport').toHashedPassword(data.password),
        roles: data.roles || 'user'
      })
    )
    .then(data => data.insertedIds[0])

const seedInstalledAndVerifiedUser = async (email, password, deviceInfo) => {
  const userId = await seedUserWithEmailAndPassword(email, password)
  const user = { _id: userId, emailVerified: true }
  const { willInstallAndLimitAuthen } = require('../authen-sessions')

  return willInstallAndLimitAuthen({ deviceInfo }, user, 'local')
}

const setup = async () => {
  mongoServer = new MongodbMemoryServer.default()
  const mongoUri = await mongoServer.getConnectionString()
  await mongoose.connect(mongoUri, { useMongoClient: true }).catch(err => err && console.error(err))

  global.NAP = {}
  NAP.Authen = require('../graphql/models/Authen')().Authen
  NAP.Installation = require('../graphql/models/Installation')().Installation
  NAP.User = require('../graphql/models/User')().User
}

const teardown = async () => {
  await mongoose.disconnect()
  mongoServer.stop()
}

module.exports = { setup, teardown, seedUserWithData, seedAuthenByUserWithManyDevices, seedUserWithEmailAndPassword, seedInstalledAndVerifiedUser }
