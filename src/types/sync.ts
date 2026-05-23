// ============================================
// Sync & Offline Types
// ============================================

import { Transaction } from './transaction';

export interface SyncState {
  lastSyncTime?: Date;
  lastSyncStatus: SyncStatusType;
  pendingCount: number;
  serverVersion?: string;
  isSyncing: boolean;
}

export enum SyncStatusType {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  PARTIAL = 'partial',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

export interface SyncRequest {
  timestamp: Date;
  clientVersion: string;
  pendingTransactions: PendingTransaction[];
  lastSyncTime?: Date;
}

export interface PendingTransaction extends Omit<Transaction, 'id' | 'createdAtServer'> {
  localId: string;
  retryCount: number;
  lastAttempt?: Date;
}

export interface SyncResponse {
  syncStatus: SyncStatusType;
  syncedTransactions: SyncedTransaction[];
  conflicts: SyncConflict[];
  serverState: ServerState;
  serverTime: Date;
  message?: string;
}

export interface SyncedTransaction {
  localId: string;
  serverId: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface SyncConflict {
  localId: string;
  type: ConflictType;
  reason: string;
  serverData?: unknown;
  clientData?: unknown;
  resolution?: ConflictResolution;
}

export enum ConflictType {
  STOCK_INSUFFICIENT = 'stock_insufficient',
  PRODUCT_NOT_FOUND = 'product_not_found',
  PRICE_CHANGED = 'price_changed',
  DUPLICATE_TRANSACTION = 'duplicate_transaction',
  STALE_DATA = 'stale_data',
}

export enum ConflictResolution {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  MANUAL = 'manual',
  MERGE = 'merge',
}

export interface ServerState {
  products: unknown[];
  inventory: unknown[];
  transactionsSince?: Date;
}

export interface OfflineQueueItem {
  id: string;
  type: OfflineActionType;
  payload: unknown;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

export enum OfflineActionType {
  CREATE_TRANSACTION = 'create_transaction',
  STOCK_IN = 'stock_in',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  UPDATE_PRODUCT = 'update_product',
  UPDATE_STORE = 'update_store',
}

export interface ConnectionState {
  isOnline: boolean;
  lastOnline?: Date;
  connectionType?: 'wifi' | '4g' | '3g' | '2g' | 'unknown';
}
