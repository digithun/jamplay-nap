/* eslint-env jest */

describe('errors', () => {
  it('should return error', () => {
    const { GenericError } = require('../errors')
    const customError = {
      code: 500,
      message: 'Foo error!'
    }
    const err = new GenericError(customError.code, customError.message)

    expect(err).toMatchObject(customError)
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
    const { onError, GenericError } = require('../errors')
    const req = { nap: { errors: [] } }
    onError(req)(new GenericError('foo', 'bar'))

    expect(req.nap.errors[0]).toMatchSnapshot()
  })

  it('should add error as new generic error to request', () => {
    const { onError } = require('../errors')
    const req = { nap: { errors: [] } }
    onError(req)(new Error('foo'))

    expect(req.nap.errors[0]).toMatchSnapshot()
  })

  it('should add string as new generic error to request', () => {
    const { onError } = require('../errors')
    const req = { nap: { errors: [] } }
    onError(req)('foo')

    expect(req.nap.errors[0]).toMatchSnapshot()
  })

  it('should add code, string as new generic error to request', () => {
    const { onError } = require('../errors')
    const req = { nap: { errors: [] } }
    onError(req)(403, 'foo')

    expect(req.nap.errors[0]).toMatchSnapshot()
  })

  it('should add code as new generic error to request', () => {
    const { onError } = require('../errors')
    const req = { nap: { errors: [] } }
    onError(req)(3)

    expect(req.nap.errors[0]).toMatchSnapshot()
  })

  it('should add code with common error as new generic error to request', () => {
    const { onError } = require('../errors')
    const req = { nap: { errors: [] } }
    onError(req)(403)

    expect(req.nap.errors[0]).toMatchSnapshot()
  })
})
