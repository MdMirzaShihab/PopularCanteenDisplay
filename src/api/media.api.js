import apiClient from './client.js';

export const getMedia = (params) =>
  apiClient.get('/media', { params }).then((r) => r.data);

export const getMediaById = (id) =>
  apiClient.get(`/media/${id}`).then((r) => r.data);

export const createMedia = (data) =>
  apiClient.post('/media', data).then((r) => r.data);

export const deleteMedia = (id, force = false) =>
  apiClient.delete(`/media/${id}`, { params: force ? { force: 'true' } : {} }).then((r) => r.data);
