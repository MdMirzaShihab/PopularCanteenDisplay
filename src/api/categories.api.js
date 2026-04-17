import apiClient from './client.js';

export const getCategories = () =>
  apiClient.get('/categories').then((r) => r.data);

export const createCategory = (data) =>
  apiClient.post('/categories', data).then((r) => r.data);

export const updateCategory = (id, data) =>
  apiClient.put(`/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id, { force = false } = {}) =>
  apiClient.delete(`/categories/${id}`, { params: force ? { force: 'true' } : {} }).then((r) => r.data);
