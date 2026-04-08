import apiClient from './client.js';

export const getUsers = (params) =>
  apiClient.get('/users', { params }).then((r) => r.data);

export const getUserById = (id) =>
  apiClient.get(`/users/${id}`).then((r) => r.data);

export const createUser = (data) =>
  apiClient.post('/users', data).then((r) => r.data);

export const updateUser = (id, data) =>
  apiClient.put(`/users/${id}`, data).then((r) => r.data);

export const deleteUser = (id) =>
  apiClient.delete(`/users/${id}`).then((r) => r.data);
