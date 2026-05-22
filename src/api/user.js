import { client } from './client.js'

export const userApi = {
  signup: (nickname, password, introduction) => {
    return client.post('/api/users/signup', { nickname, password, introduction })
  },

  login: (nickname, password) => {
    return client.post('/api/users/login', { nickname, password })
  },

  getMe: () => {
    return client.get('/api/users/me')
  },

  updateMe: ({ nickname, bio, introduction }) => {
    return client.patch('/api/users/me', { nickname, bio, introduction })
  },

  uploadImage: (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    return client.post('/api/users/me/image', formData)
  },

  uploadVoice: (voiceFile) => {
    const formData = new FormData()
    formData.append('voice', voiceFile)
    return client.post('/api/users/me/voice', formData)
  },

  getUserById: (userId) => {
    return client.get(`/api/users/${userId}`)
  },

  getCrews: () => {
    // Falls back or retrieves all active crews to render the network map
    return client.get('/api/users')
  },
}
