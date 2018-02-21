const { errorBy } = require('./errors')
const { AUTH_PASSPORT_FAILED, AUTH_FB_EMAIL_NOT_VERIFIED, AUTH_MISSING_EMAIL, AUTH_EMAIL_ALREADY_EXISTS } = require('./errors/codes')

const _willCreateUserWithPayload = async (provider, payload, req) => {
  const { profile, token } = payload[provider]

  // User sign up with facebook but not provided email
  const { email } = payload
  if (!email || email.trim() === '') {
    // User already verified email
    const verifiedFacebookCustomEmailUser = await NAP.User.findOne({
      // Matched facebook id
      [`${provider}.id`]: payload[provider].id,
      // Can't get user email
      email: { $exists: true },
      // Not verify yet
      emailVerified: true
    })

    if (verifiedFacebookCustomEmailUser) return verifiedFacebookCustomEmailUser

    // User has no email or email is invalid, will try check for unverified email
    const unverifiedFacebookCustomEmailUser = await NAP.User.findOne({
      // Matched facebook id
      [`${provider}.id`]: payload[provider].id,
      // Has pending email
      unverifiedEmail: { $exists: true },
      // Can't get user email
      email: undefined,
      // Never been verify email before
      emailVerifiedAt: undefined,
      // Not verify yet
      emailVerified: { $ne: true }
    })

    // Found unverified email, will throw error
    if (unverifiedFacebookCustomEmailUser) throw errorBy('AUTH_FB_EMAIL_NOT_VERIFIED', unverifiedFacebookCustomEmailUser.unverifiedEmail)

    // Not found unverified email, will throw error
    throw AUTH_MISSING_EMAIL
  }

  // Guard has email but invalid
  const { willValidateEmail } = require('./validator')
  const isValidEmail = await willValidateEmail(payload.email)
  if (!isValidEmail) throw require('./errors/codes').AUTH_INVALID_EMAIL

  // Has email from facebook, will mark email as verified
  payload.emailVerified = true
  payload.emailVerifiedAt = new Date().toISOString()
  payload.status = 'VERIFIED_BY_FB_EMAIL'

  // Already linked or any Facebook user, will save token let user login
  const user = await NAP.User.findOneAndUpdate(
    { [`${provider}.id`]: profile.id },
    {
      [provider]: {
        id: profile.id,
        token,
        profile
      }
    },
    { new: true, upsert: false }
  )
  if (user) return user

  // Guard used email -> auto link
  const emailUser = await NAP.User.findOne({ email, emailVerified: true })
  if (emailUser) {
    const { willGetFacebookProfile } = require('./authen-facebook')
    const { willLinkWithFacebook } = require('./authen-link')

    const profile = await willGetFacebookProfile(req, token)
    return willLinkWithFacebook(emailUser, profile, token)
  }

  // Already register but not verify, will update
  const unverifiedUser = await NAP.User.findOneAndUpdate({ email, emailVerified: { $ne: true } }, payload, { new: true, upsert: false })
  if (unverifiedUser) return unverifiedUser

  // Create new user
  const { willCreateUser } = require('./authen-sessions')
  const newUser = await willCreateUser(payload)

  // Emit
  NAP.emitter.emit(require('./events').USER_VERIFIED_BY_FACEBOOK, { req, user: newUser })

  return newUser
}

const _willCreateUnverifiedUserWithPayload = async (provider, payload) => {
  const { unverifiedEmail } = payload

  // Require email
  if (!unverifiedEmail || unverifiedEmail === '') throw require('./errors/codes').AUTH_MISSING_EMAIL

  // Email already use and verified
  const emailUser = await NAP.User.findOne({ email: unverifiedEmail, emailVerified: true })
  if (emailUser) throw require('./errors/codes').AUTH_EMAIL_ALREADY_IN_USE

  const { profile } = payload[provider]

  // Facebook already use
  const user = await NAP.User.findOne({ [`${provider}.id`]: profile.id })
  if (user) {
    if (user.email === unverifiedEmail) {
      // Email already fullfil
      throw require('./errors/codes').AUTH_EMAIL_ALREADY_IN_USE
    } else {
      // Not verify yet, will return existing user and continue
      return user
    }
  }

  // Create new unverified user
  const { willCreateUser } = require('./authen-sessions')
  return willCreateUser(payload)
}

const willValidatePayloadByStrategy = async (req, strategy, payload) => {
  switch (strategy) {
    case 'local':
      if (!payload) throw AUTH_PASSPORT_FAILED
      return payload
    case 'facebook-token':
      // SignUp with facebook and email
      if (req.body.custom_email) {
        const custom_email = req.body.custom_email.toLowerCase().trim()

        // Guard has email but invalid
        const { willValidateEmail } = require('./validator')
        const isValidEmail = await willValidateEmail(custom_email)
        if (!isValidEmail) throw require('./errors/codes').AUTH_INVALID_EMAIL

        // Will use custom email
        payload.unverifiedEmail = custom_email

        // Will unverified email as key
        const FB_ID = payload.facebook.profile.id
        payload.email = payload.unverifiedEmail.split('@').join(`+fb.${FB_ID}@`)

        // Signup with facebook
        const user = await _willCreateUnverifiedUserWithPayload('facebook', payload)

        // User has been authen with facebook and provide email
        NAP.emitter.emit(require('./events').USER_SIGNUP_WITH_FACEBOOK_AND_EMAIL, { req, user })

        return user
      }

      // Login with facebook
      const user = await _willCreateUserWithPayload('facebook', payload, req)

      // User has been authen with facebook and provide email
      NAP.emitter.emit(require('./events').USER_SIGNUP_WITH_FACEBOOK, { req, user })

      return user
    default:
      throw AUTH_PASSPORT_FAILED
  }
}

const willAuthenWithPassport = (strategy, req) =>
  new Promise((resolve, reject) => {
    const passport = require('passport')
    // @ts-ignore
    passport.authenticate(strategy, (err, payload) => {
      // Error?
      if (err) return reject(err)

      willValidatePayloadByStrategy(req, strategy, payload).then(resolve).catch(reject)
    })(req)
  })

const willGetProfileWithPassport = (provider, strategy, req) =>
  new Promise((resolve, reject) => {
    const passport = require('passport')

    // Guard : Not support local
    if (strategy === 'local') {
      throw Error('Not support local strategy')
    }

    // @ts-ignore
    passport.authenticate(strategy, (err, payload) => {
      // Error?
      if (err) {
        try {
          return reject(new Error(JSON.parse(err.oauthError.data).error.message))
        } catch (err) {
          // Ignore wrong error format
        }

        return reject(err)
      }

      // Payload?
      const { profile } = payload[provider]
      return profile ? resolve(profile) : reject(require('./errors/codes').AUTH_PASSPORT_FAILED)
    })(req)
  })

const __private = { _willCreateUserWithPayload }
module.exports = { willAuthenWithPassport, willGetProfileWithPassport, __private }
