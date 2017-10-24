const expressWinston = require('express-winston')

// Ignore
const initLoggerIgnore = ignoredRoutes => {
  expressWinston.ignoredRoutes = expressWinston.ignoredRoutes.concat(ignoredRoutes)
  if (expressWinston.ignoredRoutes.length > 0) debug.info(`Logs    : Ignore... ${expressWinston.ignoredRoutes}`)
}

// express-winston logger makes sense BEFORE the router.
const initLogger = (app, options) => {
  app.use(expressWinston.logger(options))

  // For testing error
  /*
  app.get('/test-error', (req, res, next) => {
    // here we cause an error in the pipeline so we see express-winston in action.
    return next(new Error('This is an error and it should be logged to the console'))
  })
  */

  debug.info(`Logger  : express-winston`)
}

// express-winston errorLogger makes sense AFTER the router.
const initErrorLogger = (app, options) => app.use(expressWinston.errorLogger(options))

module.exports = { initLogger, initErrorLogger, initLoggerIgnore }
