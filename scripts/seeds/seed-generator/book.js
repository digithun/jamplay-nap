const casual = require('casual')
const _ = require('lodash')

const { writeSeed, loadSeedId, cover, preview, genArray } = require('../helpers')

const sequential = require('promise-sequential')

module.exports = async function generate () {
  const authorIds = loadSeedId('user')
  const tagIds = loadSeedId('tag')
  const authorId = authorIds[casual.integer(0, authorIds.length - 1)]
  const dumpBook = {
    _id: '58a6e85138cbdaba481a7b59',
    title: casual.title,
    episodeIds: [],
    thumbnailImage: await preview(),
    coverImage: await cover(),
    authorId,
    commentIds: [],
    tagIds: genArray(tagIds, 5),
    category: await casual.book_category,
    synopsis: casual.sentences(20),
    viewCount: casual.positive_int(10000),
    createdAt: casual.date
  }
  const books = await sequential(_.range(100).map(() => async () => {
    const authorId = authorIds[casual.integer(0, authorIds.length - 1)]
    return {
      _id: casual.objectId,
      title: casual.title,
      episodeIds: [],
      thumbnailImage: await preview(),
      coverImage: await cover(),
      authorId,
      commentIds: [],
      tagIds: genArray(tagIds, 5),
      category: await casual.book_category,
      synopsis: casual.sentences(20),
      viewCount: casual.positive_int(10000),
      createdAt: casual.date
    }
    // .then(book => {
    //   return genBookFollower(users, book).then(() => book);
    // });
  }))
  return writeSeed('book', [].concat([dumpBook], books))
}
