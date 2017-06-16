const {
  getCustomCountByContentTypeAndContentId, getBookCountById, getEpisodeCountById, insertQuery, bigqueryInitMiddleWare,
   _dynamicStringFactory, _getQueryResult, _getQueryCache, _getQueryManagedCache
} = require('../queryCollection')

describe('Test pure function', () => {
  test('_dynamicStringFactory', () => {
    let result = _dynamicStringFactory('five five five five is same as ${someValue}', { someValue: 5555 })
    expect(result).toEqual('five five five five is same as 5555')

    result = _dynamicStringFactory({ 'someValue': '${someValue}' }, { someValue: 5555 })
    expect(result).toEqual('{"someValue":"5555"}')

    result = _dynamicStringFactory('{"someValue":${someValue}}', { someValue: 5555 })
    expect(result).toEqual('{"someValue":5555}')
  })
})
