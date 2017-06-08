const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const { apolloUploadExpress } = require('apollo-upload-server')

const { is_optics_enabled,
  is_bigquery_enable,
  bigquery_config } = require('./config')
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

  //bigquery
  const { bigqueryInit, insertQuery } = require('../bigquery/queryCollection')
  if (is_bigquery_enable && bigquery_config.hasOwnProperty('BIGQUERY_INSERT_BODY_TEMPLATE'))
    app.post('/bigQuery/insert', (req, res) => insertQuery(req, res))

  app.use(
    '/graphql',
    bodyParser.json(),
    // upload.array('files'),
    apolloUploadExpress(),
    authenticate,
    bigqueryInit,
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
