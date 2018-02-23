const mongoose = require('mongoose')
function checkReadyState () {
  setTimeout(() => {
    if (!mongoose.connection.readyState) {
      console.error('database not ready')
      process.exit(0)
    }
  }, 10000)
}

const init = async mongo_url => {
  debug.info(`MongoDB : ${mongo_url}`)

  mongoose.Promise = global.Promise

  // Debug
  mongoose.connection.on('connected', () => debug.info(`MongoDB :`, 'Connection Established'))
  mongoose.connection.on('reconnected', () => debug.info(`MongoDB :`, 'Connection Reestablished'))
  mongoose.connection.on('disconnected', () => {
    debug.info(`MongoDB :`, 'Connection Disconnected')
    checkReadyState()
  })
  mongoose.connection.on('close', () => debug.info(`MongoDB :`, 'Connection Closed'))
  mongoose.connection.on('error', err => {
    debug.error(`MongoDB :`, err)
    checkReadyState()
  })

  return mongoose.connect(mongo_url, {
    useMongoClient: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
  })
}

module.exports = init
