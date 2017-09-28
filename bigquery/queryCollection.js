require('isomorphic-fetch')
const {
  bigquery_service_endpoint
} = require('../server/config')

const getCustomCountById = async (id, path) => new Promise((resolve) => {
  if (!bigquery_service_endpoint) {
    resolve(-3)
    console.warn('bigquery_service_endpoint is not set, therefore we will return you -3 for count')
    return
  }

  // map raw route to collection
  try {
    fetch(bigquery_service_endpoint + path, {
      timeout: 1500,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(async (result) => {
      const data = await result.json()
      resolve(data.count)
    }).catch(() => {
      resolve(-2)
    })
  } catch (e) {
    resolve(-1)
  }
})

const getBookCountById = (id) => getCustomCountById(id, '/getBookCountById')
const getEpisodeCountById = (id) => getCustomCountById(id, '/getEpisodeCountById')

const getQueryObjectResult = async (path, option) => new Promise((resolve) => {
  if (!bigquery_service_endpoint) {
    resolve([])
    console.warn('bigquery_service_endpoint is not set, therefore we will return you -3 for count')
    return
  }

  // map raw route to collection
  try {
    fetch(bigquery_service_endpoint + path, {
      timeout: 1500,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(option)
    }).then(async (result) => {
      const data = await result.json()
      resolve(data)
    }).catch(() => {
      resolve([])
    })
  } catch (e) {
    resolve([])
  }
})

const getBookViewCount = (option) => getQueryObjectResult('/book/viewCount', option)

/**
 * Express middleware
 * @param {string} datasetId dataset ID for google bigquery
 * @param {string} tableId table ID for google bigquery
 * @param {*} req
 * @param {*} res
 */
const insertQuery = (req, res) => fetch(bigquery_service_endpoint + '/insert', {
  method: req.method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(req.method === 'GET' ? req.query : req.body)
}).then(fetchRes => res.sendStatus(fetchRes.status)).catch(e => res.status(503).json(e))

const putBook = (body) => new Promise(resolve => fetch(bigquery_service_endpoint + '/book', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
}).then(fetchRes => resolve(fetchRes.status)))

const initMiddleWare = () => {
  console.log('try to handshake with analytic service....')
  fetch(`${bigquery_service_endpoint}/`, {
    method: 'GET'
  }).then(
    (result) => {
      if (result.status === 200) {
        console.log('handshake with analytic service done !!')
      }
    }
    ).catch(() => {
      console.warn('Cannot connect to Analytic service, analytic might not work properly')
    })

  return (req, res, next) => {
    if (!req.bigQueryCollection) { req.bigQueryCollection = { getBookCountById, getEpisodeCountById, insertQuery, putBook, getBookViewCount } }
    next()
  }
}

module.exports = { getBookCountById, getEpisodeCountById, insertQuery, putBook, getBookViewCount, initMiddleWare }
