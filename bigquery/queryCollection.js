require('isomorphic-fetch')

const {
   is_bigquery_enable,
   bigquery_api_endpoint,
   bigquery_authorization,
   bigquery_config
} = require('../server/config')

const getQueryResult = async (queryJsonString, redisClient) => {
   if (!is_bigquery_enable) {
      //warnng
      console.log('env is_bigquery_enable is disabled')
      return { err: 'env is_bigquery_enable is disabled' }
   }

   //cache
   if (redisClient) {
      const cache = await new Promise(resolve => {
         redisClient.get(queryJsonString, (err, reply) => {
            if (err) resolve(null)
            else resolve(reply)
         })
      })
      if (cache) return JSON.parse(cache)
   }

   //non cache
   const result = await fetch(bigquery_api_endpoint, {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Authorization": bigquery_authorization },
      body: queryJsonString
   }).catch((err) => { return err })

   const resultObj = await result.json().catch((err) => { return { err: err } })
   //save cache
   redisClient.setex(queryJsonString, bigquery_config.BIGQUERY_CACHE_TTL_SEC, JSON.stringify(resultObj))

   return resultObj
}

const getCountUsingQuery = async (queryJsonString, redisClient) => {
   const obj = await getQueryResult(queryJsonString, redisClient)
   //got error return -2
   if (obj.hasOwnProperty('err')) return 0

   //const json = await result.json().catch(() => { return [{ count: -1 }] })
   const count = obj.length == 0 ? 0 : obj[0].count
   return count
}

const getCustomCountByContentTypeAndContentId = async (contentType, contentId, redisClient) => {
   // const rng = Math.random()
   // console.time('getCustomCountByContentTypeAndContentId' + rng)
   //if disabled return -1
   if (!is_bigquery_enable) return 0

   const jsonString = JSON.stringify(bigquery_config.BIGQUERY_QUERY_COUNT_CONTENT).replace('{contentId}', contentId).replace('{contentType}', contentType)
   //run get count result
   const count = await getCountUsingQuery(jsonString, redisClient)
   // console.timeEnd('getCustomCountByContentTypeAndContentId' + rng)

   return count
}

const getClogCountById = (id, redisClient) => getCustomCountByContentTypeAndContentId('clogs', id, redisClient)
const getEpisodeCountById = (id, redisClient) => getCustomCountByContentTypeAndContentId('episodes', id, redisClient)

const bigqueryInit = (req, res, next) => {
   if (is_bigquery_enable) {
      req.bigQueryCollection = require('./queryCollection');
      req.bigQueryCollection.redisClient = require('redis').createClient({ host: 'redis', db: 2 })
   }
   next()
}

module.exports = { getCustomCountByContentTypeAndContentId, getClogCountById, getEpisodeCountById, bigqueryInit }
