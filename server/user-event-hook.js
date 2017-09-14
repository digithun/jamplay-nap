require('isomorphic-fetch')
module.exports = function ({ achievement_service_url, achievement_service_apikey }) {
  return async ({ type, sessionToken, payload }) => {
    try {
      console.log('send user event: ' + type)
      const response = await global.fetch(achievement_service_url, {
        method: 'POST',
        headers: {
          'x-api-key': achievement_service_apikey
        },
        body: JSON.stringify({
          sessionToken,
          event: type,
          timestamp: Date.now(),
          payload
        })
      })
      const result = await response.json()
      return {
        notifications: result.rewardList || []
      }
    } catch (e) {
      console.log('user-event-hook: error')
      switch (e.message) {
        case 'Parameter "url" must be a string, not undefined':
          console.error('achievement_service_url not define in env')
          break
        default:
          console.error(e.code)
          break
      }
      return {
        notifications: []
      }
    }
  }
}
