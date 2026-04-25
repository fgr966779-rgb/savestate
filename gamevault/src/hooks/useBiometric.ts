/**
 * SaveState — useBiometric Hook
 *
 * Biometric authentication hook wrapping expo-local-authentication.
 * Provides availability check, enrollment status, and authenticate method.
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// ── Hook return type ────────────────────────────────────────────
interface UseBiometricReturn {
  /** Whether device hardware supports biometrics */
  isAvailable: boolean;
  /** Whether user has enrolled biometric data */
  isEnrolled: boolean;
  /** Supported biometric type name */
  biometricType: string;
  /** Prompt user for biometric authentication */
  authenticate: (promptMessage?: string) => Promise<boolean>;
}

// ── Hook implementation ─────────────────────────────────────────
export function useBiometric(): UseBiometricReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsAvailable(false);
      return;
    }

    let cancelled = false;

    async function checkBiometrics() {
      try {
        const LocalAuthentication = require('expo-local-authentication');

        const [hasHardware, hasEnrolled, supportedTypes] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
          LocalAuthentication.supportedAuthenticationTypesAsync().catch(() => []),
        ]);

        if (cancelled) return;

        setIsAvailable(hasHardware);
        setIsEnrolled(hasEnrolled);

        // Determine human-readable biometric type
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
        } else {
          setBiometricType('Biometric');
        }
      } catch {
        if (!cancelled) {
          setIsAvailable(false);
          setIsEnrolled(false);
        }
      }
    }

    checkBiometrics();

    return () => {
      cancelled = true;
    };
  }, []);

  const authenticate = useCallback(
    async (promptMessage = 'Підтвердьте особу для продовження'): Promise<boolean> => {
      if (!isAvailable || !isEnrolled) return false;

      try {
        const LocalAuthentication = require('expo-local-authentication');
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          fallbackLabel: 'Використати пароль',
          cancelLabel: 'Скасувати',
          disableDeviceFallback: false,
        });
        return result.success;
      } catch {
        return false;
      }
    },
    [isAvailable, isEnrolled],
  );

  return {
    isAvailable,
    isEnrolled,
    biometricType,
    authenticate,
  };
}
