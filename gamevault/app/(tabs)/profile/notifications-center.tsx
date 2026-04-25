/**
 * Screen 34 — Notifications Center
 *
 * Full notification feed grouped by date: "Сьогодні", "Вчора", "Тиждень тому".
 * Dynamic data source from savings store (recent transactions as notifications).
 * Supports read/unread states, mark-all-read, swipe-to-dismiss with confirm.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { useTheme, createStyles, triggerHaptic, stagger } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLocalized } from '@/hooks/useLocalized';
import { useSavingsStore } from '@/stores/useSavingsStore';

// ── Types ──────────────────────────────────────────────────────────

type NotificationType =
  | 'deposit'
  | 'withdrawal'
  | 'achievement'
  | 'streak'
  | 'xp'
  | 'system';

interface AppNotification {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  group: 'today' | 'yesterday' | 'week';
}

interface NotificationGroup {
  id: string;
  label: string;
  data: AppNotification[];
}

// ── Notification config ────────────────────────────────────────────

type NotifMetaKey = 'deposit' | 'withdrawal' | 'achievement' | 'streak' | 'xp' | 'system';

// ── Helpers ────────────────────────────────────────────────────────

function getTimeGroup(date: Date): 'today' | 'yesterday' | 'week' {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (txDate.getTime() >= today.getTime()) return 'today';
  if (txDate.getTime() >= yesterday.getTime()) return 'yesterday';
  return 'week';
}

function formatRelativeTime(date: Date, t: (key: string, params?: Record<string, string | number>) => string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t('profile.notifications.justNow');
  if (diffMin < 60) return t('profile.notifications.minutesAgo', { count: diffMin });
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return t('profile.notifications.hoursAgo', { count: diffHours });
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return t('common.yesterday');
  return t('profile.notifications.daysAgo', { count: diffDays });
}

function getNotificationMeta(type: NotifMetaKey, t: (key: string) => string): { icon: string; label: string } {
  const metaMap: Record<NotifMetaKey, { icon: string; labelKey: string }> = {
    deposit: { icon: '🪙', labelKey: 'profile.notifications.metaDeposit' },
    withdrawal: { icon: '💸', labelKey: 'profile.notifications.metaWithdrawal' },
    achievement: { icon: '🏆', labelKey: 'profile.notifications.metaAchievement' },
    streak: { icon: '🔥', labelKey: 'profile.notifications.metaStreak' },
    xp: { icon: '⭐', labelKey: 'profile.notifications.metaXp' },
    system: { icon: '🔔', labelKey: 'profile.notifications.metaSystem' },
  };
  const m = metaMap[type];
  return { icon: m.icon, label: t(m.labelKey) };
}

function transactionsToNotifications(
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    goalId: string;
    xpEarned: number;
    createdAt: Date;
  }>,
  t: (key: string, params?: Record<string, string | number>) => string,
): AppNotification[] {
  return transactions.map((tx) => {
    const txType = tx.type === 'deposit' ? 'deposit' as NotificationType :
                   tx.type === 'withdrawal' ? 'withdrawal' as NotificationType : 'deposit';
    const date = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);

    return {
      id: tx.id,
      type: txType,
      icon: txType === 'deposit' ? '🪙' : '💸',
      title: txType === 'deposit' ? t('profile.notifications.depositConfirmed') : t('profile.notifications.withdrawalConfirmed'),
      description: t('profile.notifications.transactionDesc', {
        type: txType === 'deposit' ? t('profile.notifications.metaDeposit') : t('profile.notifications.metaWithdrawal'),
        amount: tx.amount,
        xp: tx.xpEarned,
      }),
      time: formatRelativeTime(date, t),
      read: true,
      group: getTimeGroup(date),
    };
  });
}

// ── Component ──────────────────────────────────────────────────────

export default function NotificationCenterScreen() {
  const theme = useTheme();
  const styles = useNotificationCenterStyles(theme);
  const { t } = useLocalized();
  const { transactions, loadTransactions } = useSavingsStore();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  // Load transactions from store on mount
  useEffect(() => {
    loadTransactions(undefined, 50, 0);
  }, [loadTransactions]);

  // Convert transactions to notifications when they change
  useEffect(() => {
    const notifs = transactionsToNotifications(transactions, t);
    // Load scheduled notification count
    Notifications.getAllScheduledNotificationsAsync()
      .then((scheduled) => {
        const scheduledNotifs: AppNotification[] = scheduled.slice(0, 10).map((sn, i) => ({
          id: `scheduled-${i}`,
          type: 'system' as NotificationType,
          icon: '🔔',
          title: sn.content.title ?? t('profile.notifications.scheduled'),
          description: sn.content.body ?? '',
          time: sn.trigger
            ? (typeof sn.trigger === 'object' && 'date' in sn.trigger && sn.trigger.date
              ? formatRelativeTime(new Date(sn.trigger.date as number), t)
              : t('profile.notifications.scheduled'))
            : t('profile.notifications.scheduled'),
          read: false,
          group: 'today' as const,
        }));
        setScheduledCount(scheduledNotifs.length);
        setNotifications([...scheduledNotifs, ...notifs]);
      })
      .catch(() => {
        setNotifications(notifs);
      });
  }, [transactions, t]);

  // ── Computed ─────────────────────────────────────────────────────
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const grouped = useMemo<NotificationGroup[]>(() => {
    const groups: NotificationGroup[] = [
      { id: 'today', label: t('common.today'), data: [] },
      { id: 'yesterday', label: t('common.yesterday'), data: [] },
      { id: 'week', label: t('profile.notifications.thisWeek'), data: [] },
    ];
    for (const n of notifications) {
      const bucket = groups.find((g) => g.id === n.group);
      if (bucket) bucket.data.push(n);
    }
    return groups.filter((g) => g.data.length > 0);
  }, [notifications, t]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleMarkAllRead = useCallback(() => {
    triggerHaptic('buttonPress');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const handleDismiss = useCallback((id: string) => {
    Alert.alert(
      t('profile.privacy.deleteNotification'),
      t('profile.privacy.deleteNotificationWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            triggerHaptic('error');
            setNotifications((prev) => prev.filter((n) => n.id !== id));
          },
        },
      ],
    );
  }, [t]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions(undefined, 50, 0);
    setRefreshing(false);
  }, [loadTransactions]);

  // ── Render helpers ───────────────────────────────────────────────
  const renderNotification = useCallback(
    ({ item, index }: { item: AppNotification; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * stagger.listItem).duration(350)}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleMarkRead(item.id)}
          onLongPress={() => handleDismiss(item.id)}
          style={[styles.notifCard, !item.read && styles.notifCardUnread]}
        >
          <View style={styles.notifLeft}>
            <View style={[styles.iconBox, !item.read && styles.iconBoxUnread]}>
              <Text style={styles.iconEmoji}>{item.icon}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <View style={styles.notifBody}>
            <View style={styles.notifHeaderRow}>
              <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            <Text style={styles.notifDesc} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    ),
    [styles, handleMarkRead, handleDismiss],
  );

  const renderGroupHeader = useCallback(
    ({ section }: { section: NotificationGroup }) => (
      <View style={styles.groupHeader}>
        <Text style={styles.groupLabel}>{section.label}</Text>
        <View style={styles.groupLine} />
      </View>
    ),
    [styles],
  );

  // ── Empty state ──────────────────────────────────────────────────
  if (notifications.length === 0 && !refreshing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <HeaderBar title={t('profile.notifications.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
        <ScreenLayout withBottomTabBar>
          <EmptyState
            icon="🔔"
            title={t('profile.privacy.noNotifications')}
            description={t('profile.privacy.noNotificationsDesc')}
          />
        </ScreenLayout>
      </>
    );
  }

  // ── Main render ──────────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar
        title={t('profile.notifications.title')}
        leftAction={{ icon: '←', onPress: () => router.back() }}
        rightActions={
          unreadCount > 0
            ? [
                {
                  icon: '✓',
                  onPress: handleMarkAllRead,
                },
              ]
            : undefined
        }
      />
      <ScreenLayout scrollable withBottomTabBar contentContainerStyle={styles.screenContent}>
        {/* Mark all read banner */}
        {unreadCount > 0 && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleMarkAllRead}
              style={styles.markAllBanner}
            >
              <Text style={styles.markAllIcon}>✅</Text>
              <Text style={styles.markAllText}>{t('profile.privacy.markAllRead')}</Text>
              <Badge variant="notification" count={unreadCount} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Pull-to-refresh hint */}
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <Text style={styles.refreshText}>{t('profile.privacy.updating')}</Text>
          </View>
        )}

        {/* Notification sections */}
        {grouped.map((section) => (
          <View key={section.id} style={styles.section}>
            {renderGroupHeader({ section })}
            {section.data.map((item, idx) => renderNotification({ item, index: idx }))}
          </View>
        ))}

        {/* Dismiss hint */}
        <Text style={styles.hintText}>{t('profile.privacy.longPressHint')}</Text>
      </ScreenLayout>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const useNotificationCenterStyles = createStyles((theme) =>
  StyleSheet.create({
    screenContent: {
      paddingTop: theme.spacing.sm,
    },
    markAllBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.accentBlue}18`,
      borderWidth: 1,
      borderColor: `${theme.colors.accentBlue}30`,
      borderRadius: theme.semanticRadii.buttonRadius,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    markAllIcon: {
      fontSize: 18,
    },
    markAllText: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.accentBlue,
      fontWeight: '700',
      flex: 1,
    },
    refreshIndicator: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    refreshText: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textTertiary,
    },
    section: {
      marginBottom: theme.spacing.md,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
    },
    groupLabel: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textTertiary,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginRight: theme.spacing.sm,
    },
    groupLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.borderSubtle,
    },
    notifCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.bgSecondary,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    notifCardUnread: {
      backgroundColor: `${theme.colors.accentBlue}10`,
      borderColor: `${theme.colors.accentBlue}25`,
    },
    notifLeft: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.bgTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBoxUnread: {
      backgroundColor: `${theme.colors.accentBlue}20`,
    },
    iconEmoji: {
      fontSize: 22,
    },
    unreadDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.accentBlue,
      borderWidth: 2,
      borderColor: theme.colors.bgSecondary,
    },
    notifBody: {
      flex: 1,
      overflow: 'hidden',
    },
    notifHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    notifTitle: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    notifTitleUnread: {
      color: theme.colors.textPrimary,
    },
    notifTime: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
      flexShrink: 0,
    },
    notifDesc: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    hintText: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
  }),
);
