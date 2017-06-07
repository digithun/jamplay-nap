require('isomorphic-fetch')
const {
   bigquery_api_endpoint,
   bigquery_authorization,
   bigquery_config
} = require('../server/config')

const getCustomCountByContentTypeAndContentId = (contentType, contentId) => {
   const tempCopy = Object.assign({}, bigquery_config.BIGQUERY_QUERY_COUNT_CONTENT)
   tempCopy.params.query = tempCopy.params.query.replace('{contentId}', contentId).replace('{contentType}', contentType)
   //TODO get query from cache
   return new Promise((resolve) => {
      fetch(bigquery_api_endpoint, {
         method: 'POST',
         headers: { "Content-Type": "application/json", "Authorization": bigquery_authorization },
         body: JSON.stringify(tempCopy)
      }).then(async (result) => {
         const json = await result.json()
         console.log('getCustomCountByContentTypeAndContentId result', json)
         if (json.length == 0) resolve(0)
         else resolve(json[0].count)

      }).catch((err) => {
         console.log('getCustomCountByContentTypeAndContentId err ', err)
         resolve(0)
      })
   })
}

const getClogCountById = (clogId) => getCustomCountByContentTypeAndContentId('clogs', clogId)
const getEpisodeCountById = (clogId) => getCustomCountByContentTypeAndContentId('episodes', clogId)

module.exports = { getCustomCountByContentTypeAndContentId, getClogCountById, getEpisodeCountById }