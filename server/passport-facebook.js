const init = (app, passport) => {
  // Guard
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return // Ignore error
  }

  const FacebookTokenStrategy = require('passport-facebook-token')
  const { guard } = require('./errors')
  const is = require('is_js')

  passport.use(
    // @ts-ignore
    new FacebookTokenStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        profileFields: ['id', 'displayName', 'name', 'emails', 'birthday', 'gender']
      },
      (accessToken, refreshToken, profile, done) => {
        const json = profile._json
        // No use
        delete profile._raw
        delete profile._json

        // Guard email
        const email = profile.emails[0].value
        guard({ email })
        if (is.not.email(email)) {
          throw require('./errors/codes').AUTH_INVALID_EMAIL
        }

        const gender = profile.gender === 'male' ? 'M' : profile.gender === 'female' ? 'F' : null

        // Upsert data
        const payload = {
          email,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          birthday: json.birthday ? new Date(json.birthday) : null,
          gender,
          name: profile.displayName,
          facebook: new NAP.Provider({
            id: profile.id,
            token: accessToken,
            profile
          })
        }

        done(null, payload)
      }
    )
  )
}

module.exports = init
