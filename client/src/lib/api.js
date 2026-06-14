import axios from 'axios';

// Toggle between standalone demo mode and the real Express backend.
// Demo mode is ON by default so the app is fully usable without MongoDB.
export const USE_API = import.meta.env.VITE_USE_API === 'true';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('apexmarket_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || 'Request failed';
    return Promise.reject(Object.assign(new Error(message), {
      status: error?.response?.status,
    }));
  }
);
