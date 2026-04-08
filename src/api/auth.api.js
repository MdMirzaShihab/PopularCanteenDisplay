import apiClient from './client.js';

export const login = (username, password) =>
  apiClient.post('/auth/login', { username, password }).then((r) => r.data);

export const logout = () =>
  apiClient.post('/auth/logout').then((r) => r.data);

export const getMe = () =>
  apiClient.get('/auth/me').then((r) => r.data);
