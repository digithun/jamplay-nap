require('isomorphic-fetch')
const DEBUG = true
const {
   is_bigquery_enabled,
   bigquery_api_endpoint,
   bigquery_authorization,
   bigquery_config,
   bigquery_projectid,
   bigquery_logevent_datasetid,
   bigquery_navigation_tableid,
   redis_url
} = require('../server/config')
const hash = require('sha1')
/**
 *
 * @param {string} json json to modify
 * @param {object} objectKeyValue replace each key into json ${key} as value
 */
const _dynamicJsonFactory = (json, objectKeyValue) => {
  let jsonString = JSON.stringify(json)

  for (let key in objectKeyValue) { jsonString = jsonString.replace(new RegExp('\\${' + key + '}', 'g'), objectKeyValue[key]) }
  jsonString = jsonString.replace(new RegExp('\\${projectId}', 'g'), bigquery_projectid)

  return jsonString
}

const _getQueryResult = async (queryJsonString) => {
  if (!is_bigquery_enabled) {
      // warning
    DEBUG && console.log('env is_bigquery_enable is disabled')
    return { err: 'env is_bigquery_enable is disabled' }
  }

   // non cache
  const result = await fetch(bigquery_api_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': bigquery_authorization },
    body: queryJsonString
  }).catch((err) => { return err })

  const resultObj = await result.json().catch((err) => { return { err: err } })

  return resultObj
}

const _getQueryCache = async (queryJsonString, redisClient, defaultValue) => {
  if (!is_bigquery_enabled) {
      // warnng
    DEBUG && console.log('env is_bigquery_enable is disabled')
    return { err: 'env is_bigquery_enable is disabled' }
  }

   // cache
  if (redisClient) {
    const cache = await new Promise(resolve => {
      redisClient.get(queryJsonString, (err, reply) => {
        if (err) resolve(null)
        else resolve(reply)
      })
    })
    if (cache) return JSON.parse(cache)
    else return defaultValue
  }
  return defaultValue
}

const _getQueryManagedCache = async (queryJsonString, redisClient, defaultValue) => {
  const cacheKey = hash(queryJsonString)

  if (!is_bigquery_enabled) {
      // warnng
    DEBUG && console.log('env is_bigquery_enable is disabled')
    return { err: 'env is_bigquery_enable is disabled' }
  }

  return new Promise(async (resolve) => {
    const cache = await _getQueryCache(cacheKey, redisClient, defaultValue)
    const cacheTime = await _getQueryCache(cacheKey + '_timeStamp', redisClient, 0)
    const isOld = (cacheTime + bigquery_config.BIGQUERY_CACHE_TTL_SEC * 1000) < new Date().getTime()

    DEBUG && console.log('isOld', isOld, cacheTime, new Date().getTime())
    DEBUG && console.log('defaultValue', defaultValue, cache)
    if (defaultValue == cache || isOld) {
         // cache is initial value or non-existance. return cache for now, then try and fetch the real thing for caching later
      DEBUG && console.log('resolve cache', cache)
      resolve(cache)

         // mark is updating
      const isUpdating = await _getQueryCache(cacheKey + '_isUpdating', redisClient, false)
         // updating, so please wait for previous fetch
      if (isUpdating) {
        DEBUG && console.log('already prefetching cache previously')
        return
      }

      DEBUG && console.log('fetching cache ...')
         // not updating, so do some fetching and mark as updating
      redisClient.set(cacheKey + '_isUpdating', true)
         // get real value
      let resultObj = await _getQueryResult(queryJsonString)
         // save cache
      redisClient.set(cacheKey, JSON.stringify(resultObj), () => {
            // update is done, so set updating to false
        redisClient.set(cacheKey + '_timeStamp', new Date().getTime())
        redisClient.set(cacheKey + '_isUpdating', false)
        DEBUG && console.log('cache has been fetched')
      })
    } else {
         // got something valid from cache
      DEBUG && console.log('your old cache is valid')
      resolve(cache)
    }
  })
}

const getCustomCountByContentTypeAndContentId = async (contentType, contentId, redisClient) => {
  DEBUG && console.log('getCustomCountByContentTypeAndContentId ', contentType, contentId)
  DEBUG && console.time('getCustomCountByContentTypeAndContentId ' + contentId)
   // if disabled return 0
  if (!is_bigquery_enabled) {
    DEBUG && console.timeEnd('getCustomCountByContentTypeAndContentId ' + contentId)
    DEBUG && console.log('env is_bigquery_enable is disabled')
    return 0
  }

  const jsonString = _dynamicJsonFactory(bigquery_config.BIGQUERY_QUERY_COUNT_CONTENT, {
    datasetId: bigquery_logevent_datasetid,
    tableId: bigquery_navigation_tableid,
    contentId,
    contentType
  })

   // run get count result
  const obj = await _getQueryManagedCache(jsonString, redisClient, [{ count: 0 }])
   // got error return -2
  if (obj.hasOwnProperty('err')) return 0

  const count = obj.length == 0 ? 0 : obj[0].count
  DEBUG && console.timeEnd('getCustomCountByContentTypeAndContentId ' + contentId)

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
  console.log('+1 views for ', req.body.rows)
  const { convertRouteNameToCollection } = require('./routeCollection.helper')
   // copy from template
  const bodyObj = Object.assign({}, bigquery_config.BIGQUERY_INSERT_BODY_TEMPLATE)
   // modify params
  bodyObj.params = Object.assign(bodyObj.params, {
    rows: req.body.rows
  })
   // fix row route name, eg "/book-detail" to "clogs"
  bodyObj.params.rows = convertRouteNameToCollection(bodyObj.params.rows)

   // map raw route to collection
  fetch(bigquery_api_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': bigquery_authorization },
    body: _dynamicJsonFactory(bodyObj, {
      datasetId: bigquery_logevent_datasetid,
      tableId: bigquery_navigation_tableid
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
  req.bigQueryCollection = require('./queryCollection')
  req.bigQueryCollection.redisClient = require('redis').createClient({ host: redis_url.replace('redis://', ''), db: 2 })

  next()
}
module.exports = { getCustomCountByContentTypeAndContentId, getClogCountById, getEpisodeCountById, insertQuery, bigqueryInit }
