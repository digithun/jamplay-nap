const _ = require('lodash')

const { casual, loadSeed, preview, writeSeed } = require('../helpers')

const sequential = require('promise-sequential')

module.exports = async function generate () {
  const books = loadSeed('book')
  const dumpBook = books[0]
  const dumpEpisode = {
    _id: '58b95c905923032426ceb6ce',
    bookId: dumpBook._id,
    no: 99,
    title: casual.title,
    thumbnailImage: await preview(),
    commentIds: [],
    viewCount: casual.integer(0, 3000),
    createdAt: casual.date,
    data: null
  }
  const episodes = await sequential(
    books.map(book => () =>
      sequential(
        _.range(casual.integer(0, 40)).map(idx => async () => ({
          _id: casual.objectId,
          bookId: book._id,
          no: idx + 1,
          title: casual.title,
          thumbnailImage: await preview(),
          commentIds: [],
          viewCount: casual.integer(0, 3000),
          createdAt: casual.date,
          data: null
        }))
      ).then((eps) => {
        book.episodeIds = []
        eps.sort((a, b) => Number(a.no) - Number(b.no)).forEach((ep) => {
          book.episodeIds.push(ep._id)
        })
        return eps
      })
    )
  )
  .then(result => [].concat(...result))
  writeSeed('episode', [dumpEpisode, ...episodes])
  writeSeed('book', books)
}
