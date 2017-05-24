const { addToGQC } = require('./content/schema')

global.NAP.expose.setBuildGraphqlSchema(({ GQC }) => {
  addToGQC(GQC);
  return GQC.buildSchema();
});
