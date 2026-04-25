/**
 * SaveState — Platform Utilities
 *
 * Platform detection and device capability helpers.
 * Thin wrappers around React Native Platform, expo-local-authentication,
 * and StatusBar / Constants for safe area insets.
 */

import { Platform, Dimensions, StatusBar } from 'react-native';

// ── Platform Detection ──────────────────────────────────────────
export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

export function isWeb(): boolean {
  return Platform.OS === 'web';
}

// ── Device Type ─────────────────────────────────────────────────
export function getDeviceType(): 'phone' | 'tablet' {
  const { width, height } = Dimensions.get('window');
  const diagonal = Math.sqrt(width * width + height * height);
  // Tablets typically have a diagonal > 600dp
  return diagonal >= 600 ? 'tablet' : 'phone';
}

// ── Biometric Availability ──────────────────────────────────────
export async function hasBiometric(): Promise<boolean> {
  if (isWeb()) return false;

  try {
    const LocalAuthentication = require('expo-local-authentication');
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  } catch {
    return false;
  }
}

// ── Status Bar Height ───────────────────────────────────────────
export function getStatusBarHeight(): number {
  if (isWeb()) return 0;
  return StatusBar.currentHeight ?? (isIOS() ? 44 : 24);
}

// ── Bottom Safe Area ────────────────────────────────────────────
export function getBottomSafeArea(): number {
  if (isWeb()) return 0;

  try {
    const Constants = require('expo-constants');
    const constants = Constants.default ?? Constants;
    return constants?.statusBarHeight ?? 0;
  } catch {
    return isIOS() ? 34 : 0;
  }
}
