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
        clientSecret: process.env.FACEBOOK_APP_SECRET
      },
      (accessToken, refreshToken, profile, done) => {
        // No use
        delete profile._raw
        delete profile._json

        // Guard email
        const email = profile.emails[0].value
        guard({ email })
        if (is.not.email(email)) {
          throw require('./errors/codes').AUTH_INVALID_EMAIL
        }

        // Upsert data
        const payload = {
          email,
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
