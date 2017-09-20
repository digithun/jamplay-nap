require('isomorphic-fetch')
const chalk = require('chalk')
module.exports = function ({ achievement_service_url, achievement_service_apikey }, notificationService) {
  return async ({ type, sessionToken, payload, user }) => {
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
      console.log(chalk.yellow('Send user event: ') + type)
      console.log(chalk.yellow('User event send to ') + achievement_service_url)
      const bodyPayload = {
        sessionToken,
        event: type,
        timestamp: Date.now(),
        payload
      }
      console.log('====== payload ======')
      console.dir(bodyPayload)
      console.log('====== end payload =====')
      const response = await global.fetch(achievement_service_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': achievement_service_apikey
        },
        body: JSON.stringify(bodyPayload),
        timeout: 5000
      })
      const result = await response.json()
      const reward = {
        notifications: result.rewardList || []
      }

      if (reward.notifications.length > 0) {
        const promises = reward.notifications.map(async (notification) => {
          await notificationService.createNotification(user._id, {
            text: notification.msg_enum,
            textAttr: notification.reward
          })
        })
        await Promise.all(promises)
      }
    } catch (e) {
      console.log('user-event-hook: error')
      console.log(e.name)
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
          console.error(e.code)
          console.log(e)
          break
      }
      return {
        notifications: []
      }
    }
  }
}
