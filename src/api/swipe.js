import { client } from './client.js'

export const swipeApi = {
  createSwipe: ({ targetId, action, activityType }) => {
    return client.post('/api/swipes', { targetId, action, activityType })
  },
}
