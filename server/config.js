// Helper
const dev = process.env.NODE_ENV !== 'production'
const isTrue = value => {
  switch (value) {
    case true:
      return true
    case 'true':
      return true
    case 1:
      return true
    case '1':
      return true
    default:
      return false
  }
}
// Constants
const _SESSIONS_TTL_ONE_WEEK = 7 * 24 * 60 * 60 * 1000

const config = {
  // Environments
  dev,

  // Passport
  mailgun_api_key: process.env.MAILGUN_API_KEY,
  mailgun_domain: process.env.MAILGUN_DOMAIN,

  // Services
  redis_url: process.env.REDIS_URI || 'redis://redis',
  mongo_url: process.env.MONGODB_URI || 'mongodb://mongo/graphql',
  port: parseInt(process.env.PORT || '0') || 3000,

  // Security
  cookie_secret: process.env.COOKIE_SECRET || 'foo',
  jwt_secret: process.env.JWT_SECRET || 'foo',
  sessions_ttl: parseInt(process.env.SESSIONS_TTL) || _SESSIONS_TTL_ONE_WEEK,
  auth_local_uri: process.env.AUTH_LOCAL_URI || '/auth/local',
  auth_reset_uri: process.env.AUTH_RESET_URI || '/auth/reset',
  auth_new_reset_uri: process.env.AUTH_NEW_RESET_URI || '/auth/reset',
  auth_verified_uri: process.env.AUTH_VERIFIED_URI || '/auth/verified',
  auth_error_uri: process.env.AUTH_ERROR_URI || '/auth/error',

  next_disabled: isTrue(process.env.NEXT_DISABLED),
  passport_disabled: isTrue(process.env.PASSPORT_DISABLED),
  graphql_disabled: isTrue(process.env.GRAPHQL_SERVER_DISABLED),
  graphiql_enabled: dev || isTrue(process.env.GRAPHIQL_ENABLED),

  mubsub: process.env.MUBSUB_URI,
  mubsub_enabled: process.env.MUBSUB_URI !== undefined && !!process.env.MUBSUB_URI,

  e_wallet_api: process.env.E_WALLET_API,
  e_wallet_enabled: process.env.E_WALLET_API !== undefined && !!process.env.E_WALLET_API,

  // Apollo optics
  is_optics_enabled: isTrue(process.env.IS_OPTICS_ENABLED),

  // BigQuery
  bigquery_service_endpoint: process.env.BIGQUERY_SERVICE_ENDPOINT || null
}

module.exports = config
