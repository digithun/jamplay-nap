require('isomorphic-fetch')
module.exports = function ({ achievement_service_url }) {
  return async ({ type, payload }) => {
    return {
      notifications: [{
        type: 'share/receive-reward',
        payload: {
          type: 'silver',
          value: 3
        }
      }]
    }
    try {
      console.log('send user event: ' + type)
      const response = await global.fetch(achievement_service_url, {
        method: 'POST',
        body: JSON.stringify(Object.assign({
          uid: payload.userId,
          event: type,
          timestamp: Date.now()
        }, payload))
      })
      const result = await response.json()
      return {
        notifications: result.rewardList || []
      }
    } catch (e) {
      console.log('user-event-hook error')
      switch (e.message) {
        case 'Parameter "url" must be a string, not undefined':
          console.error('achievement_service_url not define in env')
          break
        default:
          console.error(e)
          break
      }
      return {
        notifications: []
      }
    }
  }
}
