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
  }
  catch (e) {
    resolve(-1)
  }
})

const getClogCountById = async (id) => getCustomCountById(id, '/getClogCountById')
const getEpisodeCountById = (id) => getCustomCountById(id, '/getEpisodeCountById')

/**
 * Express middleware
 * @param {string} datasetId dataset ID for google bigquery
 * @param {string} tableId table ID for google bigquery
 * @param {*} req
 * @param {*} res
 */
const insertQuery = (req, res) => {

  const body = req.method == 'GET' ? req.query : req.body
  try {
    fetch(bigquery_service_endpoint + '/insert', {
      timeout: 1500,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(fetchRes => {
      console.log(fetchRes)
      res.sendStatus(fetchRes.status)
    })
  } catch (error) {
    console.log('insertQuery err', error)
  }

}

const initMiddleWare = (req, res, next) => {
  if (!req.bigQueryCollection)
    req.bigQueryCollection = { getClogCountById, getEpisodeCountById, insertQuery }
  next()
}

module.exports = { getClogCountById, getEpisodeCountById, insertQuery, initMiddleWare }
