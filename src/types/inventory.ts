// ============================================
// Inventory Types
// ============================================

import { BaseEntity } from './index';

export interface InventoryItem extends BaseEntity {
  storeId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  batchCode?: string;
  expiryDate?: Date;
  costPrice?: number;
  lastCountedAt?: Date;
}

export interface StockLevel {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  totalQuantity: number;
  batches?: StockBatch[];
}

export interface StockBatch {
  batchCode: string;
  quantity: number;
  expiryDate?: Date;
  costPrice?: number;
  daysUntilExpiry?: number;
}

export interface StockInInput {
  productId: string;
  variantId?: string;
  quantity: number;
  batchCode?: string;
  expiryDate?: Date;
  costPrice?: number;
}

export interface StockAdjustmentInput {
  productId: string;
  variantId?: string;
  quantity: number;
  reason: StockAdjustmentReason;
  notes?: string;
}

export enum StockAdjustmentReason {
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  LOST = 'lost',
  FOUND = 'found',
  CORRECTION = 'correction',
  SAMPLE = 'sample',
  OTHER = 'other',
}

export interface StockMovement extends BaseEntity {
  storeId: string;
  productId: string;
  variantId?: string;
  type: StockMovementType;
  quantity: number;
  batchCode?: string;
  reason?: string;
  referenceId?: string;
  performedBy: string;
}

export enum StockMovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
  SALE = 'sale',
  RETURN = 'return',
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  currentStock: number;
  threshold: number;
}

export interface ExpiryAlert {
  productId: string;
  productName: string;
  batchCode: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  quantity: number;
}
