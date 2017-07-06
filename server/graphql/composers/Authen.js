const { GraphQLInputObjectType, GraphQLString } = require('graphql')
const AuthenResolver = require('../resolvers/AuthenResolver')
const { GenderGraphQLType } = require('../../../graphql/content/types')

module.exports = (models) => {
  models.AuthenTC.addRelation(
    'user',
    () => ({
      resolver: models.UserTC.getResolver('findById'),
      args: {
        _id: (source) => `${source.userId}`,
        filter: (source) => ({ userId: source.userId })
      },
      projection: { userId: 1 },
      catchErrors: false
    })
  )

  models.AuthenTC.addRelation(
    'installation',
    () => ({
      resolver: models.InstallationTC.getResolver('findById'),
      args: {
        _id: (source) => `${source.installationId}`,
        filter: (source) => ({ installationId: source.installationId })
      },
      projection: { installationId: 1 },
      catchErrors: false
    })
  )

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

  models.AuthenTC.addResolver({
    name: 'signup',
    kind: 'mutation',
    args: {
      email: { type: GraphQLString, required: true },
      confirmPassword: { type: GraphQLString, required: true },
      password: { type: GraphQLString, required: true },
      name: { type: GraphQLString, required: true },
      gender: { type: GenderGraphQLType, required: true },
      first_name: { type: GraphQLString, required: true },
      last_name: { type: GraphQLString, required: true },
      dateOfBirth: { type: GraphQLString, required: true }
    },
    type: models.AuthenTC,
    resolve: AuthenResolver.signup
  })

  models.AuthenTC.addResolver({
    name: 'forget',
    kind: 'mutation',
    args: {
      email: 'String'
    },
    type: models.AuthenTC,
    resolve: AuthenResolver.forget
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
