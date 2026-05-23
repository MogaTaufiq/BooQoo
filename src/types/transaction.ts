// ============================================
// Transaction Types
// ============================================

import { BaseEntity } from './index';
import { PaymentMethod } from './store';

export interface Transaction extends BaseEntity {
  storeId: string;
  transactionDate: Date;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  amountReceived?: number;
  changeAmount?: number;
  notes?: string;
  createdBy: string;
  syncStatus: SyncStatus;
  createdAtLocal: Date;
  createdAtServer?: Date;
  conflictFlag?: boolean;
  items: TransactionDetail[];
}

export interface TransactionDetail extends BaseEntity {
  transactionId: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  priceUnit: number;
  subtotal: number;
  batchCodeUsed?: string;
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  CONFLICT = 'conflict',
  FAILED = 'failed',
}

export interface CreateTransactionInput {
  items: TransactionItemInput[];
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  amountReceived?: number;
  notes?: string;
}

export interface TransactionItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  priceUnit: number;
  batchCode?: string;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalAmount: number;
  totalItems: number;
  averageTransaction: number;
  topProducts: TopProduct[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface TransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  paymentMethod?: PaymentMethod;
  createdBy?: string;
  syncStatus?: SyncStatus;
}

export interface DailySales {
  date: string;
  totalAmount: number;
  transactionCount: number;
  itemCount: number;
}
