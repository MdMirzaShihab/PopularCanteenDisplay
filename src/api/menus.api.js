import apiClient from './client.js';

export const getMenus = (params) =>
  apiClient.get('/menus', { params }).then((r) => r.data);

export const getMenuById = (id) =>
  apiClient.get(`/menus/${id}`).then((r) => r.data);

export const createMenu = (data) =>
  apiClient.post('/menus', data).then((r) => r.data);

export const updateMenu = (id, data) =>
  apiClient.put(`/menus/${id}`, data).then((r) => r.data);

export const deleteMenu = (id) =>
  apiClient.delete(`/menus/${id}`).then((r) => r.data);
