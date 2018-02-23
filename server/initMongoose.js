function checkReadyState (connection) {
  setTimeout(() => {
    if (!connection.readyState) {
      console.error('database not ready')
      process.exit(1)
    }
  }, 10000)
}

const init = async mongo_url => {
  const mongoose = require('mongoose')
  debug.info(`MongoDB : ${mongo_url}`)

  mongoose.Promise = global.Promise

  const connection = await mongoose.connect(mongo_url, {
    useMongoClient: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
  })

  // Debug
  connection.on('connected', () => debug.info(`MongoDB :`, 'Connection Established'))
  connection.on('reconnected', () => debug.info(`MongoDB :`, 'Connection Reestablished'))
  connection.on('disconnected', () => {
    debug.info(`MongoDB :`, 'Connection Disconnected')
    checkReadyState(connection)
  })
  connection.on('close', () => debug.info(`MongoDB :`, 'Connection Closed'))
  connection.on('error', err => {
    debug.error(`MongoDB :`, err)
    checkReadyState(connection)
  })
  return connection
}

module.exports = init
