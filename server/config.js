// Helper
const dev = process.env.NODE_ENV !== 'production'

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

  passport_disabled: parseInt(process.env.PASSPORT_DISABLED || '0') === 1,
  graphql_disabled: parseInt(process.env.GRAPHQL_SERVER_DISABLED || '0') === 1,
  graphiql_enabled: process.env.GRAPHIQL_ENABLED !== undefined ? parseInt(process.env.GRAPHIQL_ENABLED || '0') === 1 : dev,

  mubsub: process.env.MUBSUB_URI,
  mubsub_enabled: process.env.MUBSUB_URI !== undefined && !!process.env.MUBSUB_URI,

  // appolo optics
  is_optics_enabled: parseInt(process.env.IS_OPTICS_ENABLED || '0') === 1,
  optics_api_key: process.env.OPTICS_API_KEY || 'foo',
  
  // BigQuery
  bigquery_api_endpoint: process.env.BIGQUERY_API_ENDPOINT || 'http://bigquery',
  bigquery_authorization: process.env.BIGQUERY_AUTHORIZATION || 'foo',
  bigquery_config: process.env.hasOwnProperty('BIGQUERY_CONFIG') && require(process.env.BIGQUERY_CONFIG) || (() => {
    console.log('Warning, you must provide a path for BIGQUERY_CONFIG ENV, so that bigquery will execute normally, see .env.example for detail')
    return {}
  })(),
  bigquery_route_map: process.env.hasOwnProperty('BIGQUERY_ROUTE_MAP') && require(process.env.BIGQUERY_ROUTE_MAP) || (() => {
    console.log('Warning, you must provide a path for BIGQUERY_ROUTE_MAP ENV, so that bigquery can map route to collection correctly, see .env.example for detail')
    return {}
  })(),
  bigquery_projectid: process.env.BIGQUERY_PROJECTID || 'foo',
  bigquery_logevent_datasetid: process.env.BIGQUERY_LOGEVENT_DATASETID || 'foo',
  bigquery_navigation_tableid: process.env.BIGQUERY_NAVIGATION_TABLEID || 'foo',
  is_bigquery_debug_enabled: parseInt(process.env.IS_BIGQUERY_DEBUG_ENABLED || '0') === 1,
  is_bigquery_enabled: parseInt(process.env.IS_BIGQUERY_ENABLED || '0') === 1,
}

module.exports = config
