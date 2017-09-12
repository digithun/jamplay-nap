module.exports = async (config, nextjs) => {
  // NAP
  const nap = require('./initNAP')

  // Express
  const app = require('./initExpress')(config, nap)

  // MubSub
  config.mubsub_enabled && require('./initMubsub')()

  // Mongoose
  const mongoose = await require('./initMongoose')(config.mongo_url)

  // Passport
  !config.passport_disabled && require('./initPassport')(config, app)

  // EWallet
  config.e_wallet_enabled && require('./initEWallet')(config, app)

  // GraphQL
  !config.graphql_disabled && require('./initGraphQL')(config, app)

  global.NAP.userEventHook = require('./user-event-hook')(config)

  // Store
  require('./initStore')(mongoose)

  // Next+Express
  return require('./initRoute')(config, app, nextjs)
}
