const { loadSeed, writeSeed, genArray, casual } = require('../helpers')

const sequential = require('promise-sequential')

module.exports = function generate () {
  const books = loadSeed('book')
  return sequential(genArray(books, books.length - 1).map(book => () => ({
    _id: casual.objectId,
    bookId: book._id,
    category: book.category
  })))
  .then(result => writeSeed('trending', result))
}
