const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  text: String,
  textAttr: mongoose.Schema.Types.Mixed
})

const Notification = mongoose.model('Notification', mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  message: { type: MessageSchema },
  isRead: { type: Boolean, default: false, index: true }
}, { timestamps: true }))

module.exports = Notification
