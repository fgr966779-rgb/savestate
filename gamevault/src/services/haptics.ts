/**
 * SaveState — Haptic Feedback Service
 *
 * High-level haptic methods mapped to game events.
 * All methods respect the system Reduce Motion accessibility setting —
 * if the user has reduced motion enabled, haptics are silently skipped.
 */

import { AccessibilityInfo, Platform } from 'react-native';
import {
  triggerHaptic,
  triggerImpact,
  triggerNotification,
  hapticPatterns,
} from '@/constants/haptics';
import type { HapticPatternKey } from '@/constants/haptics';

// ── Re-exports ──────────────────────────────────────────────────
export { triggerHaptic, triggerImpact, triggerNotification, hapticPatterns };
export type { HapticPatternKey };

// ── Reduce Motion Cache ─────────────────────────────────────────
let _reduceMotionEnabled: boolean | null = null;

async function shouldPlayHaptic(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (_reduceMotionEnabled === null) {
    _reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
    AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      _reduceMotionEnabled = enabled;
    });
  }

  return !_reduceMotionEnabled;
}

// ── Semantic Haptic Methods ─────────────────────────────────────

/** Light impact — standard button / tap feedback */
export async function playButtonPress(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerHaptic('buttonPress');
  }
}

/** Success notification — deposit confirmed */
export async function playDepositConfirm(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerHaptic('depositConfirm');
  }
}

/** Warning notification — before withdrawal */
export async function playWithdrawalWarn(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerHaptic('withdrawalWarn');
  }
}

/** Heavy impact — achievement unlocked */
export async function playAchievementUnlock(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerHaptic('achievementUnlock');
  }
}

/** Heavy impact — level up celebration */
export async function playLevelUp(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerHaptic('levelUp');
  }
}

/** Success notification — quest completed */
export async function playQuestComplete(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerHaptic('questComplete');
  }
}

/** Rigid impact — streak fire milestone */
export async function playStreakFire(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerImpact('heavy');
  }
}

/** Error notification — invalid action */
export async function playError(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerHaptic('error');
  }
}

/** Selection click — tab / bottom nav switch */
export async function playTabSwitch(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerHaptic('tabSwitch');
  }
}

/** Soft impact — coin spinning animation trigger */
export async function playCoinSpin(): Promise<void> {
  if (await shouldPlayHaptic()) {
    triggerHaptic('coinSpin');
  }
}
