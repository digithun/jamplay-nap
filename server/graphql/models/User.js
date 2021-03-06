const mongoose = require('mongoose')
const { composeWithMongoose } = require('graphql-compose-mongoose')

const { buildMongooseSchema } = require('./helpers')

module.exports = extendedSchema => {
  const ProviderSchema = new mongoose.Schema(
    {
      id: String,
      token: String,
      profile: {}
    },
    {
      _id: false // disable `_id` field for `Provider` schema
    }
  )
  const UserSchemaObject = {
    name: String,
    phoneNumber: String,
    last_name: String,
    first_name: String,
    profilePicture: {},
    email: { type: String, unique: true, lowercase: true, trim: true },
    unverifiedEmail: { type: String },
    usedEmails: [{ type: String }],
    token: String,
    status: String,
    hashed_password: String,
    emailVerified: { type: 'boolean', default: false },
    gender: String,
    birthday: Date,
    emailVerifiedAt: { type: Date },
    phones: String,
    facebook: { type: ProviderSchema },
    twitter: { type: ProviderSchema },
    google: { type: ProviderSchema },
    github: { type: ProviderSchema },
    role: { type: String, default: 'user' }
  }

  const UserSchema = new mongoose.Schema(Object.assign(buildMongooseSchema(UserSchemaObject, extendedSchema)), {
    timestamps: true
  })

  const role = require('mongoose-role')
  UserSchema.plugin(role, {
    roles: ['public', 'user', 'admin', 'writer', 'super_reader'],
    accessLevels: {
      public: ['public', 'user', 'admin'],
      anon: ['public'],
      user: ['user', 'admin'],
      admin: ['admin']
    }
  })

  const User = mongoose.model('User', UserSchema)
  const UserTC = composeWithMongoose(User)

  UserTC.addFields({
    isLinkedWithFacebook: {
      type: 'Boolean!',
      resolve: source => !!source.facebook,
      projection: { facebook: true }
    },
    hasPassword: {
      type: 'Boolean!',
      resolve: source => !!source.hashed_password,
      projection: { hashed_password: true }
    }
  })

  const Provider = mongoose.model('Provider', ProviderSchema)

  // Not allow to read hashed_password, token
  UserTC.removeField('hashed_password')
  UserTC.removeField('token')

  return { User, UserTC, Provider, model: User, typeComposer: UserTC }
}
