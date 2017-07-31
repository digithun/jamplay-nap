/* eslint-env jest */
describe('authen-link', () => {
  it('should throw `Required : token` error if no accessToken has been provide', async () => {
    const { willLinkWithFacebook } = require('../authen-link')
    await willLinkWithFacebook({}, {}).catch(err => {
      expect(() => {
        throw err
      }).toThrow('An invalid argument was provided. Required : token')
    })
  })

  it('should throw AUTH_INVALID_EMAIL error if invalid email has been provide', async () => {
    const { willLinkWithFacebook } = require('../authen-link')
    await willLinkWithFacebook({}, {}, 'VALID_TOKEN').catch(err => {
      expect(() => {
        throw err
      }).toThrow(require('../../server/errors/codes').AUTH_INVALID_EMAIL)
    })
  })

  it('should throw AUTH_EMAIL_NOT_VERIFIED error if emailVerified is false', async () => {
    const { willLinkWithFacebook } = require('../authen-link')
    await willLinkWithFacebook({ email: 'foo@bar.com', emailVerified: false }, {}, 'VALID_TOKEN').catch(err => {
      expect(() => {
        throw err
      }).toThrow(require('../../server/errors/codes').AUTH_EMAIL_NOT_VERIFIED)
    })
  })

  it('should throw AUTH_PROVIDER_ALREADY_LINKED error if facebook id already link to current user.', async () => {
    // stub
    global.NAP = {}
    NAP.User = {
      findOne: jest.fn().mockImplementationOnce(() => ({
        _id: '592c0bb4484d740e0e73798b'
      }))
    }

    const { willLinkWithFacebook } = require('../authen-link')
    await willLinkWithFacebook(
      {
        email: 'foo@bar.com',
        emailVerified: true,
        facebook: {
          id: 123456
        }
      },
      {},
      'VALID_TOKEN'
    ).catch(err => {
      expect(() => {
        throw err
      }).toThrow(require('../../server/errors/codes').AUTH_PROVIDER_ALREADY_LINKED)
    })
  })

  it('should throw AUTH_CREDENTIAL_ALREADY_IN_USE error if facebook id already link to other user.', async () => {
    // stub
    global.NAP = {}
    NAP.User = {
      findOne: jest.fn().mockImplementationOnce(() => ({
        _id: '592c0bb4484d740e0e73798b'
      }))
    }

    const { willLinkWithFacebook } = require('../authen-link')
    await willLinkWithFacebook(
      {
        email: 'foo@bar.com',
        emailVerified: true
      },
      {
        id: 123456
      },
      'VALID_TOKEN'
    ).catch(err => {
      expect(() => {
        throw err
      }).toThrow(require('../../server/errors/codes').AUTH_CREDENTIAL_ALREADY_IN_USE)
    })
  })

  it('should link to current user.', async () => {
    // stub
    global.NAP = {}
    NAP.User = {
      findOne: jest.fn().mockImplementationOnce(() => null)
    }

    NAP.Provider = class Provider {
      constructor (providerData) {
        const { id, token, profile } = providerData
        this.id = id
        this.token = token
        this.profile = profile
      }
    }

    // mock
    const userData = {
      email: 'foo@bar.com',
      emailVerified: true,
      save: () => {}
    }

    const { willLinkWithFacebook } = require('../authen-link')
    const user = await willLinkWithFacebook(
      userData,
      {
        id: 123456
      },
      'VALID_TOKEN'
    )

    delete user.save

    expect(user).toMatchSnapshot()
  })

  it('should unlink from current user.', async () => {
    // mock
    const userData = {
      _id: '592c0bb4484d740e0e73798b',
      email: 'foo@bar.com',
      facebook: {
        id: 123456,
        token: 'VALID_TOKEN',
        profile: { id: 123456 }
      },
      save: () => {}
    }

    const { willUnlinkFromFacebook } = require('../authen-link')
    expect(userData['facebook']).toBeDefined()

    const user = await willUnlinkFromFacebook(userData)
    delete user.save

    expect(user).toMatchSnapshot()
    expect(user['facebook']).toBeUndefined()
  })
})
