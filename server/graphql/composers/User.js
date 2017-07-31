const UserResolver = require('../resolvers/UserResolver')

module.exports = models => {
  models.UserTC.addResolver({
    name: 'user',
    kind: 'query',
    type: models.UserTC,
    resolve: UserResolver.user
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
    name: 'changeEmail',
    type: models.UserTC,
    args: {
      email: 'String!'
    },
    resolve: UserResolver.changeEmail
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
    name: 'resetPassword',
    kind: 'mutation',
    args: {
      email: 'String!',
      token: 'String!'
    },
    type: models.UserTC,
    resolve: UserResolver.resetPassword
  })
}
