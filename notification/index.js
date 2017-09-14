const express = require('express')
const handler = require('./handler')

const notificationRouter = express.Router()

notificationRouter.post('/:userId', handler('create'))
notificationRouter.get('/:userId', handler('read'))
notificationRouter.put('/:notificationId', handler('update'))
notificationRouter.delete('/:notificationId', handler('delete'))

exports.handler = notificationRouter

if (process.env.STANDALONE) {
  const app = express()
  const mongoose = require('mongoose')
  global.debug = {
    error: () => {},
    info: () => {}
  }
  require('dotenv').config({})

  // connect to DB
  require('../server/initMongoose')(process.env.MONGODB_URI)
  mongoose.Promise = global.Promise
  // setup express
  const bodyParser = require('body-parser')
  app.use(bodyParser.json({ extend: true }))
  app.use('/', notificationRouter)
  app.listen(3406, () => {
    console.log('Notification service start at port: 3406')
  })
}
