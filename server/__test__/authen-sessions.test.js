/* eslint-env jest */
const _SESSIONS_TTL = 1000 * 60
process.env.SESSIONS_TTL = _SESSIONS_TTL

describe('authen-sessions', async () => {
  it('should provide sessionToken that never expire', async () => {
    const { validateSession } = require('../authen-sessions')

    // Never expire as -1
    expect(await validateSession({ expireAt: -1 })).toBe(true)
  })

  it('should provide sessionToken that can be expire', async () => {
    const { validateSession } = require('../authen-sessions')

    // Expired after 1 ms pass.
    expect(
      validateSession({
        expireAt: new Date(+new Date() - _SESSIONS_TTL - 1).toISOString()
      })
    ).rejects.toMatchObject(require('../errors/codes').AUTH_USER_TOKEN_EXPIRED)
  })
})
