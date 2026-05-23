// ============================================
// IndexedDB Wrapper for Offline Storage
// ============================================

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Transaction, Product, InventoryItem, User, Store } from '@/types';

interface BooQooDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  stores: {
    key: string;
    value: Store;
  };
  products: {
    key: string;
    value: Product;
    indexes: { 'by-store': string; 'by-sku': string };
  };
  inventory: {
    key: string;
    value: InventoryItem;
    indexes: { 'by-store': string; 'by-product': string };
  };
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-store': string; 'by-sync-status': string; 'by-date': Date };
  };
  syncMetadata: {
    key: string;
    value: {
      key: string;
      lastSyncTime?: Date;
      lastSyncStatus: string;
      pendingCount: number;
      serverVersion?: string;
    };
  };
}

const DB_NAME = 'booqoo_store';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<BooQooDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<BooQooDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BooQooDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email', { unique: true });
      }

      // Stores store
      if (!db.objectStoreNames.contains('stores')) {
        db.createObjectStore('stores', { keyPath: 'id' });
      }

      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('by-store', 'storeId');
        productStore.createIndex('by-sku', 'sku', { unique: true });
      }

      // Inventory store
      if (!db.objectStoreNames.contains('inventory')) {
        const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
        inventoryStore.createIndex('by-store', 'storeId');
        inventoryStore.createIndex('by-product', 'productId');
      }

      // Transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
        transactionStore.createIndex('by-store', 'storeId');
        transactionStore.createIndex('by-sync-status', 'syncStatus');
        transactionStore.createIndex('by-date', 'transactionDate');
      }

      // Sync metadata store
      if (!db.objectStoreNames.contains('syncMetadata')) {
        db.createObjectStore('syncMetadata', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

export async function getDB(): Promise<IDBPDatabase<BooQooDB>> {
  if (!dbInstance) {
    return initDB();
  }
  return dbInstance;
}

export async function clearDB(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ['users', 'stores', 'products', 'inventory', 'transactions', 'syncMetadata'],
    'readwrite'
  );

  await Promise.all([
    tx.objectStore('users').clear(),
    tx.objectStore('stores').clear(),
    tx.objectStore('products').clear(),
    tx.objectStore('inventory').clear(),
    tx.objectStore('transactions').clear(),
    tx.objectStore('syncMetadata').clear(),
  ]);

  await tx.done;
}
