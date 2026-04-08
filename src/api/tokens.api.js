import apiClient from './client.js';

export const getCurrent = () =>
  apiClient.get('/tokens/current').then((r) => r.data);

export const updateToken = (number) =>
  apiClient.put('/tokens/update', { number }).then((r) => r.data);

export const clearToken = () =>
  apiClient.delete('/tokens/clear').then((r) => r.data);

export const getArchive = (params) =>
  apiClient.get('/tokens/archive', { params }).then((r) => r.data);
