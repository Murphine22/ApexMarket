// Single data-access layer. Routes calls to either the real backend (USE_API)
// or the in-browser demo database. The rest of the app only imports from here.
// API responses are normalized to the same shape the demo layer returns, so
// every page behaves identically regardless of mode.

import { api, USE_API } from './api';
import { demoApi } from './demoDb';

const unwrap = (res) => res.data?.data ?? res.data;

const withId = (o) => (o && o.id == null && o._id != null ? { ...o, id: o._id } : o);

const normProduct = (p) => withId(p);

// The UI treats `total` as the pre-tax base (it applies tax for display), and
// reads the cashier's name from `cashier`. Map the backend shape to match.
const normTxn = (t) => ({
  ...t,
  id: t.id ?? t._id,
  items: t.items ?? [],
  subtotal: t.subtotal ?? t.total ?? 0,
  tax: t.tax ?? 0,
  total: t.subtotal ?? t.total ?? 0,
  cashier: t.cashierName ?? t.cashier ?? '—',
});

const normLog = (l) => withId(l);

// Strip server-managed fields before sending an update.
const cleanProductPayload = (p) => {
  const { _id, id, __v, createdAt, updatedAt, isLowStock, ...rest } = p;
  return rest;
};

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
    return unwrap(await api.get('/products')).map(normProduct);
  },
  async createProduct(payload) {
    if (!USE_API) return demoApi.createProduct(payload);
    return normProduct(unwrap(await api.post('/products', payload)));
  },
  async updateProduct(id, payload) {
    if (!USE_API) return demoApi.updateProduct(id, payload);
    return normProduct(unwrap(await api.put(`/products/${id}`, cleanProductPayload(payload))));
  },
  async deleteProduct(id) {
    if (!USE_API) return demoApi.deleteProduct(id);
    return unwrap(await api.delete(`/products/${id}`));
  },

  // --- Transactions ---
  async getTransactions() {
    if (!USE_API) return demoApi.getTransactions();
    return unwrap(await api.get('/transactions')).map(normTxn);
  },
  async createTransaction(payload) {
    if (!USE_API) return demoApi.createTransaction(payload);
    return normTxn(unwrap(await api.post('/transactions', payload)));
  },

  // --- Inventory ---
  async getLogs() {
    if (!USE_API) return demoApi.getLogs();
    return unwrap(await api.get('/inventory/logs')).map(normLog);
  },
  async recordMovement(payload) {
    if (!USE_API) return demoApi.recordMovement(payload);
    return normLog(unwrap(await api.post('/inventory/movements', payload)));
  },
  async getLowStock() {
    if (!USE_API) return demoApi.getLowStock();
    return unwrap(await api.get('/inventory/low-stock')).map(normProduct);
  },
};
