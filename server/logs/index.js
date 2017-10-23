const winston = require('winston')
const expressWinston = require('express-winston')

// Ignore
const initLoggerIgnore = ignoredRoutes => {
  expressWinston.ignoredRoutes = expressWinston.ignoredRoutes.concat(ignoredRoutes)
  debug.info(`Logs  : Will ignore ${expressWinston.ignoredRoutes}`)
}

// express-winston logger makes sense BEFORE the router.
const initLogger = (app, options) => {
  app.use(
    expressWinston.logger(
      Object.assign(
        {
          transports: [
            new winston.transports.Console({
              json: true,
              colorize: true
            })
          ]
        },
        options
      )
    )
  )
}

// express-winston errorLogger makes sense AFTER the router.
const initErrorLogger = (app, options) => {
  app.use(
    expressWinston.errorLogger(
      Object.assign(
        {
          transports: [
            new winston.transports.Console({
              json: true,
              colorize: true
            })
          ]
        },
        options
      )
    )
  )

  debug.info(`Logs  : Will log error as JSON`)
}

module.exports = { initLogger, initErrorLogger, initLoggerIgnore }
