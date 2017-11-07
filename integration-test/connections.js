const MongoClient = require('mongodb').MongoClient
const userUtils = require('./utils/user')

module.exports = async () => {
  const content = await MongoClient.connect(process.env.INTEGRATION_CONTENT_MONGODB_URI)

  return {
    content,
    utils: {
      user: userUtils(content)
    }
  }
}
