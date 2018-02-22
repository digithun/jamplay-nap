const events = require('./events')
const fetch = require('isomorphic-fetch')
const config = require('./config')

function handler ({ req, user }) {
  const affiliate = req.cookies.affiliate
  console.log('got affiliate', affiliate)
  if (affiliate) {
    fetch(config.affiliate_api + '/affiliate', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.affiliate_api_key
      },
      body: JSON.stringify({
        affiliateId: affiliate,
        referralId: user._id
      })
    })
    .then(async (res) => {
      if (res.status !== 200) {
        throw new Error('status not eq 200 ' + res.status + await res.text())
      }
      console.log('added affiliate', affiliate, user._id)
    })
    .catch(error => console.error('add affiliate error', user._id, error))
  }
}

module.exports = function (req, res, next) {
  req.nap.emitter.on(events.USER_SIGNUP_WITH_EMAIL, handler)
  req.nap.emitter.on(events.USER_SIGNUP_WITH_FACEBOOK, handler)
  req.nap.emitter.on(events.USER_SIGNUP_WITH_FACEBOOK_AND_EMAIL, handler)
  next()
}
