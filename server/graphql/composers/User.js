const UserResolver = require('../resolvers/UserResolver')

module.exports = models => {
  models.UserTC.addResolver({
    name: 'user',
    kind: 'query',
    type: models.UserTC,
    resolve: async (params) => {
      const user = UserResolver.user(params)
      return user
    }
  })

  models.UserTC.addResolver({
    name: 'unlinkFromFacebook',
    type: models.UserTC,
    resolve: UserResolver.unlinkFromFacebook
  })

  models.UserTC.addResolver({
    name: 'linkWithFacebook',
    type: models.UserTC,
    args: {
      accessToken: 'String!'
    },
    resolve: UserResolver.linkWithFacebook
  })

  models.UserTC.addResolver({
    name: 'updateEmail',
    type: models.UserTC,
    args: {
      email: 'String!'
    },
    resolve: UserResolver.updateEmail
  })

  models.UserTC.addResolver({
    name: 'forget',
    kind: 'mutation',
    args: {
      email: 'String!'
    },
    type: models.UserTC,
    resolve: UserResolver.forget
  })

  models.UserTC.addResolver({
    name: 'updatePassword',
    kind: 'mutation',
    args: {
      password: 'String!',
      new_password: 'String!'
    },
    type: models.UserTC,
    resolve: UserResolver.updatePassword
  })

  models.UserTC.addResolver({
    name: 'updatePasswordByToken',
    kind: 'mutation',
    args: {
      token: 'String!',
      password: 'String!'
    },
    type: models.UserTC,
    resolve: UserResolver.updatePasswordByToken
  })
}
