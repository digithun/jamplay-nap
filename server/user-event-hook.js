require('isomorphic-fetch')
const chalk = require('chalk')
const jwtToken = require('./jwt-token')
const events = require('./events')
const fetch = require('isomorphic-fetch')
const config = require('./config')

function affiliateHandler ({ req, user }) {
  const affiliate = req.cookies.affiliate
  console.log('got affiliate', affiliate, user._id)
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
      .catch(error => console.error('add affiliate error', user._id, affiliate, error))
  }
}
NAP.emitter.on(events.USER_SIGNUP_WITH_EMAIL, affiliateHandler)
NAP.emitter.on(events.USER_VERIFIED_BY_FACEBOOK, affiliateHandler)
NAP.emitter.on(events.USER_SIGNUP_WITH_FACEBOOK_AND_EMAIL, affiliateHandler)

module.exports = function ({ achievement_service_url, achievement_service_access_token }, notificationService) {
  return async ({ type, sessionToken, payload, user }) => {
    if (!sessionToken && user) {
      // gen sessionToken
      sessionToken = jwtToken.createSessionToken(null, user._id.toString())
    }
    if (process.env.NODE_ENV === 'development' && process.env.USER_EVENT_HOOK_MOCK) {
      console.log(chalk.bgRed('user-event-hook: development mode in active, will mock response from acheivement service'))
      return {
        'notifications': [
          {
            'qid': '2150af13-137a-45b0-bc80-47aee2448d40',
            'contentId': 'somebookid239849023uf9ds',
            'reward': {
              'silver': 1
            },
            'token': '59bbaf42a2aaab3aef2ba206',
            'msg_enum': 'share-mock/quest-share-book'
          }
        ]
      }
    }
    try {
      if (process.env.EVENT_SERVICE_URL) {
        const bodyPayload = {
          type,
          userId: user._id,
          timestamp: Date.now(),
          sender: 'nap',
          payload
        }
        try {
          console.log(chalk.yellow(`dispatch ${bodyPayload.type} event to`, process.env.EVENT_SERVICE_URL))
          await global.fetch(process.env.EVENT_SERVICE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': process.env.EVENT_SERVICE_API_KEY
            },
            body: JSON.stringify(bodyPayload),
            timeout: 5000
          })
        } catch (error) {
          console.error('EVENT_SERVICE: ', error)
        }
      }
    } catch (e) {
      console.log('user-event-hook: error')
      switch (e.name) {
        case 'Parameter "url" must be a string, not undefined':
          console.error('achievement_service_url not define in env')
          break
        case 'FetchError': {
          console.log('Fetch error')
          console.log(e.message)
          const error = new Error('user-event/timeout')
          error.name = 'user-event'
          error.message = 'user-event/timeout-no-reward-added'
          throw error
        }
        default:
          const result = await e.text()
          console.error(result)
          break
      }
      return {
        notifications: []
      }
    }
  }
}
