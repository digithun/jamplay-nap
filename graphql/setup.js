const { addToGQC, contextBuilder } = require('./content/schema')
const { green } = require('chalk')

global.NAP.expose.setBuildGraphqlSchema(({ GQC, loader, models }) => {
  console.log(green('init schema from ./content/schema'))
  addToGQC(GQC)
  return GQC.buildSchema()
})

global.NAP.expose.setBuildGraphQLContext(contextBuilder)
