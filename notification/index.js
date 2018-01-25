const express = require('express')
const handler = require('./handler')
const {decodeToken} = require('../server/jwt-token')
const { services } = require('./controller')
const joi = require('joi')

const notificationRouter = express.Router()

notificationRouter.post('/:userId', handler('create'))
notificationRouter.get('/:userId', handler('read'))
notificationRouter.put('/:notificationId', handler('update'))
notificationRouter.delete('/:notificationId', handler('delete'))

exports.handler = notificationRouter

const mongoose = require('mongoose')
if (process.env.ENABLED_NOTIFICATION_SERVICE) {
  console.log('Start notification service.....')
  const notificationServicePrivate = express()
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
  notificationServicePrivate.use(bodyParser.json({ extend: true }))
  notificationServicePrivate.use('/', notificationRouter)
  notificationServicePrivate.listen(3406, () => {
    console.log('Notification service start at port: 3406')
  })
}

/**
 * Wed, 24 Jan 2018
 * Notification public API use to
 * keep client update about notification change
 * by streaming long polling status
 * Maintainer
 * - rungsikorn.r@digithun.co.th
 */
exports.initPollingHandler = function (notificationPublic) {
  const bearerToken = require('express-bearer-token')
  console.log('[notification] init Polling handler')
  notificationPublic.use('/polling', bearerToken(), async function (req, res, next) {
    try {
      const result = await decodeToken(req.token)
      req.user = result
      next()
    } catch (e) {
      res.status(401).json({'message': e.message})
    }
  })

  const pollingQuerySchema = joi.object().keys({
    interval: joi.number().default(1000).min(500).max(5000),
    duration: joi.number().default(10000).max(30000).min(5000)
  })
  notificationPublic.get('/polling', (req, res) => {
    const { value, error } = pollingQuerySchema.validate(req.query)
    const { interval, duration } = value
    const { userId } = req.user
    console.log(`[notification] ${userId} ${interval} ${duration}`)
    if (error) {
      res.status(400).json({message: error})
      return
    }
    // start streaming response
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.status(200)

    let streamingTick
    let isEnd
    const writeResult = async () => {
      try {
        const isUpdated = await services.countUnreadNotification(userId)
        if (!isEnd) {
          res.write(`?;?${JSON.stringify({ isUpdated })}`)
        }
        setTimeout(writeResult, interval)
      } catch (e) {
        console.error(e, req.user)
        clearInterval(streamingTick)
      }
    }

    streamingTick = setTimeout(writeResult, interval)

    setTimeout(() => {
      if (streamingTick) {
        clearInterval(streamingTick)
        isEnd = true
      }
      res.write(`?;?${JSON.stringify({done: true})}`)
      res.end()
    }, duration)
  })
}
