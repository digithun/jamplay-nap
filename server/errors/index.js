class GenericError extends Error {
  constructor (code, message) {
    super(message)
    this.code = code
  }
}

const DEFAULT_CODE = 'node-error'

const _push = (req, { code, message }) => {
  if (!req.nap.errors) req.nap.errors = []
  req.nap.errors.push({ code, message })
}

const onError = req => (...args) => {
  // Guard
  if (!args[0]) {
    throw new Error('Error is undefined')
  }

  // GenericError
  if (args[0] instanceof GenericError) {
    const err = args[0]
    _push(req, err)
    throw err
  }

  // Error Object
  if (args[0].code && args[0].message) {
    const err = new GenericError(args[0].code, args[0].message)
    _push(req, err)
    throw err
  }

  // Error('foo')
  if (args[0] instanceof Error) {
    const err = new GenericError(DEFAULT_CODE, args[0].message)
    _push(req, err)
    throw err
  }

  // 'foo'
  if (typeof args[0] === 'string') {
    const err = new GenericError(DEFAULT_CODE, args[0])
    _push(req, err)
    throw err
  }

  // 403, 'foo'
  if (typeof args[0] === 'number' && typeof args[1] === 'string') {
    const err = new GenericError(args[0], args[1])
    _push(req, err)
    throw err
  }

  // 403
  if (typeof args[0] === 'number' && args.length === 1) {
    const err = new GenericError(args[0])
    _push(req, err)
    throw err
  }

  return null
}

const errorBy = (code, msg) => {
  const _errorCode = require('./codes')[code]
  const _errorNAP = require('./commons')[code]
  const _error = _errorNAP || _errorCode || new GenericError('unknown-error')

  _error.message += msg
  return _error
}

const guard = (arg, err) => {
  // Wrong params
  if (!arg) {
    throw errorBy('NAP_INVALID_ARGUMENT', 'Required : guard({ foo })')
  }

  // Missing params
  const is = require('is_js')
  if (is.not.existy(Object.values(arg)[0])) {
    if (err instanceof Error) {
      throw err
    }

    throw errorBy('NAP_INVALID_ARGUMENT', err || `Required : ${Object.keys(arg)[0]}`)
  }

  return false
}

module.exports = {
  GenericError,
  onError,
  guard,
  errorBy
}
