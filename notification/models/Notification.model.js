const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  text: String,
  textAttr: mongoose.Schema.Types.Mixed
})

const Notification = mongoose.model('Notification', mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  message: { type: MessageSchema },
  isRead: { type: Boolean, default: false }
}, { timestamps: true }))

module.exports = Notification
