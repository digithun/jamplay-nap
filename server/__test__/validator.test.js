/* eslint-env jest */
describe('validator', () => {
  describe('mock', () => {
    it('should throw error for empty email', async () => {
      const { willValidateEmail } = require('../validator')
      await willValidateEmail().catch(err => {
        expect(() => {
          throw err
        }).toThrow('Required : email')
      })
    })

    it('should throw error for invalid email', async () => {
      const { willValidateEmail } = require('../validator')
      await willValidateEmail('').catch(err => {
        expect(() => {
          throw err
        }).toThrow(require('../errors/codes').AUTH_INVALID_EMAIL)
      })
    })

    it('should be true for valid email', async () => {
      const { willValidateEmail } = require('../validator')
      expect(await willValidateEmail('foo@bar.com')).toMatchSnapshot()
    })

    it('should throw error for empty password', async () => {
      const { willValidatePassword } = require('../validator')
      await willValidatePassword().catch(err => {
        expect(() => {
          throw err
        }).toThrow('Required : password')
      })
    })

    it('should throw error for invalid password', async () => {
      const { willValidatePassword } = require('../validator')
      const { AUTH_WEAK_PASSWORD } = require('../errors/codes')
      await willValidatePassword('foo').catch(err => {
        expect(() => {
          throw err
        }).toThrow(AUTH_WEAK_PASSWORD)
      })
    })

    it('should be true for valid password', async () => {
      const { willValidatePassword } = require('../validator')
      expect(await willValidatePassword('foofoobarbar')).toMatchSnapshot()
    })

    it('should be true for valid email and password', async () => {
      const { willValidateEmailAndPassword } = require('../validator')
      expect(await willValidateEmailAndPassword('foo@bar.com', 'foofoobarbar')).toMatchSnapshot()
    })
  })
})
