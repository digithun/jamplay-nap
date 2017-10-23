module.exports = async (config, nextjs) => {
  // NAP
  const nap = require('./initNAP')

  // Express
  const app = require('./initExpress')(config, nap)

  // Logs (Don't change  order from now on!)
  const logs = require('./logs')

  // Log
  const { ignoredRoutes, options, errorOptions } = require('./logs/winston')
  if (process.env.npm_package_config_express_logger_enabled) {
    logs.initLoggerIgnore(ignoredRoutes)
    logs.initLogger(app, options)
  }

  // MubSub
  config.mubsub_enabled && require('./initMubsub')()

  // Mongoose
  const mongoose = await require('./initMongoose')(config.mongo_url).catch(err => debug.error(`MongoDB :`, err))

  // Passport
  !config.passport_disabled && require('./initPassport')(config, app)

  // EWallet
  config.e_wallet_enabled && require('./initEWallet')(config, app)

  // GraphQL
  !config.graphql_disabled && require('./initGraphQL')(config, app)

  // Twitter
  config.twitter_consumer_key && config.twitter_consumer_secret && require('./initTwitter')(config, app)

  global.NAP.userEventHook = require('./user-event-hook')(config)

  // Store
  require('./initStore')(mongoose)

  // Next+Express Route
  await require('./initRoute')(config, app, nextjs)

  // Log Error
  process.env.npm_package_config_express_logger_error_enabled && logs.initErrorLogger(app, errorOptions)

  // Finally
  await require('./finalizer')(config, app)

  return app
}
