import apiClient from './client.js';

export const getItems = (params) =>
  apiClient.get('/items', { params }).then((r) => r.data);

export const getItemById = (id) =>
  apiClient.get(`/items/${id}`).then((r) => r.data);

export const createItem = (data) =>
  apiClient.post('/items', data).then((r) => r.data);

export const updateItem = (id, data) =>
  apiClient.put(`/items/${id}`, data).then((r) => r.data);

export const deleteItem = (id) =>
  apiClient.delete(`/items/${id}`).then((r) => r.data);
