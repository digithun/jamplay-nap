const { writeSeed, loadSeedId, genArray, casual } = require('../helpers')

module.exports = async function generate () {
  const userIds = loadSeedId('user')
  const bookIds = loadSeedId('book')
  let result = []
  for (let i = 0; i < bookIds.length; i += 1) {
    const bookId = bookIds[i]
    result = [...result, ...genArray(userIds, 1000).map(userId => ({
      _id: casual.objectId,
      userId,
      bookId
    }))]
  }
  writeSeed('book-follower', result)
}
