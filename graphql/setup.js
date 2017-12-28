const { addToGQC, contextBuilder } = require('./content/schema')
const { green } = require('chalk')

global.NAP.expose.config({
  schemaBuilder: ({ GQC, loader, models }) => {
    console.log(green('init schema from ./content/schema'))
    addToGQC(GQC)
    return GQC.buildSchema()
  },
  contextBuilder
})
