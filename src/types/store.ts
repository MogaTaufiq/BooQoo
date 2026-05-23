// ============================================
// Store Types
// ============================================

import { BaseEntity } from './index';

export interface Store extends BaseEntity {
  name: string;
  ownerId: string;
  description?: string;
  phone?: string;
  address?: string;
  timezone: string;
  currency: Currency;
  settings: StoreSettings;
}

export enum Currency {
  IDR = 'IDR',
  USD = 'USD',
}

export interface StoreSettings {
  taxRate?: number;
  lowStockThreshold: number;
  expiryAlertDays: number;
  enableBatchTracking: boolean;
  enableExpiryTracking: boolean;
  defaultPaymentMethod: PaymentMethod;
  receiptFooterText?: string;
  businessHours?: {
    open: string;
    close: string;
  };
}

export enum PaymentMethod {
  CASH = 'cash',
  TRANSFER_BCA = 'transfer_bca',
  TRANSFER_BRI = 'transfer_bri',
  TRANSFER_MANDIRI = 'transfer_mandiri',
  TRANSFER_BNI = 'transfer_bni',
  EWALLET_OVO = 'ewallet_ovo',
  EWALLET_GOPAY = 'ewallet_gopay',
  EWALLET_DANA = 'ewallet_dana',
  EWALLET_SHOPEEPAY = 'ewallet_shopeepay',
}

export interface CreateStoreInput {
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  timezone?: string;
  currency?: Currency;
}

export interface UpdateStoreInput {
  name?: string;
  description?: string;
  phone?: string;
  address?: string;
  settings?: Partial<StoreSettings>;
}
