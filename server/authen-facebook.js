const { guard } = require('./errors')

// Valid accessToken?
const willLoginWithFacebook = async (req, accessToken) => {
  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env

  // Guard
  guard({ FACEBOOK_APP_ID })
  guard({ FACEBOOK_APP_SECRET })
  guard({ accessToken })

  // To let passport-facebook-token consume
  req.body.access_token = accessToken

  // Validate facebook token
  const { willAuthenWithPassport } = require('./passport-authen')
  return willAuthenWithPassport('facebook-token', req)
}

// Valid accessToken?
const willGetFacebookProfile = async (req, accessToken) => {
  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env

  // Guard
  guard({ FACEBOOK_APP_ID })
  guard({ FACEBOOK_APP_SECRET })
  guard({ accessToken })

  // To let passport-facebook-token consume
  req.body.access_token = accessToken

  // Validate facebook token
  const { willGetProfileWithPassport } = require('./passport-authen')
  return willGetProfileWithPassport('facebook', 'facebook-token', req)
}

module.exports = {
  willLoginWithFacebook,
  willGetFacebookProfile
}
