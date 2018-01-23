require('isomorphic-fetch')
const chalk = require('chalk')
const jwtToken = require('./jwt-token')
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
      if (process.env.EVENT_SERVICE_URL && false) {
        const bodyPayload = {
          type,
          timestamp: Date.now(),
          sender: 'nap',
          payload
        }
        try {
          console.log(chalk.yellow('dispatch event to', process.env.EVENT_SERVICE_URL))
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
      const bodyPayload = {
        sessionToken,
        event: type,
        timestamp: Date.now(),
        payload
      }
      console.log(chalk.yellow('Send user event: ') + type)
      console.log(chalk.yellow('User event send to ') + achievement_service_url)
      console.log('====== payload ======')
      console.dir(bodyPayload)
      console.log('====== end payload =====')
      const response = await global.fetch(achievement_service_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': achievement_service_access_token
        },
        body: JSON.stringify(bodyPayload),
        timeout: 5000
      })
      if (response.status !== 200) {
        throw response
      }
      const result = await response.json()
      console.log(result)
      const reward = {
        notifications: result.rewardList || []
      }
      if (reward.notifications.length > 0) {
        const promises = reward.notifications.map(async (notification) => {
          console.log(notification)
          return notificationService.createNotification(user._id, {
            text: notification.msg_enum,
            textAttr: notification.reward
          })
        })
        const result = await Promise.all(promises)
        return result
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
