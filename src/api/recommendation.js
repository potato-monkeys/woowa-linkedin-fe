import { client } from './client.js'

export const recommendationApi = {
  getRecommendations: () => {
    return client.get('/api/recommendations')
  },
}
