// ============================================
// Offline Sync Engine
// ============================================

import { getDB } from '@/lib/storage/indexeddb';
import { apiClient } from '@/lib/api/client';
import type { SyncResponse, SyncStatus } from '@/types';

export class SyncEngine {
  private isSyncing = false;
  private retryCount = 0;
  private maxRetries = 5;

  async syncPendingTransactions(): Promise<SyncResponse | null> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return null;
    }

    if (!navigator.onLine) {
      console.log('Device is offline, skipping sync');
      return null;
    }

    this.isSyncing = true;

    try {
      const db = await getDB();
      const pendingTransactions = await db.getAllFromIndex(
        'transactions',
        'by-sync-status',
        'pending'
      );

      if (pendingTransactions.length === 0) {
        console.log('No pending transactions to sync');
        return null;
      }

      console.log(`Syncing ${pendingTransactions.length} pending transactions`);

      const response = await apiClient.post<SyncResponse>('/api/sync', {
        timestamp: new Date(),
        clientVersion: '1.0.0',
        pendingTransactions,
      });

      if (response.data) {
        await this.processSyncResponse(response.data);
        this.retryCount = 0;
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Sync failed:', error);
      this.retryCount++;

      if (this.retryCount < this.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), 60000);
        setTimeout(() => this.syncPendingTransactions(), delay);
      }

      return null;
    } finally {
      this.isSyncing = false;
    }
  }

  private async processSyncResponse(response: SyncResponse): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('transactions', 'readwrite');

    for (const synced of response.syncedTransactions) {
      if (synced.status === 'success') {
        const transaction = await tx.store.get(synced.localId);
        if (transaction) {
          transaction.syncStatus = 'synced' as SyncStatus;
          transaction.id = synced.serverId;
          await tx.store.put(transaction);
        }
      }
    }

    for (const conflict of response.conflicts) {
      const transaction = await tx.store.get(conflict.localId);
      if (transaction) {
        transaction.syncStatus = 'conflict' as SyncStatus;
        transaction.conflictFlag = true;
        await tx.store.put(transaction);
      }
    }

    await tx.done;

    await this.updateSyncMetadata({
      lastSyncTime: new Date(),
      lastSyncStatus: response.syncStatus,
      pendingCount: await this.getPendingCount(),
      serverVersion: response.serverTime.toString(),
    });
  }

  private async updateSyncMetadata(metadata: {
    lastSyncTime: Date;
    lastSyncStatus: string;
    pendingCount: number;
    serverVersion: string;
  }): Promise<void> {
    const db = await getDB();
    await db.put('syncMetadata', {
      key: 'sync_state',
      lastSyncTime: metadata.lastSyncTime,
      lastSyncStatus: metadata.lastSyncStatus,
      pendingCount: metadata.pendingCount,
      serverVersion: metadata.serverVersion,
    });
  }

  private async getPendingCount(): Promise<number> {
    const db = await getDB();
    const pending = await db.getAllFromIndex('transactions', 'by-sync-status', 'pending');
    return pending.length;
  }

  async getSyncState() {
    const db = await getDB();
    return db.get('syncMetadata', 'sync_state');
  }
}

export const syncEngine = new SyncEngine();
