/**
 * SaveState Design System — Haptic Feedback Patterns
 *
 * Maps semantic haptic events to expo-haptics impact / notification styles.
 * Usage: import { triggerHaptic } from '@/constants/haptics';
 */

import * as Haptics from 'expo-haptics';

// ── Haptic Pattern Definition ──────────────────────────────────
export interface HapticPattern {
  /** expo-haptics impact style or notification type */
  method: 'impact' | 'notification' | 'selection';
  /** Impact style (for method: 'impact') */
  impactStyle?: Haptics.ImpactFeedbackStyle;
  /** Notification type (for method: 'notification') */
  notificationType?: Haptics.NotificationFeedbackType;
  /** Description */
  description: string;
  /** Whether this haptic can be disabled by user preference */
  userDisablable: boolean;
}

// ── All Haptic Patterns ────────────────────────────────────────
export const hapticPatterns = {
  /** Standard button / tap feedback */
  buttonPress: {
    method: 'impact',
    impactStyle: Haptics.ImpactFeedbackStyle.Light,
    description: 'Light tap for any button press',
    userDisablable: true,
  } satisfies HapticPattern,

  /** Confirm a deposit action */
  depositConfirm: {
    method: 'notification',
    notificationType: Haptics.NotificationFeedbackType.Success,
    description: 'Success vibration on deposit confirmation',
    userDisablable: true,
  } satisfies HapticPattern,

  /** Warn before withdrawal */
  withdrawalWarn: {
    method: 'notification',
    notificationType: Haptics.NotificationFeedbackType.Warning,
    description: 'Warning vibration before withdrawal',
    userDisablable: true,
  } satisfies HapticPattern,

  /** Achievement unlocked! */
  achievementUnlock: {
    method: 'impact',
    impactStyle: Haptics.ImpactFeedbackStyle.Heavy,
    description: 'Heavy impact for achievement unlock',
    userDisablable: true,
  } satisfies HapticPattern,

  /** Level up celebration */
  levelUp: {
    method: 'impact',
    impactStyle: Haptics.ImpactFeedbackStyle.Heavy,
    description: 'Heavy impact for level up',
    userDisablable: true,
  } satisfies HapticPattern,

  /** Quest completed */
  questComplete: {
    method: 'notification',
    notificationType: Haptics.NotificationFeedbackType.Success,
    description: 'Success feedback on quest completion',
    userDisablable: false,
  } satisfies HapticPattern,

  /** Streak on fire! */
  streakFire: {
    method: 'impact',
    impactStyle: Haptics.ImpactFeedbackStyle.Medium,
    description: 'Medium impact when streak milestones are hit',
    userDisablable: false,
  } satisfies HapticPattern,

  /** Error / invalid action */
  error: {
    method: 'notification',
    notificationType: Haptics.NotificationFeedbackType.Error,
    description: 'Error vibration for invalid actions',
    userDisablable: false,
  } satisfies HapticPattern,

  /** Tab / bottom nav switch */
  tabSwitch: {
    method: 'selection',
    description: 'Selection click for tab navigation',
    userDisablable: true,
  } satisfies HapticPattern,

  /** Coin spinning animation trigger */
  coinSpin: {
    method: 'impact',
    impactStyle: Haptics.ImpactFeedbackStyle.Medium,
    description: 'Medium impact for coin spin / reward animation',
    userDisablable: true,
  } satisfies HapticPattern,
} as const;

export type HapticPatternKey = keyof typeof hapticPatterns;

// ── Trigger Function ───────────────────────────────────────────
/**
 * Triggers a haptic pattern by name.
 * Safe to call on platforms without haptics (e.g. Android web).
 */
export function triggerHaptic(patternKey: HapticPatternKey): void {
  const pattern = hapticPatterns[patternKey];

  // Only check user preference if this pattern is user-disablable
  if (pattern.userDisablable) {
    try {
      const { useSettingsStore } = require('@/stores/useSettingsStore');
      const { hapticEnabled } = useSettingsStore.getState();
      if (!hapticEnabled) return;
    } catch {
      // Settings store not yet available, allow haptic
    }
  }

  try {
    switch (pattern.method) {
      case 'impact':
        Haptics.impactAsync(pattern.impactStyle ?? Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'notification':
        Haptics.notificationAsync(
          pattern.notificationType ?? Haptics.NotificationFeedbackType.Success,
        );
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
    }
  } catch {
    // Silently fail on platforms without haptic support (web, emulators)
  }
}

/**
 * Triggers a custom haptic with raw impact style.
 * Respects user haptic preference.
 */
export function triggerImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
): void {
  try {
    const { useSettingsStore } = require('@/stores/useSettingsStore');
    if (!useSettingsStore.getState().hapticEnabled) return;
  } catch { /* allow */ }
  Haptics.impactAsync(style);
}

/**
 * Triggers a custom haptic with raw notification type.
 * Respects user haptic preference.
 */
export function triggerNotification(
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success,
): void {
  try {
    const { useSettingsStore } = require('@/stores/useSettingsStore');
    if (!useSettingsStore.getState().hapticEnabled) return;
  } catch { /* allow */ }
  Haptics.notificationAsync(type);
}

/**
 * Triggers a sequence of haptics with delays (for multi-step feedback).
 * e.g., achievement unlock + coin spin.
 */
export async function triggerHapticSequence(
  patterns: Array<{ key: HapticPatternKey; delayMs?: number }>,
): Promise<void> {
  for (const { key, delayMs = 0 } of patterns) {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    triggerHaptic(key);
  }
}
