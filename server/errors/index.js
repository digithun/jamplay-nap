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

const guard = (arg, msg) => {
  const is = require('is_js')
  if (!arg) {
    throw new Error('Required : Object e.g. { foo }')
  }
  if (is.not.existy(Object.values(arg)[0])) {
    throw new GenericError(
      'missing-params',
      msg || `Required : ${Object.keys(arg)[0]}`
    )
  }

  return false
}

module.exports = {
  GenericError,
  onError,
  guard
}
