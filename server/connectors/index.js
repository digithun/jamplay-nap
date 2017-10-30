module.exports = function createConnectors ({ config, req }) {
  return {
    ewallet: require('./ewallet')(config, req)
  }
}
