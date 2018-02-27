require('./debug')
const config = require('./config')
const { version } = require('../package.json')
const Mitt = require('mitt')

const start = async () => {
  // NAP
  global.NAP = {
    emitter: new Mitt()
  }

  // Next and else
  const nextjs = await require('./initNext')(config)
  const initializer = require('./initializer')
  await initializer(config, nextjs)

  // Ready
  debug.info(`TTL     : ${config.sessions_ttl}`)
  debug.info(`NAP ${version} is ready to use (${process.env.NODE_ENV}), enjoy! [^._.^]ﾉ彡`) // eslint-disable-line
}

module.exports = {
  start
}
