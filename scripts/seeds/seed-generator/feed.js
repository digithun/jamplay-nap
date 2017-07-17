const { casual, loadSeed, writeSeed } = require('../helpers')

module.exports = function generate () {
  const books = loadSeed('book')
  const feedBooks = books.map(book => ({
    _id: casual.objectId,
    authorId: book.authorId,
    bookId: book._id,
    createdAt: book.createdAt
  }))
  writeSeed('feed', feedBooks)
}
