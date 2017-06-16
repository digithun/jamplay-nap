const { loadSeed, writeSeed, genArray } = require('../helpers')

module.exports = async function generate () {
  const users = loadSeed('user')
  const books = loadSeed('book')
  const episodes = loadSeed('episode')
  users.forEach((user) => {
    user.bookmarks = []
  })
  users.forEach((user) => {
    genArray(episodes, 30).forEach((ep) => {
      user.bookmarks.push({
        url: `player/${ep._id}`,
        bookId: ep.bookId,
        episodeId: ep._id
      })
    })
  })
  users.forEach((user) => {
    genArray(books, 5).forEach((book) => {
      user.bookmarks.push({
        url: `book/${book._id}`,
        bookId: book._id
      })
    })
  })
  writeSeed('user', users)
}
