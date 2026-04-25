/**
 * SaveState — useNotifications Hook
 *
 * Notification scheduling and management using expo-notifications.
 * Handles permissions, scheduling, cancellation, and push tokens.
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// ── Notification trigger type ───────────────────────────────────
interface NotificationTrigger {
  type: 'seconds' | 'date';
  value: number | Date;
}

// ── Hook return type ────────────────────────────────────────────
interface UseNotificationsReturn {
  /** Request notification permission from user */
  requestPermission: () => Promise<boolean>;
  /** Schedule a local notification */
  scheduleNotification: (
    title: string,
    body: string,
    trigger: NotificationTrigger,
    data?: Record<string, unknown>,
  ) => Promise<string>;
  /** Cancel a scheduled notification by ID */
  cancelNotification: (id: string) => Promise<void>;
  /** Cancel all scheduled notifications */
  cancelAllNotifications: () => Promise<void>;
  /** Expo push token (null if not available) */
  expoPushToken: string | null;
  /** Whether notifications are permitted */
  isGranted: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isGranted, setIsGranted] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;

    async function setupNotifications() {
      try {
        const Notifications = require('expo-notifications');

        // Configure notification behavior
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        // Register for push token
        const tokenResult = await Notifications.getExpoPushTokenAsync();
        if (!cancelled) {
          setExpoPushToken(tokenResult.data);
        }
      } catch {
        // expo-notifications not installed or unavailable
      }
    }

    setupNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    try {
      const Notifications = require('expo-notifications');
      const result = await Notifications.requestPermissionsAsync();
      const granted =
        result.status === 'granted' ||
        result.ios?.status === Notifications.IOSAuthorizationStatus.GRANTED;

      setIsGranted(granted);
      return granted;
    } catch {
      return false;
    }
  }, []);

  const scheduleNotification = useCallback(
    async (
      title: string,
      body: string,
      trigger: NotificationTrigger,
      data?: Record<string, unknown>,
    ): Promise<string> => {
      if (Platform.OS === 'web') return '';

      try {
        const Notifications = require('expo-notifications');

        let notificationTrigger: any = null;

        if (trigger.type === 'seconds') {
          notificationTrigger = { seconds: trigger.value as number };
        } else if (trigger.type === 'date') {
          const targetDate = trigger.value as Date;
          notificationTrigger = new Date(targetDate);
        }

        const scheduled = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            badge: 1,
            data: data ?? {},
          },
          trigger: notificationTrigger,
        });

        return scheduled;
      } catch {
        return '';
      }
    },
    [],
  );

  const cancelNotification = useCallback(async (id: string): Promise<void> => {
    if (Platform.OS === 'web') return;

    try {
      const Notifications = require('expo-notifications');
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // ignore
    }
  }, []);

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'web') return;

    try {
      const Notifications = require('expo-notifications');
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // ignore
    }
  }, []);

  return {
    requestPermission,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    expoPushToken,
    isGranted,
  };
}
