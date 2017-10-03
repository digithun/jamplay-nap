const init = ({ port }, nap) => {
  // Create a new Express application.
  const express = require('express')
  const app = express()

  // NAP as First class
  app.use(nap)

  // Static
  app.use(express.static('public'))

  // Ping for health check
  const { base_url } = require('./config')
  const health = require('express-ping')
  app.use(health.ping())
  debug.info(`Ping    : ${base_url}/ping`)

  return app
}

module.exports = init
