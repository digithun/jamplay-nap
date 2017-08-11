const { addResolverMiddleware, compose } = require('graphql-compose-recompose')
const config = require('../config')

const defaultBuildSchema = ({ GQC }) => {
  return GQC.buildSchema()
}

let buildGraphqlSchema = null

module.exports = {}
module.exports.getFile = (fileInput, context) => {
  if (!fileInput || !fileInput.mapKey) {
    return null
  }
  return context.files.find(file => {
    return file.originalname === fileInput.mapKey
  })
  // return fileInput;
}
module.exports.extendModel = require('./models').extendModel
module.exports.setBuildGraphqlSchema = builder => (buildGraphqlSchema = builder)
module.exports.buildSchema = () => {
  let authenChannel
  async function loginMiddleware ({ rp }, next) {
    const authen = await next()
    authenChannel.publish('login', {
      Authen_Id: authen._id.toString(),
      User_Id: authen.userId.toString(),
      Installation_Id: authen.installationId.toString()
    })
  }

  async function logoutMiddleware ({ rp }, next) {
    const authen = await next()
    authenChannel.publish('logout', {
      Authen_Id: authen._id.toString(),
      User_Id: authen.userId.toString(),
      Installation_Id: authen.installationId.toString()
    })
  }

  const { ComposeStorage } = require('graphql-compose')
  const GQC = new ComposeStorage()
  const models = require('./models')()
  require('./composers')(models)

  const userAccess = resolvers => {
    Object.keys(resolvers).forEach(k => {
      resolvers[k] = resolvers[k].wrapResolve(next => rp => {
        if (!rp.context.nap.session) {
          return null
        }
        return next(rp)
      })
    })
    return resolvers
  }

  if (config.mubsub_enabled) {
    authenChannel = NAP.mubsub.client.channel('authen')

    models.AuthenTC = compose(addResolverMiddleware('login', loginMiddleware), addResolverMiddleware('loginWithFacebook', loginMiddleware), addResolverMiddleware('logout', logoutMiddleware))(models.AuthenTC)
  }

  GQC.rootQuery().addFields(
    Object.assign(
      userAccess({
        user: models.UserTC.getResolver('user')
      }),
      {
        authen: models.AuthenTC.getResolver('authen'),
        errors: models.ErrorTC.getResolver('error')
      }
    )
  )

  GQC.rootMutation().addFields({
    signup: models.AuthenTC.getResolver('signup'),
    login: models.AuthenTC.getResolver('login'),
    logout: models.AuthenTC.getResolver('logout'),
    loginWithFacebook: models.AuthenTC.getResolver('loginWithFacebook'),
    signUpWithEmailAndPassword: models.AuthenTC.getResolver('signUpWithEmailAndPassword'),
    forget: models.UserTC.getResolver('forget'),
    updatePassword: models.UserTC.getResolver('updatePassword'),
    updatePasswordByToken: models.UserTC.getResolver('updatePasswordByToken'),
    unlinkFromFacebook: models.UserTC.getResolver('unlinkFromFacebook'),
    linkWithFacebook: models.UserTC.getResolver('linkWithFacebook'),
    updateEmail: models.UserTC.getResolver('updateEmail'),
    update_GCMSenderId: models.InstallationTC.getResolver('update_GCMSenderId'),
    update_deviceToken: models.InstallationTC.getResolver('update_deviceToken'),
    errors: models.ErrorTC.getResolver('error')
  })

  if (buildGraphqlSchema) {
    return buildGraphqlSchema({ GQC, models })
  }
  return defaultBuildSchema({ GQC })
}
