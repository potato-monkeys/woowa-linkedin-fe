import { client } from './client.js';

export const userApi = {
  signup: (nickname, password, introduction) => {
    return client.post('/api/users/signup', {
      nickname,
      password,
      introduction,
    });
  },

  login: (nickname, password) => {
    return client.post('/api/users/login', { nickname, password });
  },

  getMe: () => {
    return client.get('/api/users/me');
  },

  updateMe: ({ nickname, bio, introduction }) => {
    const payload = {
      introduction: introduction ?? bio,
    };

    if (nickname) {
      payload.nickname = nickname;
    }

    return client.put('/api/users/me', payload);
  },

  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    return client.post('/api/users/me/profile-image', formData);
  },

  uploadVoice: (voiceFile) => {
    const formData = new FormData();
    formData.append('file', voiceFile);
    return client.post('/api/users/me/recording', formData);
  },

  getUserById: (userId) => {
    return client.get(`/api/users/${userId}`);
  },

  getCrews: async () => {
    const graph = await client.get('/api/graph');
    return graph.nodes || [];
  },

  getAllUsers: () => {
    return client.get('/api/users');
  },
};
