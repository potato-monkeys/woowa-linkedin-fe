import { client } from './client.js'

export const relationApi = {
  getRelations: () => {
    return client.get('/api/relations')
  },

  getReceivedRequests: () => {
    return client.get('/requests/received')
  },

  acceptRequest: (requestId) => {
    return client.post(`/requests/${requestId}/accept`)
  },

  rejectRequest: (requestId) => {
    return client.post(`/requests/${requestId}/reject`)
  },

  createActionRequest: ({ requesterId, receiverId, actionType }) => {
    return client.post('/api/action-requests', { requesterId, receiverId, actionType })
  },

  getGraph: () => {
    return client.get('/api/graph')
  },
}
