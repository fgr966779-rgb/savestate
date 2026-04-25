/**
 * SaveState — Analytics Service
 *
 * Integrates PostHog for product analytics and Sentry for error tracking.
 * Includes onboarding funnel tracking and a privacy toggle.
 */

import * as SecureStore from 'expo-secure-store';
import { Setting } from '@/db';

// ── Constants ───────────────────────────────────────────────────
const ANALYTICS_ENABLED_KEY = 'SaveState_analytics_enabled';
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com';

// ── Lazy-loaded SDK references ──────────────────────────────────
let posthogInstance: any = null;
let sentryInitialized = false;

// ── Init ────────────────────────────────────────────────────────
export async function initAnalytics(): Promise<void> {
  try {
    const enabled = await isAnalyticsEnabled();
    if (!enabled) return;

    // PostHog
    if (POSTHOG_KEY) {
      try {
        const PostHog = require('posthog-react-native');
        posthogInstance = PostHog.default;
        await posthogInstance.setup(POSTHOG_KEY, {
          host: POSTHOG_HOST,
          captureApplicationLifecycleEvents: true,
        });
        console.log('[Analytics] PostHog initialized.');
      } catch {
        console.warn('[Analytics] PostHog SDK not available.');
      }
    }

    // Sentry
    if (SENTRY_DSN) {
      try {
        const Sentry = require('@sentry/react-native');
        Sentry.init({
          dsn: SENTRY_DSN,
          tracesSampleRate: 0.2,
          environment: __DEV__ ? 'development' : 'production',
        });
        sentryInitialized = true;
        console.log('[Analytics] Sentry initialized.');
      } catch {
        console.warn('[Analytics] Sentry SDK not available.');
      }
    }
  } catch (error) {
    console.error('[Analytics] Initialization failed:', error);
  }
}

// ── Track Event ─────────────────────────────────────────────────
export async function trackEvent(
  event: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  try {
    if (!(await isAnalyticsEnabled())) return;
    posthogInstance?.capture(event, properties);
  } catch (error) {
    console.error('[Analytics] trackEvent failed:', error);
  }
}

// ── Screen View ─────────────────────────────────────────────────
export async function trackScreen(screenName: string): Promise<void> {
  try {
    if (!(await isAnalyticsEnabled())) return;
    posthogInstance?.screen(screenName);
    posthogInstance?.capture('screen_view', { screen_name: screenName });
  } catch (error) {
    console.error('[Analytics] trackScreen failed:', error);
  }
}

// ── Identify User ───────────────────────────────────────────────
export async function identifyUser(
  userId: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  try {
    if (!(await isAnalyticsEnabled())) return;
    posthogInstance?.identify(userId, properties);

    if (sentryInitialized) {
      const Sentry = require('@sentry/react-native');
      Sentry.setUser({ id: userId, ...properties });
    }
  } catch (error) {
    console.error('[Analytics] identifyUser failed:', error);
  }
}

// ── Capture Exception ───────────────────────────────────────────
export async function captureException(
  error: Error | unknown,
  context: Record<string, unknown> = {},
): Promise<void> {
  try {
    if (sentryInitialized) {
      const Sentry = require('@sentry/react-native');
      Sentry.captureException(error, { extra: context });
    }
    console.error('[Analytics] Exception captured:', error);
  } catch (err) {
    console.error('[Analytics] captureException failed:', err);
  }
}

// ── Set User Property ───────────────────────────────────────────
export async function setUserProperty(key: string, value: unknown): Promise<void> {
  try {
    if (!(await isAnalyticsEnabled())) return;
    posthogInstance?.capture('$set', { $properties: { [key]: value } });
  } catch (error) {
    console.error('[Analytics] setUserProperty failed:', error);
  }
}

// ── Onboarding Funnel ───────────────────────────────────────────
export async function trackOnboardingStep(step: string, extra: Record<string, unknown> = {}): Promise<void> {
  try {
    await trackEvent('onboarding_step', { step, ...extra });
  } catch (error) {
    console.error('[Analytics] onboarding funnel tracking failed:', error);
  }
}

// ── Privacy Toggle ──────────────────────────────────────────────
export async function setEnabled(enabled: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(ANALYTICS_ENABLED_KEY, enabled ? '1' : '0');
    if (!enabled && posthogInstance) {
      posthogInstance.reset();
    }
  } catch (error) {
    console.error('[Analytics] setEnabled failed:', error);
  }
}

async function isAnalyticsEnabled(): Promise<boolean> {
  try {
    const raw = await SecureStore.getItemAsync(ANALYTICS_ENABLED_KEY);
    // Default to enabled if never set
    return raw === null ? true : raw === '1';
  } catch {
    return false;
  }
}
