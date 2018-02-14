const bodyParser = require('body-parser')
const Joi = require('joi')

const ewalletPayloadSchema = Joi.object().keys({
  amountIn: Joi.number().greater(0),
  amountOut: Joi.number().greater(0),
  conversion: Joi.string(),
  promotionType: Joi.string().allow(null),
  promotion: Joi.any(),
  exchangeType: Joi.string(),
  provider: Joi.string()
})

const notificationSchema = Joi.object().keys({
  text: Joi.string().required(),
  textAttr: Joi.object()
})

function ewalletHandlers (event, context) {
  if (event.type === 'notification/create') {
    const schemaError = Joi.validate(event.payload, notificationSchema).error
    if (!event.userId) {
      console.error('notification/create have no userId')
      return
    }
    if (schemaError !== null) {
      console.error('got schemaError', schemaError)
      return
    }
    context.nap.notificationService.createNotification(event.userId, event.payload)
  } else if (event.type === 'ewallet/topup-success') {
    const schemaError = Joi.validate(event.payload, ewalletPayloadSchema).error
    if (!event.userId) {
      console.error('ewallet/topup have no userId')
      return
    }
    if (schemaError !== null) {
      console.error('got schemaError', schemaError)
      return
    }
    if (event.payload.provider === 'provider/achievement') {
      context.nap.notificationService.createNotification(event.userId, {
        text: event.payload.exchangeType,
        textAttr: {
          silver: event.payload.amountOut
        }
      })
    } else {
      context.nap.notificationService.createNotification(event.userId, {
        text: 'payment/payment-complete'
      })
    }
  } else if (event.type === 'ewallet/topup-fail') {
    if (!event.userId) {
      console.error('ewallet/topup have no userId')
      return
    }
    context.nap.notificationService.createNotification(event.userId, {
      text: 'payment/payment-error'
    })
  }
}

module.exports = function initEventHandler (config, app) {
  app.post('/event',
    bodyParser.json(),
    function (req, res, next) {
      if (req.header('x-api-key') !== process.env.EVENT_SERVICE_API_KEY) {
        console.error('event wrong key')
        res.status(403).end()
      } else {
        next()
      }
    },
    async function (req, res) {
      ewalletHandlers(req.body, req)
      res.send()
    }
  )
}
