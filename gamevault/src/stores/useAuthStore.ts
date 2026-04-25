import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import * as SecureStore from 'expo-secure-store';
import { database } from '@/db';
import type User from '@/db/models/User';

// ── Keys ───────────────────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'gv_access_token';
const REFRESH_TOKEN_KEY = 'gv_refresh_token';

// ── Types ──────────────────────────────────────────────────────
interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatarId: string | null;
  avatarColor: string | null;
  level: number;
  totalXp: number;
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

interface ProfileUpdates {
  nickname?: string;
  avatarId?: string | null;
  avatarColor?: string | null;
}

interface AuthState {
  user: UserProfile | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => void;
  resetError: () => void;
}

// ── Helpers ────────────────────────────────────────────────────
function getSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

async function saveTokens(a: string, r: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, a);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, r);
}

async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

async function getStoredTokens(): Promise<AuthSession | null> {
  const a = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const r = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  return a && r ? { accessToken: a, refreshToken: r } : null;
}

async function syncLocalUser(
  userId: string,
  email: string,
  nickname: string,
): Promise<UserProfile> {
  const col = database.get<User>('users');
  const { Q } = require('@nozbe/watermelondb');

  try {
    await col.query().where(Q.where('id', userId)).fetchOne();
  } catch {
    await database.write(async () => {
      await col.create((u) => {
        u._raw = {
          id: userId, email, nickname, avatar_id: null, avatar_color: null,
          level: 1, total_xp: 0, created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(), synced_at: Date.now(),
        };
      });
    });
  }

  const local = await col.find(userId);
  return {
    id: local.id, email: local.email, nickname: local.nickname,
    avatarId: local.avatarId, avatarColor: local.avatarColor,
    level: local.level, totalXp: local.totalXp,
  };
}

function applyAuthResult(
  set: (fn: (s: AuthState) => void) => void,
  accessToken: string,
  refreshToken: string,
  userId: string,
  email: string,
  displayName: string,
) {
  saveTokens(accessToken, refreshToken);
  return syncLocalUser(userId, email, displayName).then((profile) => {
    set((s) => {
      s.user = profile;
      s.session = { accessToken, refreshToken };
      s.isAuthenticated = true;
      s.isLoading = false;
    });
  });
}

// ── Store ──────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    biometricEnabled: false,

    signIn: async (email, password) => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const { data, error } = await getSupabase()
          .auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        await applyAuthResult(
          set, data.session.access_token, data.session.refresh_token,
          data.user.id, data.user.email ?? email,
          data.user.user_metadata?.nickname ?? email.split('@')[0],
        );
      } catch (err) {
        set((s) => {
          s.error = err instanceof Error ? err.message : 'Sign in failed';
          s.isLoading = false;
        });
      }
    },

    signInWithGoogle: async () => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const { data, error } = await getSupabase().auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: 'SaveState://auth/callback' },
        });
        if (error) throw new Error(error.message);
        if (data.session?.user) {
          await applyAuthResult(
            set, data.session.access_token, data.session.refresh_token,
            data.user.id, data.user.email ?? '',
            data.user.user_metadata?.full_name ?? '',
          );
        } else {
          set((s) => { s.isLoading = false; });
        }
      } catch (err) {
        set((s) => {
          s.error = err instanceof Error ? err.message : 'Google sign in failed';
          s.isLoading = false;
        });
      }
    },

    signUp: async (email, password, nickname) => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const { data, error } = await getSupabase().auth.signUp({
          email, password, options: { data: { nickname } },
        });
        if (error) throw new Error(error.message);
        if (data.session?.user) {
          await applyAuthResult(
            set, data.session.access_token, data.session.refresh_token,
            data.user.id, email, nickname,
          );
        } else {
          set((s) => { s.isLoading = false; });
        }
      } catch (err) {
        set((s) => {
          s.error = err instanceof Error ? err.message : 'Sign up failed';
          s.isLoading = false;
        });
      }
    },

    signOut: async () => {
      set((s) => { s.isLoading = true; });
      try {
        // Invalidate server-side session first
        await getSupabase().auth.signOut();
      } catch {
        // Continue with local cleanup even if server call fails (offline scenario)
      }
      await clearTokens();
      set((s) => {
        s.user = null; s.session = null; s.isAuthenticated = false;
        s.error = null; s.isLoading = false;
      });
    },

    updateProfile: async (updates) => {
      const { user } = useAuthStore.getState();
      if (!user) return;
      try {
        const col = database.get<User>('users');
        const local = await col.find(user.id);
        await database.write(async () => {
          await local.update((u) => {
            if (updates.nickname !== undefined) u.nickname = updates.nickname;
            if (updates.avatarId !== undefined) u.avatarId = updates.avatarId;
            if (updates.avatarColor !== undefined) u.avatarColor = updates.avatarColor;
          });
        });
        set((s) => {
          if (!s.user) return;
          if (updates.nickname !== undefined) s.user.nickname = updates.nickname;
          if (updates.avatarId !== undefined) s.user.avatarId = updates.avatarId;
          if (updates.avatarColor !== undefined) s.user.avatarColor = updates.avatarColor;
        });
      } catch (err) {
        set((s) => {
          s.error = err instanceof Error ? err.message : 'Profile update failed';
        });
      }
    },

    setBiometricEnabled: (enabled) => {
      set((s) => { s.biometricEnabled = enabled; });
    },

    resetError: () => {
      set((s) => { s.error = null; });
    },
  })),
);

// ── Hydration ──────────────────────────────────────────────────
export async function hydrateAuth() {
  const stored = await getStoredTokens();
  if (!stored) return;
  const supa = getSupabase();
  supa.auth.setSession(stored);
  const { data: { user } } = await supa.auth.getUser();
  if (!user) { await clearTokens(); return; }
  const profile = await syncLocalUser(user.id, user.email ?? '', user.user_metadata?.nickname ?? '');
  useAuthStore.setState({ user: profile, session: stored, isAuthenticated: true });
}
