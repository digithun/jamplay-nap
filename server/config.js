// Helper
const dev = process.env.NODE_ENV !== 'production'
const test = process.env.NODE_ENV === 'test'

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

const throwError = msg => {
  throw new Error(msg)
}

// Constants
const _SESSIONS_TTL_ONE_WEEK = 7 * 24 * 60 * 60 * 1000
const config = {
  // Environments
  dev,

  // logs
  log_port: process.env.LOG_PORT || 3001,
  express_logger_access_enabled: isTrue(process.env.EXPRESS_LOGGER_ACCESS_ENABLED),
  express_logger_error_enabled: isTrue(process.env.EXPRESS_LOGGER_ERROR_ENABLED),

  // Blacklist routes
  express_logger_ignored_routes: process.env.EXPRESS_LOGGER_IGNORED_ROUTES || '',
  // Log dir name default to `logs`
  logger_logs_dirname: process.env.LOGGER_LOGS_DIRNAME || 'logs',
  // Log file name default to `package.name.access`
  logger_access_filename: process.env.LOGGER_ACCESS_FILENAME || `${require('../package.json').name}.access`,
  // Error file name default to `package.name.error`
  logger_error_filename: process.env.LOGGER_ERROR_FILENAME || `${require('../package.json').name}.error`,

  // Passport
  mailgun_api_key: process.env.MAILGUN_API_KEY,
  mailgun_domain: process.env.MAILGUN_DOMAIN,

  // Services
  redis_url: process.env.REDIS_URI || 'redis://redis',
  mongo_url: process.env.MONGODB_URI || 'mongodb://mongo/graphql',
  base_url: process.env.BASE_URL || `http://localhost:3000`,

  // Security
  cookie_secret: process.env.COOKIE_SECRET || 'foo',
  jwt_secret: process.env.JWT_SECRET || 'foo',
  sessions_ttl: parseInt(process.env.SESSIONS_TTL || '0') || _SESSIONS_TTL_ONE_WEEK,
  auth_local_uri: process.env.AUTH_LOCAL_URI || '/auth/local',
  auth_validate_reset_uri: process.env.AUTH_VALIDATE_RESET_URI || '/auth/validate-reset',
  auth_reset_uri: process.env.AUTH_RESET_URI || '/auth/reset',
  auth_new_reset_uri: process.env.AUTH_NEW_RESET_URI || '/auth/reset',
  auth_verified_uri: process.env.AUTH_VERIFIED_URI || '/auth/verified',
  auth_change_email_uri: process.env.AUTH_CHANGE_EMAIL_URI || '/auth/change-email',
  auth_error_uri: process.env.AUTH_ERROR_URI || '/auth/error',
  achievement_service_url: process.env.ACHIEVEMENT_SERVICE_URL,
  achievement_service_api_key: process.env.ACHIEVEMENT_SERVICE_API_KEY,
  next_disabled: isTrue(process.env.NEXT_DISABLED),
  passport_disabled: isTrue(process.env.PASSPORT_DISABLED),
  graphql_disabled: isTrue(process.env.GRAPHQL_SERVER_DISABLED),
  graphiql_enabled: dev || isTrue(process.env.GRAPHIQL_ENABLED),
  tracing_enabled: dev || isTrue(process.env.TRACING_ENABLED),

  mubsub: process.env.MUBSUB_URI,
  mubsub_enabled: process.env.MUBSUB_URI !== undefined && !!process.env.MUBSUB_URI,

  e_wallet_api: process.env.E_WALLET_API,
  e_wallet_enabled: process.env.E_WALLET_API !== undefined && !!process.env.E_WALLET_API,
  e_wallet_secret: process.env.E_WALLET_SECRET,

  // Apollo optics
  is_optics_enabled: isTrue(process.env.IS_OPTICS_ENABLED),

  // BigQuery
  bigquery_service_endpoint: process.env.BIGQUERY_SERVICE_ENDPOINT || null,

  // s3
  static_resolve_url: process.env.STATIC_RESOLVE_URL || test || throwError('static resolve url is not defined'),
  // ImageRenderService
  share_image_service_url: process.env.SHARE_IMAGE_SERVICE_URL || test || throwError('share image service is not defined'),
  share_image_service_api_key: process.env.SHARE_IMAGE_SERVICE_API_KEY || test || throwError('share image service api key not defined'),

  // TWITTER
  twitter_consumer_key: process.env.TWITTER_CONSUMER_KEY,
  twitter_consumer_secret: process.env.TWITTER_CONSUMER_SECRET
}

module.exports = config
