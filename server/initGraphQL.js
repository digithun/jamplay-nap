const fs = require('fs')
const costAnalysis = require('graphql-cost-analysis').default
const path = require('path')
const bodyParser = require('body-parser')
const { apolloUploadExpress } = require('jamplay-apollo-upload-server')
const connectors = require('./connectors')
const { bigquery_service_endpoint, dev } = require('./config')
const rimraf = require('rimraf')
const CronJob = require('cron').CronJob
// isomorphic-fetch
require('es6-promise').polyfill()
require('isomorphic-fetch')

const { GenericError } = require('./errors')
require('./debug')

const uploadDir = './.tmp'

// https://stackoverflow.com/questions/19167297/in-node-delete-all-files-older-than-an-hour
function removeUpload (ms) {
  debug.info(`GraphQL : cleaning ${uploadDir}`)
  if (!fs.existsSync(uploadDir)) {
    return
  }
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return debug.error('GraphQL :', err)
    }
    files.forEach(function (file, index) {
      fs.stat(path.join(uploadDir, file), function (err, stat) {
        var endTime, now
        if (err) {
          return debug.error('GraphQL :', err)
        }
        now = new Date().getTime()
        endTime = new Date(stat.ctime).getTime() + ms
        if (now > endTime) {
          return rimraf(path.join(uploadDir, file), function (err) {
            if (err) {
              return debug.error(err)
            }
            debug.info(`GraphQL : removed ${uploadDir}/${file}`)
          })
        }
      })
    })
  })
}

const init = (config, app) => {
  const { graphiql_enabled, tracing_enabled, tracing_uri, base_url, optics_api_key } = config

  // Custom GraphQL
  NAP.expose = {
    getModel: require('./graphql').getModel,
    config: require('./graphql').config,
    FileType: require('./graphql/types/File'),
    GenderType: require('./graphql/types/Gender'),
    getFile: require('./graphql').getFile
  }

  if (fs.existsSync(path.resolve(__dirname, '../graphql/setup.js'))) {
    require('../graphql/setup')
  }

  // GraphQL
  const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
  const { buildSchema } = require('./graphql')

  // Optics
  optics_api_key && debug.info(`Optics  : ${config.optics_api_key}`)
  optics_api_key && app.use(require('optics-agent').middleware())
  const schema = (optics_api_key && require('optics-agent').instrumentSchema(buildSchema())) || buildSchema()

  const { authenticate } = require('./jwt-token')

  // attach middleware
  if (bigquery_service_endpoint) {
    const { insertQuery, initMiddleWare } = require('../bigquery/queryCollection')
    const chalk = require('chalk')
    app.all('/bigquery/insert', async (req, res) => {
      try {
        insertQuery(req, res)
      } catch (e) {
        console.log(chalk.bgRed('BigQuery service error'))
        res.status(501).end()
      }
    })
    app.use(initMiddleWare())
  }

  const _removeUpload = () => removeUpload(24 * 60 * 60 * 1000)
  _removeUpload()
  const job = new CronJob({
    cronTime: '00 00 05 * * *',
    onTick: () => _removeUpload(),
    timeZone: 'Asia/Bangkok'
  })
  job.start()

  // Tracing
  tracing_enabled && tracing_uri && require('./logs/graphql-tracing').init(tracing_uri)

  const costMap = require('./graphql').costMap

  app.use(
    '/graphql',
    // http://www.senchalabs.org/connect/limit.html
    function limit (req, res, next) {
      let received = 0
      const bytes = 20 * 1024 * 1024
      const len = req.headers['content-length'] ? parseInt(req.headers['content-length'], 10) : null

      if (len && len > bytes) return res.status(413).send('content-length is to long')

      req.on('new Listener', function handler (event) {
        if (event !== 'data') return

        req.removeListener('new Listener', handler)
        process.nextTick(listen)
      })

      next()

      function listen () {
        req.on('data', function (chunk) {
          received += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk)

          if (received > bytes) req.destroy()
        })
      }
    },
    bodyParser.json(),
    // upload.array('files'),
    apolloUploadExpress({
      uploadDir
    }),
    authenticate,
    graphqlExpress(async (req) => {
      const { referer } = req.headers
      const extendContext = require('./graphql').getGraphQLExtendedContext(req)
      const opticsContext = optics_api_key && require('optics-agent').context(req)
      const context = {
        ...req,
        ...extendContext,
        opticsContext,
        ...connectors({ req, config })
      }
      // }
      return {
        schema,
        tracing: tracing_enabled,
        validationRules: [
          costMap ? costAnalysis({
            costMap,
            variables: req.body.variables,
            maximumCost: 300,
            defaultCost: 1
          }) : null
        ].filter(a => !!a),
        context,
        formatError: ({ originalError, message, stack }) => {
          if (originalError && !(originalError instanceof GenericError)) {
            console.error('GraphQL track:', originalError)
          }
          return {
            message: message,
            code: originalError ? originalError.code : null,
            stack: dev ? stack.split('\n') : null
          }
        },
        formatResponse: res => {
          if (tracing_enabled) {
            require('./logs/graphql-tracing').trace(referer, res.extensions.tracing)
            tracing_uri && debug.info(`Tracing : ${tracing_uri}`)
          }

          return res
        }
      }
    })
  )

  // GraphiQL
  graphiql_enabled && app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

  // Status
  graphiql_enabled && debug.info(`GraphiQL: ${base_url}/graphiql`)
  debug.info(`GraphQL : ${base_url}/graphql`)
}

module.exports = init
