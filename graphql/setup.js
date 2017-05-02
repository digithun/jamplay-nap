const { addToGQC } = require('./clogii/schema')

global.NAP.expose.setBuildGraphqlSchema(({ GQC }) => {
  addToGQC(GQC);
  return GQC.buildSchema();
});
