/**
 * SaveState — Supabase Client Singleton
 *
 * Creates and exports a single Supabase client instance configured
 * with the project URL and anon key from Expo public env vars.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Supabase features will be unavailable.',
  );
}

// ── Client Singleton ────────────────────────────────────────────
const client: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);

export default client;

// ── Re-exports ──────────────────────────────────────────────────
export type { Database };
export type { SupabaseClient };

// ── Auth Helpers ────────────────────────────────────────────────
export const authHelpers = {
  /** Get the currently authenticated user (if any). */
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error) throw error;
    return user;
  },

  /** Get the current session without fetching user details. */
  async getSession() {
    const {
      data: { session },
      error,
    } = await client.auth.getSession();
    if (error) throw error;
    return session;
  },

  /** Listen for auth state changes. */
  onAuthStateChange(callback: (event: string, session: typeof client.auth.session) => void) {
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      callback(event, session ?? null);
    });
    return subscription;
  },
};

// ── Convenience Table Accessors ─────────────────────────────────
export const tables = {
  get users() {
    return client.from('users');
  },
  get transactions() {
    return client.from('transactions');
  },
  get goals() {
    return client.from('goals');
  },
  get quests() {
    return client.from('quests');
  },
  get achievements() {
    return client.from('achievements');
  },
  get streaks() {
    return client.from('streaks');
  },
  get settings() {
    return client.from('settings');
  },
} as const;
