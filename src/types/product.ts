// ============================================
// Product Types
// ============================================

import { BaseEntity } from './index';

export interface Product extends BaseEntity {
  storeId: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unit: ProductUnit;
  priceSell: number;
  priceCost?: number;
  imageUrl?: string;
  isActive: boolean;
  variants?: ProductVariant[];
}

export enum ProductUnit {
  PCS = 'pcs',
  KG = 'kg',
  GRAM = 'gram',
  LITER = 'liter',
  ML = 'ml',
  BOX = 'box',
  PACK = 'pack',
}

export interface ProductVariant extends BaseEntity {
  productId: string;
  name: string;
  skuSuffix: string;
  priceModifier: number;
}

export interface ProductWithStock extends Product {
  currentStock: number;
  lowStock: boolean;
}

export interface CreateProductInput {
  name: string;
  sku?: string;
  description?: string;
  category?: string;
  unit: ProductUnit;
  priceSell: number;
  priceCost?: number;
  imageUrl?: string;
  variants?: CreateVariantInput[];
}

export interface CreateVariantInput {
  name: string;
  skuSuffix: string;
  priceModifier?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  category?: string;
  unit?: ProductUnit;
  priceSell?: number;
  priceCost?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
}
