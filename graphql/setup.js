const { addToGQC, JamplayModels } = require('./content/schema')
const { green } = require('chalk')

global.NAP.expose.setBuildGraphqlSchema(({ GQC, loader, models }) => {
  console.log(green('init schema from ./content/schema'))
  addToGQC(GQC, {loader, models: JamplayModels})
  return GQC.buildSchema()
})
