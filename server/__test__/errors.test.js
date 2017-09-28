/* eslint-env jest */

const _expectError = (req, err) => {
  const { onError } = require('../errors')
  expect(() => {
    onError(req)(err)
  }).toThrow(err)
  expect(req.nap.errors[0]).toMatchSnapshot()
}

describe('errors', () => {
  let req
  beforeEach(() => {
    req = { nap: { errors: [] } }
  })

  it('should return error', () => {
    const { GenericError } = require('../errors')
    const customError = {
      code: 500,
      message: 'Foo error!'
    }
    const err = new GenericError(customError.code, customError.message)

    expect(err.code).toBe(customError.code)
    expect(err.message).toBe(customError.message)
  })

  it('should return AUTH_INVALID_USER_TOKEN', () => {
    const { AUTH_INVALID_USER_TOKEN } = require('../errors/codes')
    expect(AUTH_INVALID_USER_TOKEN).toMatchSnapshot()
  })

  it('should guard null and throw error', () => {
    const { guard } = require('../errors')
    expect(() => guard()).toThrow('An invalid argument was provided. Required : guard({ foo })')
    expect(() => guard({ foo: null })).toThrow('Required : foo')
    expect(() => guard({ foo: undefined })).toThrow('Required : foo')
  })

  it('should add new generic error to request', () => {
    const { GenericError } = require('../errors')

    const err = new GenericError('foo', 'bar')
    _expectError(req, err)
  })

  it('should add error as new generic error to request', () => {
    const err = new Error('foo')
    _expectError(req, err)
  })

  it('should add string as new generic error to request', () => {
    _expectError(req, 'foo')
  })

  it('should add code, string as new generic error to request', () => {
    const { onError, GenericError } = require('../errors')

    const err = new GenericError(403, 'foo')
    expect(() => {
      onError(req)(403, 'foo')
    }).toThrow(err)
    expect(req.nap.errors[0]).toMatchSnapshot()
  })

  it('should add code as new generic error to request', () => {
    const { onError, GenericError } = require('../errors')
    const err = new GenericError(403)
    expect(() => {
      onError(req)(403)
    }).toThrow(err)
    expect(req.nap.errors[0]).toMatchSnapshot()
  })

  it('should return error by AUTH_INVALID_USER_TOKEN with foo reason', () => {
    const { errorBy } = require('../errors')
    expect(errorBy('AUTH_INVALID_USER_TOKEN', 'foo')).toMatchSnapshot()
  })
})
