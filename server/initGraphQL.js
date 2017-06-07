const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const { apolloUploadExpress } = require('apollo-upload-server')

const { is_optics_enabled,
  bigquery_api_endpoint,
  bigquery_authorization,
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

  // bigquery
  if (bigquery_config.hasOwnProperty('BIGQUERY_INSERT_BODY_TEMPLATE')) {
    app.use('/bigQuery/insert', (req, res) => {
      console.log('+1 views for ', req.body.rows.contentId)
      const { convertRouteNameToCollection } = require('../bigquery/routeCollection.helper')
    // copy from template
      const bodyObj = Object.assign({}, bigquery_config.BIGQUERY_INSERT_BODY_TEMPLATE)
    // modify params
      bodyObj.params = Object.assign(bodyObj.params, {
        tableId: req.body.tableId || bodyObj.params.tableId,
        rows: req.body.rows
      })
    // fix row route name
      bodyObj.params.rows = convertRouteNameToCollection(bodyObj.params.rows)

    // map raw route to collection
      fetch(bigquery_api_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': bigquery_authorization },
        body: JSON.stringify(bodyObj)
      }).then(fetchRes => {
        res.sendStatus(fetchRes.status)
      })
    })
  }

  const makeContext = (req) => {
    const context = is_optics_enabled ? Object.assign({
      opticsContext: OpticsAgent.context(req)
    }, req) : req

    context.bigQueryCollection = require('../bigquery/queryCollection')

    return context
  }

  app.use(
    '/graphql',
    bodyParser.json(),
    // upload.array('files'),
    apolloUploadExpress(),
    authenticate,
    graphqlHTTP((req) => {
      req.bigQueryCollection = require('../bigquery/queryCollection')
      return {
        schema,
        context: req,
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
