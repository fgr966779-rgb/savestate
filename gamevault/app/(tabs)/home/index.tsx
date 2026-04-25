/**
 * Screen 07 — Home Dashboard (Main)
 *
 * Primary screen of the SaveState app. Shows savings progress hero,
 * dual goals, quick actions, daily quest card, and recent transactions.
 * Supports loading, empty (0%), and complete (100%) states.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  triggerImpact,
  spacing,
  typography,
  fontFamilies,
  fontSizes,
  semanticRadii,
} from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { getLevelForXP } from '@/constants/levels';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { SegmentedProgress } from '@/components/ui/SegmentedProgress';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { TransactionItem } from '@/components/shared/TransactionItem';
import { QuestCard } from '@/components/shared/QuestCard';
import DashboardEmpty from './empty';
import DashboardComplete from './complete';

// ── Helpers ──────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateUA(): string {
  return new Date().toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getTimeToEndOfDay(): string {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}г ${minutes}хв`;
}

// ── Animated Pulse Coin ──────────────────────────────────────────

function FloatingCoin({ delay }: { delay: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1800 }),
        withTiming(0.3, { duration: 1800 }),
      ),
      -1,
      true,
    );
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.floatingCoin, animatedStyle]}>
      🪙
    </Animated.Text>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function HomeDashboard() {
  const theme = useTheme();
  const styles = useDashboardStyles(theme);
  const c = theme.colors;

  const user = useAuthStore((s) => s.user);
  const goals = useSavingsStore((s) => s.goals);
  const transactions = useSavingsStore((s) => s.transactions);
  const isLoading = useSavingsStore((s) => s.isLoading);
  const getTotalBalance = useSavingsStore((s) => s.getTotalBalance);
  const getActiveGoal = useSavingsStore((s) => s.getActiveGoal);
  const getGoalProgress = useSavingsStore((s) => s.getGoalProgress);
  const { quests, loadQuests, generateDailyQuests } = useQuestStore();

  const [currentTime, setCurrentTime] = useState(getTimeToEndOfDay());

  const activeGoal = getActiveGoal();
  const totalBalance = getTotalBalance();
  const goalProgress = activeGoal ? getGoalProgress(activeGoal.id) : 0;
  const isComplete = activeGoal ? activeGoal.status === 'completed' : false;
  const isEmpty = !activeGoal || (activeGoal.currentAmount === 0 && !isComplete);

  const recentTransactions = transactions.slice(0, 3);

  const activeQuests = quests.filter(
    (q) => q.status === 'active' && q.type === 'daily',
  );
  const currentDailyQuest = activeQuests[0];

  // Dual goals check
  const activeGoals = goals.filter((g) => g.status === 'active');

  const dualGoalSegments = useMemo(() => {
    if (activeGoals.length < 2) return null;
    return activeGoals.slice(0, 2).map((g) => ({
      value: g.currentAmount,
      color:
        g.title.toLowerCase().includes('monitor') || g.title.toLowerCase().includes('монітор')
          ? c.accentPurple
          : c.accentBlue,
      label: g.title,
    }));
  }, [activeGoals, c.accentBlue, c.accentPurple]);

  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getTimeToEndOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load data on mount
  useEffect(() => {
    useSavingsStore.getState().loadGoals();
    useSavingsStore.getState().loadTransactions();
    loadQuests().then(() => {
      generateDailyQuests();
    });
  }, [loadQuests, generateDailyQuests]);

  const handleDeposit = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/vault/deposit');
  }, []);

  const handleWithdraw = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/vault/withdraw');
  }, []);

  const handleStats = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/stats');
  }, []);

  const handleShare = useCallback(async () => {
    triggerHaptic('buttonPress');
    try {
      await Share.share({
        message: `🎮 Я зберігаю на ${activeGoal?.title ?? 'свою мрію'} у SaveState! Вже ${formatCurrency(totalBalance)} ₴ з ${formatCurrency(activeGoal?.targetAmount ?? 0)} ₴ — ${Math.round(goalProgress)}%!`,
      });
    } catch {
      // User cancelled sharing
    }
  }, [activeGoal, totalBalance, goalProgress]);

  const handleNotifications = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/profile/notifications-center');
  }, []);

  const handleSettings = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/profile');
  }, []);

  const handleQuests = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/quests');
  }, []);

  const handleAllTransactions = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/vault/history');
  }, []);

  // ── Loading State ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <ScreenLayout scrollable withBottomTabBar>
        {/* Header skeleton */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Skeleton variant="avatar" width={44} height={44} />
            <View style={styles.headerTextBlock}>
              <Skeleton variant="card" />
            </View>
          </View>
          <Skeleton variant="card" />
        </View>
        {/* Hero skeleton */}
        <View style={styles.heroSection}>
          <Skeleton variant="chart" />
        </View>
        {/* Actions skeleton */}
        <View style={styles.actionsGrid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </View>
        {/* Quest skeleton */}
        <Skeleton variant="card" />
        {/* Transactions skeleton */}
        {[0, 1, 2].map((i) => (
          <Skeleton key={`tx-${i}`} variant="listItem" />
        ))}
      </ScreenLayout>
    );
  }

  // ── Complete State ──────────────────────────────────────────────
  if (isComplete) {
    return <DashboardComplete />;
  }

  // ── Empty State ─────────────────────────────────────────────────
  if (isEmpty) {
    return <DashboardEmpty />;
  }

  // ── Main Dashboard ──────────────────────────────────────────────
  const levelDef = getLevelForXP(user?.totalXp ?? 0);

  return (
    <ScreenLayout scrollable withBottomTabBar>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Avatar
            variant="withLevelRing"
            name={user?.nickname ?? ''}
            uri={user?.avatarId ?? undefined}
            size="sm"
            level={user?.level ?? 1}
          />
          <View style={styles.headerTextBlock}>
            <Text style={styles.nickname}>{user?.nickname ?? 'Гравець'}</Text>
            <Badge variant="level" text={`LVL ${user?.level ?? 1}`} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.headerIconBtn}
            onPress={handleNotifications}
            accessibilityLabel="Сповіщення"
            accessibilityRole="button"
          >
            <Text style={styles.headerIconText}>🔔</Text>
            <View style={styles.notificationDot} />
          </Pressable>
          <Pressable
            style={styles.headerIconBtn}
            onPress={handleSettings}
            accessibilityLabel="Налаштування"
            accessibilityRole="button"
          >
            <Text style={styles.headerIconText}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {/* ── DATE ───────────────────────────────────────────────── */}
      <Text style={styles.dateText}>{formatDateUA()}</Text>

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <View style={styles.heroSection}>
        <FloatingCoin delay={0} />
        <FloatingCoin delay={600} />
        <FloatingCoin delay={1200} />

        <View style={styles.heroCenter}>
          <CircularProgress
            progress={goalProgress}
            size={160}
            strokeWidth={12}
            glow
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroAmount}>
                {formatCurrency(activeGoal?.currentAmount ?? 0)}
              </Text>
              <Text style={styles.heroLabel}>
                з {formatCurrency(activeGoal?.targetAmount ?? 0)} ₴
              </Text>
            </View>
          </CircularProgress>
        </View>

        <Text style={styles.goalTitle}>{activeGoal?.title ?? ''}</Text>
        <Text style={styles.goalPercent}>{Math.round(goalProgress)}%</Text>
      </View>

      {/* ── DUAL GOALS ROW ─────────────────────────────────────── */}
      {dualGoalSegments ? (
        <Card variant="outlined" style={styles.dualGoalCard}>
          <SegmentedProgress segments={dualGoalSegments} height={10} />
        </Card>
      ) : null}

      {/* ── QUICK ACTIONS ──────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Швидкі дії</Text>
      <View style={styles.actionsGrid}>
        <Card variant="default" onPress={handleDeposit} style={styles.actionCard}>
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionLabel}>Поповнити</Text>
        </Card>
        <Card variant="default" onPress={handleWithdraw} style={styles.actionCard}>
          <Text style={styles.actionIcon}>💸</Text>
          <Text style={styles.actionLabel}>Зняти</Text>
        </Card>
        <Card variant="default" onPress={handleStats} style={styles.actionCard}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionLabel}>Статистика</Text>
        </Card>
        <Card variant="default" onPress={handleShare} style={styles.actionCard}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionLabel}>Поділитись</Text>
        </Card>
      </View>

      {/* ── TODAY'S QUEST ──────────────────────────────────────── */}
      {currentDailyQuest ? (
        <>
          <Text style={styles.sectionTitle}>Квест дня</Text>
          <Pressable onPress={handleQuests}>
            <QuestCard
              id={currentDailyQuest.id}
              title={currentDailyQuest.questTemplateId}
              description={`Виконай щоденний квест до кінця дня`}
              progress={currentDailyQuest.progress}
              target={currentDailyQuest.target}
              xpReward={currentDailyQuest.xpReward}
              coinReward={currentDailyQuest.coinReward}
              type={currentDailyQuest.type}
              completed={false}
            />
            <View style={styles.questTimer}>
              <Text style={styles.questTimerText}>
                ⏱ Залишилось: {currentTime}
              </Text>
            </View>
          </Pressable>
        </>
      ) : null}

      {/* ── RECENT TRANSACTIONS ────────────────────────────────── */}
      <View style={styles.transactionsHeader}>
        <Text style={styles.sectionTitle}>Останні транзакції</Text>
        <Pressable onPress={handleAllTransactions}>
          <Text style={styles.seeAllLink}>Всі транзакції</Text>
        </Pressable>
      </View>

      {recentTransactions.length > 0 ? (
        recentTransactions.map((tx) => (
          <TransactionItem
            key={tx.id}
            id={tx.id}
            type={tx.type}
            amount={tx.amount}
            category={tx.category ?? 'Інше'}
            date={tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt}
            xpEarned={tx.xpEarned}
            note={tx.note ?? undefined}
            currency="UAH"
          />
        ))
      ) : (
        <EmptyState
          icon="📋"
          title="Транзакцій ще немає"
          description="Здійсни перше поповнення, щоб побачити транзакції тут"
        />
      )}
    </ScreenLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const useDashboardStyles = createStyles((theme) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
    } as any,
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    } as any,
    headerTextBlock: {
      gap: 2,
    } as any,
    nickname: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
    } as any,
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    } as any,
    headerIconBtn: {
      width: 40,
      height: 40,
      borderRadius: theme.semanticRadii.buttonRadius,
      backgroundColor: theme.colors.bgTertiary,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as any,
    } as any,
    headerIconText: {
      fontSize: 18,
    },
    notificationDot: {
      position: 'absolute' as any,
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.accentRed,
    },
    dateText: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    } as any,
    heroSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      position: 'relative' as any,
    } as any,
    heroCenter: {
      position: 'relative' as any,
    } as any,
    heroContent: {
      alignItems: 'center',
    } as any,
    heroAmount: {
      fontFamily: theme.fontFamilies.mono,
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.accentGold,
    } as any,
    heroLabel: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    } as any,
    goalTitle: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.md,
    } as any,
    goalPercent: {
      ...theme.typography.code.style,
      color: theme.colors.accentGreen,
      marginTop: theme.spacing.xs,
    } as any,
    floatingCoin: {
      position: 'absolute' as any,
      fontSize: 20,
    },
    dualGoalCard: {
      marginTop: theme.spacing.sm,
    } as any,
    sectionTitle: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    } as any,
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginHorizontal: -theme.spacing.sm,
    } as any,
    actionCard: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      padding: theme.spacing.md,
    } as any,
    actionIcon: {
      fontSize: 28,
      marginBottom: theme.spacing.sm,
    },
    actionLabel: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    } as any,
    questTimer: {
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    } as any,
    questTimerText: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
    } as any,
    transactionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    } as any,
    seeAllLink: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.accentBlue,
    } as any,
  }),
);
