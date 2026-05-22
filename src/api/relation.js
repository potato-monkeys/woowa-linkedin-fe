import { client } from './client.js'

export const relationApi = {
  getRelations: () => {
    return client.get('/api/relations')
  },

  getReceivedRequests: () => {
    return client.get('/api/requests')
  },

  acceptRequest: (requestId) => {
    return client.post(`/api/requests/${requestId}/accept`).catch(() => {
      // Fallback in case of standard status PATCH
      return client.patch(`/api/requests/${requestId}`, { status: 'ACCEPTED' })
    })
  },

  rejectRequest: (requestId) => {
    return client.post(`/api/requests/${requestId}/reject`).catch(() => {
      // Fallback in case of standard status PATCH
      return client.patch(`/api/requests/${requestId}`, { status: 'REJECTED' })
    })
  },
}
