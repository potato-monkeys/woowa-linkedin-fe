import { client } from './client.js'

export const swipeApi = {
  createSwipe: ({ targetUserId, action, relationAction }) => {
    return client.post('/swipes', { targetUserId, action, relationAction })
  },
}
