const bcrypt = require('bcryptjs')

module.exports = db => ({
  create: async (payload) => {
    const users = db.collection('users')
    const userInsertResult = await users.insertOne({
      ...payload,
      hashed_password: bcrypt.hashSync(payload.password, bcrypt.genSaltSync(10))
    })
    if (!userInsertResult.insertedId) {
      return null
    }
    return users.findOne({ _id: userInsertResult.insertedId })
  },
  delete: (user) => {
    return db.collection('users').deleteOne({ _id: user._id })
  }
})
