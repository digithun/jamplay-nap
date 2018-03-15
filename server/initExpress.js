const config = require('./config')

const init = ({ port }, nap) => {
  // Create a new Express application.
  const express = require('express')
  const app = express()

  // NAP as First class
  app.use(nap)

  // CORS
  const cors = require('cors')
  if (config.cors_whitelist) {
    const option = {
      origin: config.cors_whitelist,
      credentials: true
    }
    app.use(cors(option))
  } else {
    app.use(cors())
  }
  // Helmet
  const helmet = require('helmet')
  app.use(helmet())

  // Static
  app.use(express.static('public'))

  // Ping for health check
  app.get('/ping', (req, res) => res.send({uptime: process.uptime()}))

  return app
}

module.exports = init
