const _get = what => {
  // Guard
  if (!what) return ``

  const key = Object.keys(what)[0]
  const value = what[key]
  if (typeof value === 'string') return `${key}: "${value}"`
  if (typeof value === 'number') return `${key}: ${value}`
  return ``
}

let apolloFetch
const init = uri => {
  if (!uri) return
  apolloFetch = require('apollo-fetch').createApolloFetch({ uri })
}

const trace = (referer, tracing) => {
  if (!apolloFetch) return

  const { duration, startTime, endTime, execution: executionJSON } = tracing
  const execution = JSON.stringify(executionJSON).replace(/"/g, '\\"')

  apolloFetch({
    query: `
    mutation {
      createTracing(
        ${_get({ referer })}
        ${_get({ duration })}
        ${_get({ startTime })}
        ${_get({ endTime })}
        ${_get({ execution })}
      ){
        id
      }
    }
  `
  })
    .then(results => {
      // console.log(results)
    })
    .catch(err => console.error(err))
}

module.exports = { init, trace }
