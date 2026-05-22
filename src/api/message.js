import { client } from './client.js'

export const messageApi = {
  sendMessage: ({ receiverId, content }) => {
    // Standard payload is { receiverId, content } or { userId, content }.
    // Let's send both or format as receiverId, matching the specification.
    return client.post('/api/messages', { receiverId, content })
  },

  getRooms: () => {
    return client.get('/api/messages/rooms')
  },

  getMessages: (userId) => {
    return client.get(`/api/messages/${userId}`)
  },
}
