// ============================================
// Product Store - Zustand State Management
// ============================================

import { create } from 'zustand';
import type { Product, ProductWithStock, ProductFilters } from '@/types';

interface ProductStore {
  // State
  products: ProductWithStock[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;

  // Pagination
  page: number;
  totalPages: number;
  hasMore: boolean;

  // Actions
  setProducts: (products: ProductWithStock[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSelectedProduct: (product: Product | null) => void;

  // Filters
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;

  // Pagination
  setPage: (page: number) => void;
  setPagination: (data: { totalPages: number; hasMore: boolean }) => void;

  // Loading & Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  // Initial State
  products: [],
  selectedProduct: null,
  filters: {},
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,
  hasMore: false,

  // Actions
  setProducts: (products) => set({ products }),

  addProduct: (product) =>
    set((state) => ({
      products: [{ ...product, currentStock: 0, lowStock: false }, ...state.products],
    })),

  updateProduct: (id, updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  // Filters
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1, // Reset to page 1 when filters change
    })),

  clearFilters: () => set({ filters: {}, page: 1 }),

  // Pagination
  setPage: (page) => set({ page }),
  setPagination: (data) => set(data),

  // Loading & Error
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Reset
  reset: () =>
    set({
      products: [],
      selectedProduct: null,
      filters: {},
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 1,
      hasMore: false,
    }),
}));
