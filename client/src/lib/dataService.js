// Single data-access layer. Routes calls to either the real backend (USE_API)
// or the in-browser demo database. The rest of the app only imports from here.

import { api, USE_API } from './api';
import { demoApi } from './demoDb';

const unwrap = (res) => res.data?.data ?? res.data;

export const dataService = {
  mode: USE_API ? 'api' : 'demo',

  // --- Auth ---
  async login(email, password) {
    if (!USE_API) return demoApi.login(email, password);
    return unwrap(await api.post('/auth/login', { email, password }));
  },
  async register(payload) {
    if (!USE_API) return demoApi.register(payload);
    return unwrap(await api.post('/auth/register', payload));
  },

  // --- Products ---
  async getProducts() {
    if (!USE_API) return demoApi.getProducts();
    return unwrap(await api.get('/products'));
  },
  async createProduct(payload) {
    if (!USE_API) return demoApi.createProduct(payload);
    return unwrap(await api.post('/products', payload));
  },
  async updateProduct(id, payload) {
    if (!USE_API) return demoApi.updateProduct(id, payload);
    return unwrap(await api.put(`/products/${id}`, payload));
  },
  async deleteProduct(id) {
    if (!USE_API) return demoApi.deleteProduct(id);
    return unwrap(await api.delete(`/products/${id}`));
  },

  // --- Transactions ---
  async getTransactions() {
    if (!USE_API) return demoApi.getTransactions();
    return unwrap(await api.get('/transactions'));
  },
  async createTransaction(payload) {
    if (!USE_API) return demoApi.createTransaction(payload);
    return unwrap(await api.post('/transactions', payload));
  },

  // --- Inventory logs ---
  async getLogs() {
    if (!USE_API) return demoApi.getLogs();
    return unwrap(await api.get('/inventory/logs'));
  },
};
