const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const { apolloUploadExpress } = require('apollo-upload-server')

const {
  is_optics_enabled,
  optics_api_key,

  is_bigquery_enabled,
  bigquery_config,
  redis_url } = require('./config')
const OpticsAgent = require('optics-agent')

// isomorphic-fetch
require('es6-promise').polyfill()
require('isomorphic-fetch')

const init = (config, app) => {
  NAP.expose = {
    extendModel: require('./graphql').extendModel,
    setBuildGraphqlSchema: require('./graphql').setBuildGraphqlSchema,
    FileType: require('./graphql/types/File'),
    getFile: require('./graphql').getFile
  }

  if (fs.existsSync(path.resolve(__dirname, '../graphql/setup.js'))) {
    require('../graphql/setup')
  }
  const cors = require('cors')
  const multer = require('multer')
  const upload = multer({ dest: './.tmp' })
  app.use(cors())

  // Helmet
  const helmet = require('helmet')
  app.use(helmet())

  // GraphQL
  const graphqlHTTP = require('express-graphql')

  const { buildSchema } = require('./graphql')

  const { authenticate } = require('./jwt-token')

  /// Optics
  let schema 
  if (is_optics_enabled) {
    const agent = new OpticsAgent.Agent({ apiKey: optics_api_key });
    schema = agent.instrumentSchema(buildSchema())
    app.use(OpticsAgent.middleware())
  } else schema = buildSchema()
  
  // bigquery
  if (is_bigquery_enabled && bigquery_config.hasOwnProperty('BIGQUERY_INSERT_BODY_TEMPLATE')) {
    const { bigqueryInitMiddleWare, insertQuery } = require('../bigquery/queryCollection')
    const bigQueryRedisClient = require('redis').createClient({ host: redis_url.replace('redis://', ''), db: 2, retry_unfulfilled_commands: true })
    bigQueryRedisClient.on('error', (err) => console.log('Error redisClient : ', err));

    app.post('/bigQuery/insert', (req, res) => insertQuery(req, res))
    app.use(bigqueryInitMiddleWare(bigQueryRedisClient))
  }

  app.use(
    '/graphql',
    bodyParser.json(),
    // upload.array('files'),
    apolloUploadExpress(),
    authenticate,
    graphqlHTTP((req) => {
      return {
        schema,
        opticsContext: OpticsAgent.context(req),
        graphiql: config.graphiql_enabled,
        formatError: (error) => ({
          message: error.message,
          stack: !error.message.match(/[NOSTACK]/i) ? error.stack.split('\n') : null
        })
      }
    })
  )
}

module.exports = init
