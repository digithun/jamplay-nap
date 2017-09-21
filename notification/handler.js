const mongoose = require('mongoose')
const objectId = mongoose.Types.ObjectId
const { getNotification, createNotification, markNotification } = require('./controller')

module.exports = function (action) {
  switch (action) {
    case 'read':
      return async (req, res) => {
        const { userId } = req.params
        if (!objectId.isValid(userId)) {
          return res.status(400).send('userId is invalid')
        }
        const result = await getNotification(userId)
        await markNotification(result.map(notification => notification._id))
        return res.json({
          result,
          count: result.length
        })
      }
    case 'create':
      return async (req, res) => {
        const { message } = req.body
        const { userId } = req.params
        if (!userId || !message) {
          return res.status(400).end()
        }
        const result = await createNotification(userId, message)
        res.json({
          result,
          count: result.length
        })
      }
    default:
      return (req, res) => {
        res.status(404).end()
      }
  }
}
