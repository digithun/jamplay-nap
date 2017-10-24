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
  // For testing error
  app.get('/test-error', (req, res, next) => {
    // here we cause an error in the pipeline so we see express-winston in action.
    return next(new Error('This is an error and it should be logged to the console'))
  })

  app.use(expressWinston.errorLogger(options))
  debug.info(`Error   : Will log by express-winston`)
}

module.exports = { initAccessLogger, initErrorLogger, initAccessLoggerIgnore }
