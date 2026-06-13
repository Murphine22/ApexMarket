import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dataService } from '../lib/dataService';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { user, token } = await dataService.login(email, password);
          localStorage.setItem('apexmarket_token', token);
          set({ user, token, loading: false });
          return user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ loading: true });
        try {
          const { user, token } = await dataService.register(payload);
          localStorage.setItem('apexmarket_token', token);
          set({ user, token, loading: false });
          return user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('apexmarket_token');
        set({ user: null, token: null });
      },
    }),
    { name: 'apexmarket_auth' }
  )
);

export const isAdmin = (user) => user?.role === 'admin';
