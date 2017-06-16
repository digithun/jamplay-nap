const { models } = require('../../graphql/clogii/models')

module.exports.modelMapping = {
  book: models.Book,
  episode: models.Episode,
  feed: models.Feed,
  tag: models.Tag,
  user: models.User,
  'book-follower': models.BookFollower,
  comment: models.Comment,
  'user-follower': models.UserFollower,
  recommend: models.RecommendBook,
  trending: models.TrendingBook
}

module.exports.models = models
