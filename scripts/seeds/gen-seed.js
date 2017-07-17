const fs = require('fs')
const path = require('path')

const { casual } = require('./helpers')

/* eslint import/no-dynamic-require: off */

const prog = require('caporal')
const sequential = require('promise-sequential')

const defaultTypes = ['tag', 'user', 'book', 'episode', 'feed', 'bookmark', 'recommend', 'trending', 'book-follower', 'user-follower'].join(',')

prog
  .version('1.0.0')
  // .argument('[types...]', 'generate seed on types', defaultTypes)
  .option('--types <types>', prog.LIST)
  .action((args, options) => {
    const types = (options.types || defaultTypes).split(',')
    const dataDir = path.resolve(__dirname, 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir)
    }
    return sequential(types.map(type => async () => {
      if (fs.existsSync(path.resolve(__dirname, 'seed-generator', `${type}.js`))) {
        const generate = require(`./seed-generator/${type}`)
        casual.seed(1)
        console.log(`generating ${type}`)
        await generate()
      } else {
        throw new Error(`generator ${type} not exists`)
      }
    }))
    .then(() => console.log('complete'))
    .catch(error => console.error(error))
  })

prog.parse(process.argv)
