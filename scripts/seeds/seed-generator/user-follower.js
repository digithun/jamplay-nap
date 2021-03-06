const { writeSeed, loadSeedId, genArray, casual } = require('../helpers');

module.exports = async function generate() {
  const userIds = loadSeedId('user');
  const authorIds = loadSeedId('user');
  let result = [];
  for (let i = 0; i < authorIds.length; i += 1) {
    const authorId = authorIds[i];
    result = [...result, ...genArray(userIds, 1000).map(userId => ({
      _id: casual.objectId,
      userId,
      followUserId: authorId,
    }))];
  }
  writeSeed('user-follower', result);
}
