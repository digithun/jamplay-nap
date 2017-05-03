const { models } = require('../../graphql/clogii/models');

module.exports.modelMapping = {
  clog: models.Clog,
  episode: models.Episode,
  feed: models.Feed,
  tag: models.Tag,
  user: models.User,
  'clog-follower': models.ClogFollower,
  comment: models.Comment,
  'user-follower': models.UserFollower,
  recommend: models.RecommendClog,
  trending: models.TrendingClog,
};

module.exports.models = models;
