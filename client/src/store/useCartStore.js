import { create } from 'zustand';

// POS cart state. Kept separate from server state (React Query) on purpose:
// the cart is ephemeral client UI state, products/transactions are server state.
export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.sku === product.sku);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.sku === product.sku ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { sku: product.sku, name: product.name, price: product.price, quantity: 1 },
        ],
      };
    }),

  setQuantity: (sku, quantity) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.sku === sku ? { ...i, quantity: Math.max(0, quantity) } : i))
        .filter((i) => i.quantity > 0),
    })),

  removeItem: (sku) =>
    set((state) => ({ items: state.items.filter((i) => i.sku !== sku) })),

  clear: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
