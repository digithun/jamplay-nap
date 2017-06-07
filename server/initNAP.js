const Nap = require('./nap')

const init = (req, res, next) => {
  // Inject nap to req
  req.nap = new Nap()

  // Good to go
  next()
}

module.exports = init
