import { create } from 'zustand';

export interface CartItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku: string;
  price: number;
  unit: string;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const items = get().items;
    const existingIndex = items.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      const currentQuantity = newItems[existingIndex].quantity;
      const newQuantity = Math.min(currentQuantity + 1, item.maxStock);
      newItems[existingIndex].quantity = newQuantity;
      set({ items: newItems });
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] });
    }
  },

  removeItem: (productId, variantId) => {
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      ),
    }));
  },

  updateQuantity: (productId, quantity, variantId) => {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          const newQuantity = Math.max(1, Math.min(quantity, item.maxStock));
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalAmount: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
