// ============================================
// Zod Validation Schemas
// ============================================

import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
  storeName: z.string().min(2, 'Nama toko minimal 2 karakter'),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(2, 'Nama produk minimal 2 karakter'),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.enum(['PCS', 'KG', 'GRAM', 'LITER', 'ML', 'BOX', 'PACK']),
  priceSell: z.number().positive('Harga jual harus lebih dari 0'),
  priceCost: z.number().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  variants: z.array(
    z.object({
      name: z.string(),
      skuSuffix: z.string(),
      priceModifier: z.number().optional(),
    })
  ).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.enum(['PCS', 'KG', 'GRAM', 'LITER', 'ML', 'BOX', 'PACK']).optional(),
  priceSell: z.number().positive().optional(),
  priceCost: z.number().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

// Transaction schemas
export const createTransactionSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      variantId: z.string().uuid().optional(),
      quantity: z.number().int().positive('Jumlah harus lebih dari 0'),
      priceUnit: z.number().positive('Harga harus lebih dari 0'),
      batchCode: z.string().optional(),
    })
  ).min(1, 'Minimal 1 item harus ada'),
  paymentMethod: z.enum([
    'CASH',
    'TRANSFER_BCA',
    'TRANSFER_BRI',
    'TRANSFER_MANDIRI',
    'TRANSFER_BNI',
    'EWALLET_OVO',
    'EWALLET_GOPAY',
    'EWALLET_DANA',
    'EWALLET_SHOPEEPAY',
  ]),
  paymentReference: z.string().optional(),
  amountReceived: z.number().positive().optional(),
  notes: z.string().optional(),
});

// Inventory schemas
export const stockInSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().or(z.literal('')),
  quantity: z.number().int().positive('Jumlah harus lebih dari 0'),
  batchCode: z.string().optional().or(z.literal('')),
  expiryDate: z.string().datetime().optional().or(z.literal('')),
  costPrice: z.number().positive().optional(),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int(),
  reason: z.enum(['DAMAGED', 'EXPIRED', 'LOST', 'FOUND', 'CORRECTION', 'SAMPLE', 'OTHER']),
  notes: z.string().optional(),
});

// Store schemas
export const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  settings: z.object({
    taxRate: z.number().min(0).max(100).optional(),
    lowStockThreshold: z.number().int().positive().optional(),
    expiryAlertDays: z.number().int().positive().optional(),
    enableBatchTracking: z.boolean().optional(),
    enableExpiryTracking: z.boolean().optional(),
    defaultPaymentMethod: z.string().optional(),
    receiptFooterText: z.string().optional(),
  }).optional(),
});
