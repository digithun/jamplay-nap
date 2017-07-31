class GenericError extends Error {
  constructor (code, message) {
    super(message)
    this.code = code
  }
}

const _COMMON_ERRORS = {
  403: 'Forbidden',
  501: 'Server error'
}

const DEFAULT_CODE = 'node-error'

const _push = (req, { code, message }) => req.nap.errors.push({ code, message })

const onError = req => (...args) => {
  // Guard
  if (!args[0]) {
    throw new Error('Error is undefined')
  }

  // GenericError
  if (args[0] instanceof GenericError) {
    _push(req, args[0])
    return null
  }

  // Error('foo')
  if (args[0] instanceof Error) {
    _push(req, new GenericError(DEFAULT_CODE, args[0].message))
    return null
  }

  // 'foo'
  if (typeof args[0] === 'string') {
    _push(req, new GenericError(DEFAULT_CODE, args[0]))
    return null
  }

  // 403, 'foo'
  if (typeof args[0] === 'number' && typeof args[1] === 'string') {
    _push(req, new GenericError(args[0], args[1]))
    return null
  }

  // 403
  if (typeof args[0] === 'number' && args.length === 1) {
    _push(req, new GenericError(args[0], _COMMON_ERRORS[args[0]] || ''))
    return null
  }

  return null
}

const errorBy = (code, msg) => {
  const _error = require('./commons')[code]
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
