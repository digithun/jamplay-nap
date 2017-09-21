require('dotenv/config')
process.on('unhandledRejection', function (reason, p) {
  console.log('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason)
  // application specific logging here
})
const nap = require('./server')

nap.start()
