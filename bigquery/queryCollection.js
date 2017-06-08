require('isomorphic-fetch')

const {
   is_bigquery_enable,
   bigquery_api_endpoint,
   bigquery_authorization,
   bigquery_config,
   bigquery_projectid,
   bigquery_logevent_datasetid,
   bigquery_navigation_tableid,
   redis_url
} = require('../server/config')

String.prototype.replaceAll = (search, replacement) => {
   let target = this
   return target.replace(new RegExp(search, 'g'), replacement)
}

const _dynamicJsonFactory = (json, objectKeyValue) => {
   const jsonString = JSON.stringify(json)

   for (let key in objectKeyValue) {
      jsonString.replaceAll('${' + key + '}', objectKeyValue[key])
   }
   jsonString.replaceAll('${projectId}', bigquery_projectid)

   return jsonString
}

const _getQueryResult = async (queryJsonString, redisClient) => {
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

const getCustomCountByContentTypeAndContentId = async (contentType, contentId, redisClient) => {
   // const rng = Math.random()
   // console.time('getCustomCountByContentTypeAndContentId' + rng)
   //if disabled return 0
   if (!is_bigquery_enable) return 0

   const jsonString = _dynamicJsonFactory(bigquery_config.BIGQUERY_QUERY_COUNT_CONTENT, {
      datasetId: bigquery_logevent_datasetid,
      tableId: bigquery_navigation_tableid,
      contentId,
      contentType
   })

   //run get count result
   const obj = await _getQueryResult(jsonString, redisClient)
   //got error return -2
   if (obj.hasOwnProperty('err')) return 0

   //const json = await result.json().catch(() => { return [{ count: -1 }] })
   const count = obj.length == 0 ? 0 : obj[0].count
   // console.timeEnd('getCustomCountByContentTypeAndContentId' + rng)

   return count
}

const getClogCountById = (id, redisClient) => getCustomCountByContentTypeAndContentId('clogs', id, redisClient)
const getEpisodeCountById = (id, redisClient) => getCustomCountByContentTypeAndContentId('episodes', id, redisClient)

/**
 * 
 * @param {string} datasetId dataset ID for google bigquery
 * @param {string} tableId table ID for google bigquery
 * @param {*} req 
 * @param {*} res 
 */
const insertQuery = (req, res) => {
   console.log('+1 views for ', req.body.rows.contentId)
   const { convertRouteNameToCollection } = require('./routeCollection.helper')
   //copy from template
   const bodyObj = Object.assign({}, bigquery_config.BIGQUERY_INSERT_BODY_TEMPLATE)
   //modify params
   bodyObj.params = Object.assign(bodyObj.params, {
      rows: req.body.rows
   })
   //fix row route name, eg "/book-detail" to "clogs"
   bodyObj.params.rows = convertRouteNameToCollection(bodyObj.params.rows)

   //map raw route to collection
   fetch(bigquery_api_endpoint, {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Authorization": bigquery_authorization },
      body: _dynamicJsonFactory(bodyObj, {
         datasetId: bigquery_logevent_datasetid,
         tableId: bigquery_navigation_tableid,
      })
   }).then(fetchRes => {
      res.sendStatus(fetchRes.status)
   })
}


/**
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const bigqueryInit = (req, res, next) => {
   if (is_bigquery_enable) {
      req.bigQueryCollection = require('./queryCollection');
      req.bigQueryCollection.redisClient = require('redis').createClient({ host: redis_url, db: 2 })
   }
   next()
}

module.exports = { getCustomCountByContentTypeAndContentId, getClogCountById, getEpisodeCountById, insertQuery, bigqueryInit }
