const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const MongodbMemoryServer = require('mongodb-memory-server')
mongoose.Promise = Promise

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

let mongoServer

// Mock data
const EMAIL = 'foo@bar.com'
const __mocked__verifiedLocalUserPayload = {
  email: EMAIL,
  password: 'foobar',
  emailVerified: true,
  role: 'user'
}

const __expected__seedVerifiedLocalUser = {
  _id: expect.any(ObjectId),
  email: expect.any(String),
  role: 'user',
  emailVerified: true,
  hashed_password: expect.any(String)
}

const __mocked__facebookUser = {
  id: '10154646415997479',
  token: 'SOME_ACCESS_TOKEN',
  profile: {
    photos: [
      {
        value: 'https://graph.facebook.com/v2.6/10154646415997479/picture?type=large'
      }
    ],
    emails: [
      {
        value: EMAIL
      }
    ],
    gender: '',
    name: {
      middleName: '',
      givenName: 'Katopz',
      familyName: 'Todsaporn'
    },
    displayName: 'Katopz Todsaporn',
    id: '10154646415997479',
    provider: 'facebook'
  }
}

const getMockedFacebookUser = () => __mocked__facebookUser

/*
  _id: expect.any(ObjectId),
  email: expect.any(String),
  hashed_password: expect.any(String),
  emailVerified: true,
*/
// Seeder
const seedFacebookUser = async () =>
  seedUserWithData({
    name: __mocked__facebookUser.profile.displayName,
    email: __mocked__facebookUser.profile.emails[0].value,
    facebook: __mocked__facebookUser
  })

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
        hashed_password: data.password && require('../../server/authen-local-passport').toHashedPassword(data.password),
        role: data.role || 'user'
      })
    )
    .then(data => data.insertedIds[0])

const seedVerifiedLocalUser = async () => seedUserWithData(__mocked__verifiedLocalUserPayload)

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

module.exports = {
  setup,
  teardown,
  seedUserWithData,
  seedAuthenByUserWithManyDevices,
  seedUserWithEmailAndPassword,
  seedInstalledAndVerifiedUser,
  seedVerifiedLocalUser,
  __mocked__verifiedLocalUserPayload,
  __expected__seedVerifiedLocalUser,
  getMockedFacebookUser,
  seedFacebookUser,
  EMAIL
}
