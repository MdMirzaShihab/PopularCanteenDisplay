import apiClient from './client.js';

export const getLogs = (params) =>
  apiClient.get('/logs', { params }).then((r) => r.data);
