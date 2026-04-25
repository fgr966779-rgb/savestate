import { SupabaseClient } from '@supabase/supabase-js';

// ── Types ───────────────────────────────────────────────────────
interface SyncRecord {
  id: string;
  _status: string;
  _changed: string;
  updated_at?: string | number;
  [key: string]: unknown;
}

interface SyncPullResult {
  records: Array<Record<string, unknown>>;
  deleted: string[];
  timestamp: number;
}

interface SyncPushResult {
  pushed: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

const SYNC_TABLES = [
  'users',
  'goals',
  'transactions',
  'quests',
  'achievements',
  'streaks',
] as const;

type SyncTableName = (typeof SYNC_TABLES)[number];

// WatermelonDB internal columns that must NOT be sent to Supabase
const WM_INTERNAL_COLUMNS = new Set(['_status', '_changed', '_created_at']);

/**
 * Strip WatermelonDB internal columns from a record before pushing to Supabase.
 */
function stripWMColumns(record: SyncRecord): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!WM_INTERNAL_COLUMNS.has(key)) {
      clean[key] = value;
    }
  }
  return clean;
}

// ── SyncAdapter ─────────────────────────────────────────────────
export class SyncAdapter {
  private supabase: SupabaseClient;
  private userId: string;

  constructor(supabase: SupabaseClient, userId: string) {
    this.supabase = supabase;
    this.userId = userId;
  }

  /**
   * Pull remote changes that happened after lastSyncAt.
   * Returns records created/updated (without soft-delete since
   * no `deleted_at` columns exist in current schema).
   */
  async syncPull(lastSyncAt: number | null): Promise<SyncPullResult> {
    const allRecords: Array<Record<string, unknown>> = [];

    for (const table of SYNC_TABLES) {
      const query = this.supabase
        .from(table)
        .select('*')
        .eq('user_id', this.userId)
        .order('updated_at', { ascending: true });

      if (lastSyncAt !== null) {
        query.gt('updated_at', new Date(lastSyncAt).toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error(`[SyncAdapter] Pull error on ${table}:`, error.message);
        continue;
      }

      if (data && data.length > 0) {
        for (const row of data) {
          allRecords.push(row);
        }
      }
    }

    return {
      records: allRecords,
      deleted: [], // Soft-delete not supported in current schema
      timestamp: Date.now(),
    };
  }

  /**
   * Push local changes to Supabase.
   * Uses last-write-wins conflict resolution based on updated_at timestamps.
   * Strips WatermelonDB internal columns before sending.
   */
  async syncPush(localChanges: SyncRecord[]): Promise<SyncPushResult> {
    const grouped: Record<string, SyncRecord[]> = {};
    const failed: Array<{ id: string; error: string }> = [];

    for (const record of localChanges) {
      const tableName = this.resolveTableName(record);
      if (!tableName) {
        failed.push({ id: record.id, error: 'Unknown table for record' });
        continue;
      }
      if (!grouped[tableName]) grouped[tableName] = [];
      grouped[tableName].push(record);
    }

    let pushed = 0;

    for (const [tableName, records] of Object.entries(grouped)) {
      for (const record of records) {
        try {
          // Strip WatermelonDB internal columns — NEVER send to Supabase
          const payload = stripWMColumns(record);
          const updatedAt = payload.updated_at
            ? new Date(
                typeof payload.updated_at === 'number'
                  ? payload.updated_at
                  : String(payload.updated_at),
              ).toISOString()
            : new Date().toISOString();

          if (record._status === 'deleted') {
            // Hard delete on remote (no soft-delete in schema)
            const { error } = await this.supabase
              .from(tableName)
              .delete()
              .eq('id', record.id);

            if (error) throw error;
          } else if (record._status === 'created') {
            const { error } = await this.supabase
              .from(tableName)
              .insert(payload);

            if (error) {
              // If record exists (unique constraint violation), use last-write-wins
              if (error.code === '23505') {
                const { error: updateError } = await this.supabase
                  .from(tableName)
                  .update({ ...payload, updated_at: updatedAt })
                  .eq('id', record.id)
                  .lt('updated_at', updatedAt);

                if (updateError) throw updateError;
              } else {
                throw error;
              }
            }
          } else if (record._status === 'updated') {
            // Last-write-wins: only update if remote is older
            const { error } = await this.supabase
              .from(tableName)
              .update({ ...payload, updated_at: updatedAt })
              .eq('id', record.id)
              .lt('updated_at', updatedAt);

            if (error) throw error;
          }

          pushed++;
        } catch (err: any) {
          failed.push({
            id: record.id,
            error: err?.message ?? String(err),
          });
        }
      }
    }

    return { pushed, failed: failed.length, errors: failed };
  }

  /**
   * Perform a full bidirectional sync: push first, then pull.
   */
  async syncFull(
    lastSyncAt: number | null,
    localChanges: SyncRecord[],
  ): Promise<{
    pullResult: SyncPullResult;
    pushResult: SyncPushResult;
    newSyncTimestamp: number;
  }> {
    // Step 1: Push local changes first
    const pushResult = await this.syncPush(localChanges);

    // Step 2: Pull remote changes
    const pullResult = await this.syncPull(lastSyncAt);

    // Step 3: Return new sync timestamp
    const newSyncTimestamp = Date.now();

    return {
      pullResult,
      pushResult,
      newSyncTimestamp,
    };
  }

  private resolveTableName(record: SyncRecord): SyncTableName | null {
    // Heuristic: check for fields unique to each table
    if (record.nickname !== undefined || record.email !== undefined) return 'users';
    if (record.target_amount !== undefined && record.strategy !== undefined) return 'goals';
    if (record.xp_earned !== undefined || record.goal_id !== undefined) return 'transactions';
    if (record.quest_template_id !== undefined) return 'quests';
    if (record.achievement_id !== undefined) return 'achievements';
    if (record.current_streak !== undefined && record.freeze_count !== undefined) return 'streaks';
    return null;
  }
}

export default SyncAdapter;
