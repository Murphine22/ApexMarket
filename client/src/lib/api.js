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
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');

    // A stale/expired token should not leave the user on a zeroed-out screen —
    // clear the session and bounce to login so they can re-authenticate.
    if (status === 401 && !isAuthCall && typeof window !== 'undefined') {
      localStorage.removeItem('apexmarket_token');
      localStorage.removeItem('apexmarket_auth');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    const message =
      error?.response?.data?.message || error?.message || 'Request failed';
    return Promise.reject(Object.assign(new Error(message), { status }));
  }
);
