import axios from 'axios';

let onAuthExpired = null;

/**
 * Register a callback that fires when any API response returns 401.
 * Called once by AuthContext on mount to wire up its logout function.
 */
export function registerAuthExpiredHandler(fn) {
  onAuthExpired = fn;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Response interceptor ----
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 — auth expired / invalid session
    // Skip for /auth/me — that 401 is expected when no session exists
    const url = error.config?.url || '';
    if (error.response?.status === 401 && onAuthExpired && !url.includes('/auth/me')) {
      onAuthExpired();
    }

    // Normalise the error message
    const data = error.response?.data;
    const message =
      data?.message || data?.errors || error.message || 'Unexpected error';

    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  },
);

export default apiClient;
