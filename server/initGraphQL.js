const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const { apolloUploadExpress } = require('apollo-upload-server')
const { bigquery_service_endpoint, is_optics_enabled, dev } = require('./config')
const OpticsAgent = require('optics-agent')
const { GenericError } = require('./errors')

// isomorphic-fetch
require('es6-promise').polyfill()
require('isomorphic-fetch')

const init = ({ graphiql_enabled: graphiql, base_url, port, e_wallet_enabled }, app) => {
  // Custom GraphQL
  NAP.expose = {
    extendModel: require('./graphql').extendModel,
    setBuildGraphqlSchema: require('./graphql').setBuildGraphqlSchema,
    FileType: require('./graphql/types/File'),
    GenderType: require('./graphql/types/Gender'),
    getFile: require('./graphql').getFile
  }

  if (fs.existsSync(path.resolve(__dirname, '../graphql/setup.js'))) {
    require('../graphql/setup')
  }

  // Upload
  const multer = require('multer')
  const upload = multer({ dest: './.tmp' })

  // CORS
  const cors = require('cors')
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

  // attach middleware
  if (bigquery_service_endpoint) {
    const { insertQuery, initMiddleWare } = require('../bigquery/queryCollection')
    app.all('/bigQuery/insert', (req, res) => insertQuery(req, res))
    app.use(initMiddleWare())
  }

  const initEWallet = (req, res, next) => {
    if (e_wallet_enabled) {
      req.ewallet = global.NAP.EWallet.getEWallet(req.token)
    }
    next()
  }
  app.use(
    '/graphql',
    function limit (req, res, next) {
      const len = req.headers['content-length'] ? parseInt(req.headers['content-length'], 10) : null
      if (!len) {
        return res.status(411).send('content-length not define')
      }
      if (req._limit) return next()
      req._limit = true

      if (len && len > 20 * 1024 * 1024) return res.status(413).send('content-length is to long')
      next()
    },
    bodyParser.json(),
    // upload.array('files'),
    apolloUploadExpress(),
    authenticate,
    initEWallet,
    graphqlHTTP(() => ({
      schema,
      graphiql,
      formatError: ({ originalError, message, stack }) => ({
        message: message,
        code: originalError ? originalError.code : null,
        stack: dev ? stack.split('\n') : null
      })
    }))
  )

  // Status
  debug.info(`GraphQL :`, graphiql ? `${base_url}/graphql` : 'N/A')
}

module.exports = init
