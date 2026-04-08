import apiClient from './client.js';

export const getTokenScreens = (params) =>
  apiClient.get('/token-screens', { params }).then((r) => r.data);

export const getTokenScreenById = (id) =>
  apiClient.get(`/token-screens/${id}`).then((r) => r.data);

export const createTokenScreen = (data) =>
  apiClient.post('/token-screens', data).then((r) => r.data);

export const updateTokenScreen = (id, data) =>
  apiClient.put(`/token-screens/${id}`, data).then((r) => r.data);

export const deleteTokenScreen = (id) =>
  apiClient.delete(`/token-screens/${id}`).then((r) => r.data);
