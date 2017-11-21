const { GraphQLNonNull } = require('graphql')
const AuthenResolver = require('../resolvers/AuthenResolver')
const GenderType = require('../types/Gender')
const { InputTypeComposer } = require('graphql-compose')

module.exports = models => {
  models.AuthenTC.addRelation('user', () => ({
    resolver: models.UserTC.getResolver('findById'),
    args: {
      _id: source => `${source.userId || source._id}`,
      filter: source => ({ userId: source.userId })
    },
    projection: { userId: 1 },
    catchErrors: false
  }))

  models.AuthenTC.addRelation('installation', () => ({
    resolver: models.InstallationTC.getResolver('findById'),
    args: {
      _id: source => `${source.installationId || source._id}`,
      filter: source => ({ installationId: source.installationId })
    },
    projection: { installationId: 1 },
    catchErrors: false
  }))

  models.AuthenTC.addResolver({
    name: 'loginWithFacebook',
    kind: 'mutation',
    args: {
      deviceInfo: 'String',
      locale: 'String',
      country: 'String',
      timezone: 'String',
      deviceName: 'String',
      deviceToken: 'String',
      accessToken: 'String'
    },
    type: models.AuthenTC,
    resolve: AuthenResolver.loginWithFacebook
  })

  models.AuthenTC.addFields({
    isFirst: {
      type: 'Boolean!',
      resolve: (source, args) => {
        return models.Authen.findOne({ userId: source.userId })
          .sort({ loggedInAt: 1 })
          .select('_id')
          .then(doc => doc && doc._id.toString() === source._id.toString())
      }
    }
  })

  models.AuthenTC.addResolver({
    name: 'signup',
    kind: 'mutation',
    args: {
      record: {
        type: InputTypeComposer.create({
          name: 'SignupUserType',
          fields: {
            email: { type: 'String!' },
            password: { type: 'String!' },
            name: { type: 'String!' },
            gender: { type: new GraphQLNonNull(GenderType) },
            first_name: { type: 'String!' },
            last_name: { type: 'String!' },
            birthday: { type: 'Date!' }
          }
        })
      }
    },
    type: models.UserTC,
    resolve: AuthenResolver.signup
  })

  models.AuthenTC.addResolver({
    name: 'signUpWithEmailAndPassword',
    kind: 'mutation',
    args: {
      email: 'String',
      password: 'String'
    },
    type: models.UserTC,
    resolve: AuthenResolver.signUpWithEmailAndPassword
  })

  models.AuthenTC.addResolver({
    name: 'login',
    kind: 'mutation',
    args: {
      // Devices
      deviceInfo: 'String',
      locale: 'String',
      country: 'String',
      timezone: 'String',
      deviceName: 'String',
      deviceToken: 'String',

      // Email, Password
      email: 'String',
      password: 'String'
    },
    type: models.AuthenTC,
    resolve: AuthenResolver.login
  })

  models.AuthenTC.addResolver({
    name: 'logout',
    kind: 'mutation',
    type: models.AuthenTC,
    resolve: AuthenResolver.logout
  })

  models.AuthenTC.addResolver({
    name: 'authen',
    kind: 'query',
    type: models.AuthenTC,
    resolve: AuthenResolver.authen
  })
}
