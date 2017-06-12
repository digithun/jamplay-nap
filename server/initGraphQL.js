const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const { apolloUploadExpress } = require('apollo-upload-server')

const { is_optics_enabled,
  is_bigquery_enabled,
  bigquery_config 
  redis_url} = require('./config')
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

  const schema = is_optics_enabled ? OpticsAgent.instrumentSchema(buildSchema()) : buildSchema()
  is_optics_enabled && app.use(OpticsAgent.middleware())

  // bigquery
  const { bigqueryInitMiddleWare, insertQuery } = require('../bigquery/queryCollection')
  if (is_bigquery_enabled && bigquery_config.hasOwnProperty('BIGQUERY_INSERT_BODY_TEMPLATE')) { app.post('/bigQuery/insert', (req, res) => insertQuery(req, res)) }

  const bigQueryRedisClient = is_bigquery_enabled ? require('redis').createClient({ host: redis_url.replace('redis://', ''), db: 2, retry_unfulfilled_commands: true }) : null
  bigQueryRedisClient && bigQueryRedisClient.on('error', (err) => console.log('Error redisClient : ', err));


  app.use(
    '/graphql',
    bodyParser.json(),
    // upload.array('files'),
    apolloUploadExpress(),
    authenticate,
    bigqueryInitMiddleWare(bigQueryRedisClient),
    graphqlHTTP(() => {
      return {
        schema,
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
