import axios from 'axios';

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
});

// Error normalizer matching client.js pattern
publicClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const message =
      data?.message || error.message || 'Unexpected error';
    return Promise.reject(new Error(message));
  },
);

export const getScreenById = (id) =>
  publicClient.get(`/screens/${id}`).then((r) => r.data);
