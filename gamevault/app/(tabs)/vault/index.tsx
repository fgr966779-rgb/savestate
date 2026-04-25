/**
 * Screen 10 — Vault Main Screen
 *
 * Displays current savings vault with animated vault door opening,
 * large balance display with 3D text effect, goal breakdown cards,
 * and navigation to history and deposit screens.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeInUp,
} from 'react-native-reanimated';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  spacing,
  typography,
  fontFamilies,
  fontSizes,
} from '@/constants/theme';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Vault Door Animation ──────────────────────────────────────────

function VaultDoorAnimation({ onComplete }: { onComplete: () => void }) {
  const doorRotation = useSharedValue(0);
  const doorOpacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    doorRotation.value = withDelay(
      300,
      withTiming(-75, { duration: 800, easing: Easing.out(Easing.cubic) }),
    );
    glowOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    doorOpacity.value = withDelay(1000, withTiming(0, { duration: 400 }), () => {
      'worklet';
      if (onComplete) {
        const onSuccess = () => onComplete();
        onSuccess();
      }
    });
  }, [doorRotation, doorOpacity, glowOpacity, onComplete]);

  const doorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${doorRotation.value}deg` }, { perspective: 800 }],
    opacity: doorOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={vaultFlatStyles.doorContainer}>
      <Animated.View style={[vaultFlatStyles.doorGlow, glowAnimatedStyle]}>
        <Text style={vaultFlatStyles.doorGlowEmoji}>✨</Text>
      </Animated.View>
      <Animated.View style={[vaultFlatStyles.door, doorAnimatedStyle]}>
        <Text style={vaultFlatStyles.doorEmoji}>🏦</Text>
      </Animated.View>
    </View>
  );
}

const vaultFlatStyles = StyleSheet.create({
  doorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    position: 'relative' as const,
  },
  doorGlow: {
    position: 'absolute' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorGlowEmoji: {
    fontSize: fontSizes.hero.size,
    opacity: 0.3,
  },
  door: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorEmoji: {
    fontSize: fontSizes.display.size,
  },
});

// ── Component ─────────────────────────────────────────────────────

export default function VaultScreen() {
  const theme = useTheme();
  const styles = useVaultStyles(theme);
  const c = theme.colors;
  const { t } = useLocalized();

  const { goals, transactions, isLoading, getTotalBalance } = useSavingsStore();

  const [doorOpened, setDoorOpened] = useState(false);
  const balanceScale = useSharedValue(0.8);
  const balanceOpacity = useSharedValue(0);

  const totalBalance = getTotalBalance();
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  useEffect(() => {
    useSavingsStore.getState().loadGoals();
    useSavingsStore.getState().loadTransactions();
  }, []);

  const handleDoorComplete = useCallback(() => {
    setDoorOpened(true);
    triggerHaptic('coinSpin');
    balanceScale.value = withSpring(1, { damping: 10, stiffness: 150 });
    balanceOpacity.value = withTiming(1, { duration: 600 });
  }, [balanceScale, balanceOpacity]);

  const handleHistory = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/vault/history');
  }, []);

  const handleDeposit = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/vault/deposit');
  }, []);

  const balanceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: balanceScale.value }],
    opacity: balanceOpacity.value,
  }));

  // ── Loading ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <ScreenLayout scrollable withBottomTabBar>
        <View style={styles.vaultHeader}>
          <Skeleton variant="chart" />
        </View>
        <Skeleton variant="card" />
        <View style={styles.breakdownRow}>
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </View>
        <Skeleton variant="card" />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable withBottomTabBar>
      {/* ── Vault Door Animation ────────────────────────────────── */}
      <View style={styles.vaultHeader}>
        {!doorOpened ? (
          <VaultDoorAnimation onComplete={handleDoorComplete} />
        ) : (
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={styles.vaultIcon}
          >
            <Text style={styles.vaultEmoji}>🏦</Text>
            <Text style={styles.vaultTitle}>{t('vault.main.yourVault')}</Text>
          </Animated.View>
        )}
      </View>

      {/* ── Balance Display ─────────────────────────────────────── */}
      <Animated.View style={[styles.balanceContainer, balanceAnimatedStyle]}>
        <Text style={styles.balanceLabel}>{t('vault.main.totalBalance')}</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)} ₴</Text>
        <Text style={styles.balanceShadow}>{formatCurrency(totalBalance)} ₴</Text>
      </Animated.View>

      {/* ── Breakdown Cards ─────────────────────────────────────── */}
      {activeGoals.length > 0 ? (
        <View style={styles.breakdownRow}>
          {activeGoals.map((goal) => {
            const progress = goal.targetAmount > 0
              ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
              : 0;
            return (
              <Card key={goal.id} variant="elevated" style={styles.breakdownCard} accessibilityLabel={goal.title}>
                <Text style={styles.breakdownGoalEmoji}>
                  {goal.icon === 'monitor' || goal.title.toLowerCase().includes('монітор')
                    ? '🖥️'
                    : '🎮'}
                </Text>
                <Text style={styles.breakdownGoalName} numberOfLines={1}>
                  {goal.title}
                </Text>
                <Text style={styles.breakdownAmount}>
                  {formatCurrency(goal.currentAmount)} ₴
                </Text>
                <View style={styles.breakdownProgressRow}>
                  <View style={styles.breakdownTrack}>
                    <View
                      style={[
                        styles.breakdownFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: goal.color ?? c.accentBlue,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.breakdownPercent}>{progress}%</Text>
                </View>
              </Card>
            );
          })}
        </View>
      ) : null}

      {/* ── Completed Goals ─────────────────────────────────────── */}
      {completedGoals.length > 0 ? (
        <View style={styles.completedSection}>
          <Text style={styles.completedTitle}>{t('vault.main.completedGoals')}</Text>
          {completedGoals.map((goal) => (
            <Card key={goal.id} variant="achievement" style={styles.completedCard} accessibilityLabel={goal.title}>
              <View style={styles.completedRow}>
                <Text style={styles.completedEmoji}>✅</Text>
                <View style={styles.completedInfo}>
                  <Text style={styles.completedName}>{goal.title}</Text>
                  <Text style={styles.completedAmount}>
                    {formatCurrency(goal.currentAmount)} ₴
                  </Text>
                </View>
                <Badge variant="achievement" text="100%" />
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      {/* ── Reserve ─────────────────────────────────────────────── */}
      <Card variant="outlined" style={styles.reserveCard}>
        <View style={styles.reserveRow}>
          <Text style={styles.reserveEmoji}>🛡️</Text>
          <View style={styles.reserveInfo}>
            <Text style={styles.reserveTitle}>{t('vault.main.reserveFund')}</Text>
            <Text style={styles.reserveAmount}>0 ₴</Text>
          </View>
          <Text style={styles.reserveHint}>{t('vault.main.configureReserve')}</Text>
        </View>
      </Card>

      {/* ── Actions ─────────────────────────────────────────────── */}
      <View style={styles.actionsSection}>
        <Button
          variant="primary"
          size="lg"
          label={t('vault.main.depositButton')}
          onPress={handleDeposit}
          fullWidth
          accessibilityLabel={t('vault.main.depositButton')}
        />
        <Button
          variant="secondary"
          size="lg"
          label={`📋 ${t('vault.main.historyButton')}`}
          onPress={handleHistory}
          fullWidth
          accessibilityLabel={t('vault.main.historyButton')}
        />
      </View>
    </ScreenLayout>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Styles ─────────────────────────────────────────────────────────

const useVaultStyles = createStyles((theme) =>
  StyleSheet.create({
    vaultHeader: {
      alignItems: 'center',
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.md,
    },
    vaultIcon: {
      alignItems: 'center',
    },
    vaultEmoji: {
      fontSize: fontSizes.display.size,
    },
    vaultTitle: {
      ...theme.typography.headingSmall.style,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
    },
    balanceContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    balanceLabel: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase' as const,
      letterSpacing: 2,
    },
    balanceAmount: {
      fontFamily: theme.fontFamilies.mono,
      fontSize: 44,
      fontWeight: '800',
      color: theme.colors.accentGold,
      position: 'relative' as const,
      zIndex: 2,
    },
    balanceShadow: {
      fontFamily: theme.fontFamilies.mono,
      fontSize: 44,
      fontWeight: '800',
      color: theme.colors.accentGold,
      position: 'absolute' as const,
      opacity: 0.15,
      transform: [{ translateY: 4 }],
    },
    breakdownRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    breakdownCard: {
      flex: 1,
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    breakdownGoalEmoji: {
      fontSize: fontSizes['2xl'].size,
      marginBottom: theme.spacing.sm,
    },
    breakdownGoalName: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    breakdownAmount: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
    },
    breakdownProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      width: '100%',
    },
    breakdownTrack: {
      flex: 1,
      height: 6,
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: 3,
      overflow: 'hidden' as const,
    },
    breakdownFill: {
      height: '100%',
      borderRadius: 3,
    },
    breakdownPercent: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
      minWidth: 32,
      textAlign: 'right',
    },
    completedSection: {
      marginTop: theme.spacing.lg,
    },
    completedTitle: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    completedCard: {
      marginBottom: theme.spacing.md,
    },
    completedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    completedEmoji: {
      fontSize: fontSizes.lg.size,
    },
    completedInfo: {
      flex: 1,
    },
    completedName: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
    },
    completedAmount: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      fontFamily: theme.fontFamilies.mono,
    },
    reserveCard: {
      marginTop: theme.spacing.md,
    },
    reserveRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    reserveEmoji: {
      fontSize: fontSizes.xl.size,
    },
    reserveInfo: {
      flex: 1,
    },
    reserveTitle: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textSecondary,
    },
    reserveAmount: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
    },
    reserveHint: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.accentBlue,
    },
    actionsSection: {
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
  }),
);
