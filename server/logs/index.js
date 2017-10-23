const winston = require('winston')
const expressWinston = require('express-winston')
const ignoredRoutesString = process.env.EXPRESS_LOGS_IGNORE_ROUTES || ''
const ignoredRoutes = ignoredRoutesString.split(',')
expressWinston.ignoredRoutes.concat(ignoredRoutes)
expressWinston.ignoredRoutes.push('/test-ok', '/_next/on-demand-entries-ping')

console.log(';;', expressWinston.ignoredRoutes)

// TODO : katopz move to jest
// For testing purpose
const initLoggerTest = app => {
  // Guard production
  if (process.env.NODE_ENV === 'production') return

  app.get('/test-error', (req, res, next) => {
    // here we cause an error in the pipeline so we see express-winston in action.
    return next(new Error('This is an error and it should be logged to the console'))
  })

  app.get('/test-ok', (req, res, next) => {
    res.write('This is a normal request, it should be logged to the console too')
    res.end()
  })
}

// express-winston logger makes sense BEFORE the router.
const initLogger = app =>
  app.use(
    expressWinston.logger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        })
      ]
    })
  )

// express-winston errorLogger makes sense AFTER the router.
const initErrorLogger = app =>
  app.use(
    expressWinston.errorLogger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        })
      ]
    })
  )

module.exports = { initLogger, initErrorLogger, initLoggerTest }
