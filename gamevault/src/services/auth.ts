/**
 * SaveState — Authentication Service
 *
 * Handles registration, login (email + Google OAuth), logout,
 * password reset, and profile updates. All JWT tokens are stored
 * in expo-secure-store for maximum security.
 */

import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import client from './supabase';
import type { UserRow } from './types';

// ── Constants ───────────────────────────────────────────────────
const SESSION_KEY = 'SaveState_auth_session';
const REFRESH_KEY = 'SaveState_refresh_token';

WebBrowser.maybeCompleteAuthSession();

// ── Register ────────────────────────────────────────────────────
export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<UserRow> {
  try {
    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) throw new Error('Registration succeeded but user ID is missing.');

    const { data: profile, error: profileError } = await client
      .from('users')
      .insert({
        id: userId,
        email,
        nickname: displayName ?? email.split('@')[0],
        level: 1,
        total_xp: 0,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    await storeSession(authData.session);
    return profile;
  } catch (error) {
    console.error('[Auth] Registration failed:', error);
    throw error;
  }
}

// ── Login ───────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<UserRow> {
  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session) throw new Error('No session returned from sign-in.');

    await storeSession(data.session);

    const { data: profile, error: profileError } = await client
      .from('users')
      .select()
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;
    return profile;
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    throw error;
  }
}

// ── Google OAuth ────────────────────────────────────────────────
export async function loginWithGoogle(): Promise<UserRow> {
  try {
    const redirectUri = makeRedirectUri({ scheme: 'SaveState' });

    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;

    const authResult = await WebBrowser.openAuthSessionAsync(
      data.url ?? '',
      redirectUri,
    );

    if (authResult.type !== 'success') {
      throw new Error('Google sign-in was cancelled.');
    }

    const url = new URL(authResult.url);
    const hashParams = new URLSearchParams(url.hash.slice(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken) throw new Error('No access token in OAuth callback.');

    const { data: sessionData, error: sessionError } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken ?? '',
    });
    if (sessionError) throw sessionError;

    await storeSession(sessionData.session);

    const { data: profile, error: profileError } = await client
      .from('users')
      .select()
      .eq('id', sessionData.user.id)
      .single();

    if (profileError) throw profileError;
    return profile;
  } catch (error) {
    console.error('[Auth] Google login failed:', error);
    throw error;
  }
}

// ── Logout ──────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await client.auth.signOut();
    await SecureStore.deleteItemAsync(SESSION_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch (error) {
    console.error('[Auth] Logout failed:', error);
    throw error;
  }
}

// ── Get Session ─────────────────────────────────────────────────
export async function getSession(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_KEY);
  } catch (error) {
    console.error('[Auth] Failed to read session:', error);
    return null;
  }
}

// ── Refresh Token ───────────────────────────────────────────────
export async function refreshToken(): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!stored) return null;

    const { data, error } = await client.auth.refreshSession({ refresh_token: stored });
    if (error) throw error;

    await storeSession(data.session);
    return data.session.access_token;
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error);
    return null;
  }
}

// ── Reset Password ──────────────────────────────────────────────
export async function resetPassword(email: string): Promise<void> {
  try {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: 'SaveState://reset-password',
    });
    if (error) throw error;
  } catch (error) {
    console.error('[Auth] Password reset failed:', error);
    throw error;
  }
}

// ── Update Profile ──────────────────────────────────────────────
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<UserRow, 'nickname' | 'avatar_id' | 'avatar_color'>>,
): Promise<UserRow> {
  try {
    const { data, error } = await client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Auth] Profile update failed:', error);
    throw error;
  }
}

// ── Session Storage Helpers ─────────────────────────────────────
async function storeSession(session: any): Promise<void> {
  if (!session) return;
  await SecureStore.setItemAsync(SESSION_KEY, session.access_token);
  if (session.refresh_token) {
    await SecureStore.setItemAsync(REFRESH_KEY, session.refresh_token);
  }
}
