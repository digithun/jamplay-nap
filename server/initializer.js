module.exports = async (config, nextjs) => {
  // NAP
  const nap = require('./initNAP')

  // Express
  const app = require('./initExpress')(config, nap)

  // Log
  if (config.express_logger_access_enabled) {
    const logs = require('./logs')
    const { ignoredRoutes, accessOptions } = require('./logs/winston')
    logs.initAccessLoggerIgnore(ignoredRoutes)
    logs.initAccessLogger(app, accessOptions)
  }

  // MubSub
  config.mubsub_enabled && require('./initMubsub')()

  // Mongoose
  const mongoose = await require('./initMongoose')(config.mongo_url).catch(err => debug.error(`MongoDB :`, err))

  // Passport
  !config.passport_disabled && require('./initPassport')(config, app)

  // GraphQL
  !config.graphql_disabled && require('./initGraphQL')(config, app)

  // Twitter
  config.twitter_consumer_key && config.twitter_consumer_secret && require('./initTwitter')(config, app)

  global.NAP.userEventHook = require('./user-event-hook')(config)

  // event handler
  require('./event-handlers')(config, app)

  // Store
  require('./initStore')(mongoose)

  // Next+Express Route
  await require('./initRoute')(config, app, nextjs)

  // Log Error
  if (config.express_logger_error_enabled) {
    const logs = require('./logs')
    const { errorOptions } = require('./logs/winston')
    logs.initErrorLogger(app, errorOptions)
  }

  // Finally
  await require('./finalizer')(config, app)

  return app
}
