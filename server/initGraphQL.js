const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const { apolloUploadExpress } = require('apollo-upload-server')
const { bigquery_service_endpoint, is_optics_enabled, dev } = require('./config')
const OpticsAgent = require('optics-agent')
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

const init = ({ graphiql_enabled: graphiql, tracing_enabled: tracing, base_url, port, e_wallet_enabled }, app) => {
  // Custom GraphQL
  const loader = {

  }
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

  // CORS
  const cors = require('cors')
  app.use(cors())

  // Helmet
  const helmet = require('helmet')
  app.use(helmet())

  // GraphQL
  const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')

  const { buildSchema } = require('./graphql')

  const { authenticate } = require('./jwt-token')
  const schema = is_optics_enabled ? OpticsAgent.instrumentSchema(buildSchema(loader)) : buildSchema(loader)
  is_optics_enabled && app.use(OpticsAgent.middleware())

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

  const initEWallet = (req, res, next) => {
    if (e_wallet_enabled) {
      req.ewallet = global.NAP.EWallet.getEWallet(req.token)
    }
    next()
  }
  const _removeUpload = () => removeUpload(24 * 60 * 60 * 1000)
  _removeUpload()
  const job = new CronJob({
    cronTime: '00 00 05 * * *',
    onTick: () => _removeUpload(),
    timeZone: 'Asia/Bangkok'
  })
  job.start()
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
    initEWallet,
    graphqlExpress(req => {
      return ({
        schema,
        tracing,
        context: {
          ...req,
          loader
        },
        formatError: ({ originalError, message, stack }) => {
          if (originalError && !(originalError instanceof GenericError)) {
            console.error('GraphQL track:', originalError)
          }
          return {
            message: message,
            code: originalError ? originalError.code : null,
            stack: dev ? stack.split('\n') : null
          }
        }
      })
    }
  ))

  graphiql && app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

  // Status
  debug.info(`GraphQL :`, graphiql ? `${base_url}/graphql` : 'N/A')
}

module.exports = init
