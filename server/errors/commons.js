const { GenericError } = require('./index.js')

module.exports = {
  get NAP_INVALID_ARGUMENT () {
    return new GenericError(
      'nap/invalid-argument',
      'An invalid argument was provided. '
    )
  }
}
