const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const { apolloUploadExpress } = require('apollo-upload-server')

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
  const schema = buildSchema()

  const initEWallet = (req, res, next) => {
    if (config.e_wallet_enabled) {
      req.ewallet = global.NAP.EWallet.getEWallet(req.token)
    }
    next()
  }

  app.use(
    '/graphql',
    bodyParser.json(),
    upload.array('files'),
    apolloUploadExpress(),
    authenticate,
    initEWallet,
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
