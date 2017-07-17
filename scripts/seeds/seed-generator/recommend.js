const { casual, loadSeedId, writeSeed, genFixArray } = require('../helpers')

module.exports = async function generate () {
  const bookIds = loadSeedId('book')
  const categoryRecommends = ['N', 'M', 'D', 'G'].map(c => ({
    _id: casual.objectId,
    type: `CATEGORY_${c}`,
    bookIds: genFixArray(bookIds, 10)
  }))
  const shelfRecommends = {
    _id: casual.objectId,
    type: 'shelf',
    bookIds: genFixArray(bookIds, 1)
  }
  const heroBanners = {
    _id: casual.objectId,
    type: 'heroBanner',
    bookIds: genFixArray(bookIds, 10)
  }
  const result = [...categoryRecommends, shelfRecommends, heroBanners]
  writeSeed('recommend', result)
}
