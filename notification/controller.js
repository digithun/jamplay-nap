
const mongoose = require('mongoose')
const objectId = mongoose.Types.ObjectId
const chalk = require('chalk')
const Notification = require('./models/Notification.model')

// set max notification
const MAX_NOTIFICATION_PER_USER = 5

const getNotification = exports.getNotification = async function getNotification (userId) {
  console.log('Notification get for user: ' + userId)
  const result = await Notification.find({userId: objectId(userId)}).sort({createdAt: -1})
  if (!result) {
    return []
  }
  return result
}

const createNotification = exports.createNotification = async function createNotification (userId, message) {
  console.log(chalk.yellow('Notification created to user: ') + userId)
  const notification = new Notification({
    userId,
    message
  })
  await notification.save()

  const userNotifications = await Notification.find({ userId: objectId(userId) }).sort({createdAt: -1})
  // check if user have limit of notification
  if (userNotifications.length > MAX_NOTIFICATION_PER_USER - 1) {
    const willRemoveNoti = userNotifications.filter((notification, index) => index > MAX_NOTIFICATION_PER_USER - 1).map(notification => notification._id)
    await Notification.remove({_id: {$in: willRemoveNoti}})
  }
  return notification
}

const markNotification = exports.markNotification = async function markNotification (notificationIds) {
  console.log('Notification mark: ' + notificationIds.join(','))
  await Notification.update({_id: {$in: notificationIds}}, { $set: {isRead: true} }, { multi: true })
}
const readNotification = async function (userId) {
  console.log('Notification read from user: ' + userId)
  const result = await getNotification(userId)
  const ids = result.map(notification => notification._id)
  await markNotification(ids)
  return result
}

// Expose service
exports.services = {
  createNotification,
  readNotification,
  getNotification
}
