const initLocalStrategy = passport => {
  const LocalStrategy = require('passport-local')
  const { validateLocalStrategy } = require('./authen-local-passport')

  // @ts-ignore
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: false
      },
      validateLocalStrategy
    )
  )
}
const init = (app, passport) => {
  // Handler
  const { auth_local_token, reset_password_by_token, auth_local } = require('./authen-local-passport').handler

  // Before verify
  app.get('/auth/local/:token', auth_local_token)

  // After verify
  initLocalStrategy(passport)

  // reset-password-by-token
  app.post('/reset-password-by-token', reset_password_by_token)

  // Route
  const { auth_error_uri } = require('./config')
  app.post('/auth/local', passport.authenticate('local', { failureRedirect: auth_error_uri }), auth_local)
}

module.exports = init
