const expressWinston = require('express-winston')

// Ignore
const initAccessLoggerIgnore = ignoredRoutes => {
  expressWinston.ignoredRoutes = expressWinston.ignoredRoutes.concat(ignoredRoutes)
  if (expressWinston.ignoredRoutes.length > 0) debug.info(`Access  : Ignore... ${expressWinston.ignoredRoutes}`)
}

// express-winston logger makes sense BEFORE the router.
const initAccessLogger = (app, options) => {
  app.use(expressWinston.logger(options))
  debug.info(`Access  : Will log by express-winston`)
}

// express-winston errorLogger makes sense AFTER the router.
const initErrorLogger = (app, options) => {
  app.use(expressWinston.errorLogger(options))
  debug.info(`Error   : Will log by express-winston`)
}

module.exports = { initAccessLogger, initErrorLogger, initAccessLoggerIgnore }
