import apiClient from './client.js';

export const getFoodScreens = (params) =>
  apiClient.get('/food-screens', { params }).then((r) => r.data);

export const getFoodScreenById = (id) =>
  apiClient.get(`/food-screens/${id}`).then((r) => r.data);

export const createFoodScreen = (data) =>
  apiClient.post('/food-screens', data).then((r) => r.data);

export const updateFoodScreen = (id, data) =>
  apiClient.put(`/food-screens/${id}`, data).then((r) => r.data);

export const deleteFoodScreen = (id) =>
  apiClient.delete(`/food-screens/${id}`).then((r) => r.data);

export const duplicateFoodScreen = (id) =>
  apiClient.post(`/food-screens/${id}/duplicate`).then((r) => r.data);
