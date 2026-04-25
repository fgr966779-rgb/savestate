import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SyncAdapter } from './SyncAdapter';

export interface SyncQueueItem {
  id: string;
  recordType: string;
  recordId: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
}

const STORAGE_KEY = 'SaveState_sync_queue';

class SyncQueue {
  private queue: SyncQueueItem[] = [];
  private initialized = false;

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Initialize the queue from persisted storage.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored) as SyncQueueItem[];
      }
    } catch (error) {
      console.error('[SyncQueue] Failed to load queue from storage:', error);
      this.queue = [];
    }

    this.initialized = true;
  }

  /**
   * Ensure the queue is initialized before any operation.
   */
  private async ensureInit(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Persist the current queue to AsyncStorage.
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[SyncQueue] Failed to persist queue:', error);
    }
  }

  /**
   * Add a change to the sync queue for offline-first tracking.
   */
  async enqueue(
    recordType: string,
    recordId: string,
    action: 'create' | 'update' | 'delete',
    data: Record<string, unknown>
  ): Promise<void> {
    await this.ensureInit();

    const item: SyncQueueItem = {
      id: this.generateId(),
      recordType,
      recordId,
      action,
      data,
      timestamp: Date.now(),
    };

    // De-duplicate: remove any existing queue items for the same record
    this.queue = this.queue.filter(
      (existing) => !(existing.recordId === recordId && existing.recordType === recordType)
    );

    this.queue.push(item);
    await this.persist();
  }

  /**
   * Remove the first item from the queue and return it.
   */
  async dequeue(): Promise<SyncQueueItem | null> {
    await this.ensureInit();

    if (this.queue.length === 0) return null;

    const item = this.queue.shift()!;
    await this.persist();
    return item;
  }

  /**
   * Return all items without removing them (for inspection).
   */
  async peekAll(): Promise<SyncQueueItem[]> {
    await this.ensureInit();
    return [...this.queue];
  }

  /**
   * Get the current queue length.
   */
  async size(): Promise<number> {
    await this.ensureInit();
    return this.queue.length;
  }

  /**
   * Clear all items from the queue.
   */
  async clear(): Promise<void> {
    await this.ensureInit();
    this.queue = [];
    await this.persist();
  }

  /**
   * Remove items for a specific record from the queue.
   */
  async removeForRecord(
    recordType: string,
    recordId: string
  ): Promise<void> {
    await this.ensureInit();
    this.queue = this.queue.filter(
      (item) => !(item.recordType === recordType && item.recordId === recordId)
    );
    await this.persist();
  }

  /**
   * Process the entire queue by pushing each item through the sync adapter.
   * Stops processing on network errors but continues on individual item failures.
   */
  async processQueue(syncAdapter: SyncAdapter): Promise<{
    processed: number;
    failed: number;
    remaining: number;
  }> {
    await this.ensureInit();

    if (this.queue.length === 0) {
      return { processed: 0, failed: 0, remaining: 0 };
    }

    let processed = 0;
    let failed = 0;
    const failedIds: string[] = [];

    for (const item of this.queue) {
      try {
        const syncRecord = {
          id: item.recordId,
          _status: item.action === 'delete' ? 'deleted' : item.action === 'create' ? 'created' : 'updated',
          _changed: JSON.stringify(item.data),
          ...item.data,
          updated_at: item.timestamp,
        };

        const result = await syncAdapter.syncPush([syncRecord as any]);

        if (result.failed > 0) {
          failed++;
          failedIds.push(item.id);
        } else {
          processed++;
        }
      } catch (error) {
        console.error(
          `[SyncQueue] Error processing item ${item.id}:`,
          error
        );
        failed++;
        failedIds.push(item.id);
      }
    }

    // Remove successfully processed items from the queue
    this.queue = this.queue.filter((item) => failedIds.includes(item.id));
    await this.persist();

    return {
      processed,
      failed,
      remaining: this.queue.length,
    };
  }
}

// Singleton export
export default new SyncQueue();
