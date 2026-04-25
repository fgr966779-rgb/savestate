/**
 * SaveState — Push & Local Notifications Service
 *
 * Manages Android notification channels, iOS permissions,
 * local scheduling, streak/quest reminders, and push token registration.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import client from './supabase';
import { getSession } from './auth';

// ── Android Channel IDs ─────────────────────────────────────────
export const CHANNEL_IDS = {
  QUESTS: 'SaveState_quests',
  ACHIEVEMENTS: 'SaveState_achievements',
  REMINDERS: 'SaveState_reminders',
  SOCIAL: 'SaveState_social',
} as const;

// ── Action Buttons ──────────────────────────────────────────────
const ACTION_DEPOSIT = 'deposit_more';
const ACTION_OPEN_QUEST = 'open_quest';
const ACTION_DISMISS = 'dismiss';

const defaultCategory = 'QUEST_ACTION';
Notifications.setNotificationCategoryAsync(defaultCategory, [
  {
    identifier: ACTION_DEPOSIT,
    buttonTitle: 'Покласти ще',
    options: { opensAppToForeground: true },
  },
  {
    identifier: ACTION_OPEN_QUEST,
    buttonTitle: 'Відкрити квест',
    options: { opensAppToForeground: true },
  },
  {
    identifier: ACTION_DISMISS,
    buttonTitle: 'Ігнорувати',
    options: { opensAppToForeground: false },
  },
]);

// ── Request Permissions ─────────────────────────────────────────
export async function requestPermissions(): Promise<boolean> {
  try {
    if (!Device.isDevice) {
      console.warn('[Notifications] Not a physical device — notifications disabled.');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_IDS.QUESTS, {
        name: 'Quests',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C5CE7',
      });

      await Notifications.setNotificationChannelAsync(CHANNEL_IDS.ACHIEVEMENTS, {
        name: 'Achievements',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100, 50, 100],
        lightColor: '#FDCB6E',
      });

      await Notifications.setNotificationChannelAsync(CHANNEL_IDS.REMINDERS, {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#00B894',
      });

      await Notifications.setNotificationChannelAsync(CHANNEL_IDS.SOCIAL, {
        name: 'Social',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 150],
        lightColor: '#0984E3',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error);
    return false;
  }
}

// ── Schedule Local Notification ─────────────────────────────────
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: Record<string, unknown> = {},
  trigger: Notifications.NotificationTriggerInput | null = null,
  channelId?: string,
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        categoryIdentifier: defaultCategory,
      },
      trigger,
      ...(Platform.OS === 'android' && channelId
        ? { channelId }
        : {}),
    } as Notifications.NotificationRequestInput);

    return notificationId;
  } catch (error) {
    console.error('[Notifications] Schedule failed:', error);
    throw error;
  }
}

// ── Streak Reminder ─────────────────────────────────────────────
export async function scheduleStreakReminder(
  hoursBeforeDeadline: number = 4,
): Promise<string> {
  const triggerDate = new Date();
  triggerDate.setHours(triggerDate.getHours() + hoursBeforeDeadline);

  return scheduleLocalNotification(
    '🔥 Не втрать свій streak!',
    `Залишилось ${hoursBeforeDeadline} год. Зроби депозит, щоб зберегти серію!`,
    { type: 'streak_reminder' },
    { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate } as Notifications.NotificationTriggerInput,
    CHANNEL_IDS.REMINDERS,
  );
}

// ── Quest Reminder ──────────────────────────────────────────────
export async function scheduleQuestReminder(
  questId: string,
  title: string,
): Promise<string> {
  const triggerDate = new Date();
  triggerDate.setHours(triggerDate.getHours() + 2);

  return scheduleLocalNotification(
    '⚡ Щоденний квест чекає!',
    title,
    { type: 'quest_reminder', questId },
    { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate } as Notifications.NotificationTriggerInput,
    CHANNEL_IDS.QUESTS,
  );
}

// ── Cancel Notifications ────────────────────────────────────────
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('[Notifications] Cancel failed:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notifications] Cancel all failed:', error);
  }
}

// ── Notification Handler ────────────────────────────────────────
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as Record<string, unknown>;
    const actionId = response.actionIdentifier;

    if (actionId === ACTION_DISMISS) return;

    // Route to appropriate screen based on notification type
    const notificationType = data.type as string | undefined;
    switch (notificationType) {
      case 'streak_reminder':
        console.log('[Notifications] Navigate → Streak screen');
        break;
      case 'quest_reminder':
        console.log(`[Notifications] Navigate → Quest ${data.questId}`);
        break;
      case 'achievement':
        console.log('[Notifications] Navigate → Achievements screen');
        break;
      default:
        console.log('[Notifications] Navigate → Home');
        break;
    }
  });
}

// ── Push Token Registration ─────────────────────────────────────
export async function registerPushToken(): Promise<void> {
  try {
    if (!Device.isDevice) return;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    const session = await getSession();
    if (!session) {
      console.warn('[Notifications] No active session — skipping push registration.');
      return;
    }

    // Decode JWT to get user ID (payload is base64)
    const payload = JSON.parse(atob(session.split('.')[1]));
    const userId = payload.sub;
    if (!userId) return;

    await client.from('settings').upsert(
      {
        user_id: userId,
        key: 'push_token',
        value: token,
      },
      { onConflict: 'user_id,key' },
    );

    console.log('[Notifications] Push token registered.');
  } catch (error) {
    console.error('[Notifications] Push token registration failed:', error);
  }
}
