const mongoose = require('mongoose')
const MongodbMemoryServer = require('mongodb-memory-server')
mongoose.Promise = Promise

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

let mongoServer

// Seeder
const seedUserWithManyDevices = (userId, authens) => {
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

const seedUserWithEmailAndPassword = async (email, password) => {
  const hashed_password = require('../../server/authen-local-passport').toHashedPassword(password)

  return new Promise((resolve, reject) => {
    mongoose.connection.collection('users').insert({
      email,
      hashed_password,
      emailVerified: true
    }, (err, data) => {
      if (err) throw err
      resolve(data.insertedIds[0])
    })
  })
}

const seedInstalledAndVerifiedUser = async (email, password, deviceInfo) => {
  const userId = await seedUserWithEmailAndPassword(email, password)
  const user = { _id: userId, emailVerified: true }
  const { willInstallAndLimitAuthen } = require('../authen-sessions')

  return willInstallAndLimitAuthen({ deviceInfo }, user, 'local')
}

const setup = async () => {
  mongoServer = new MongodbMemoryServer.default()
  const mongoUri = await mongoServer.getConnectionString()
  mongoose.connect(mongoUri, err => err && console.error(err))

  global.NAP = {}
  NAP.Authen = require('../graphql/models/Authen')().Authen
  NAP.Installation = require('../graphql/models/Installation')().Installation
  NAP.User = require('../graphql/models/User')().User
}

const teardown = () => {
  mongoose.disconnect()
  mongoServer.stop()
}

module.exports = { setup, teardown, seedUserWithManyDevices, seedUserWithEmailAndPassword, seedInstalledAndVerifiedUser }
