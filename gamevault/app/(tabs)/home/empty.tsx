/**
 * Screen 08 — Dashboard Empty State
 *
 * Shown when the user has no deposits yet.
 * Displays locked PS5/Monitor icons, motivational text,
 * social proof ticker, and a pulsing CTA to make the first deposit.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  triggerImpact,
  spacing,
  typography,
  fontFamilies,
  semanticRadii,
  shadows,
} from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useQuestStore } from '@/stores/useQuestStore';

// ── Social Proof Ticker ──────────────────────────────────────────

function SocialProofTicker() {
  const translateX = useRef(new Animated.Value(400)).current;
  const theme = useTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -400,
          duration: 12000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 400,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return (
    <View style={styles.tickerContainer}>
      <Animated.Text
        style={[
          styles.tickerText,
          {
            color: theme.colors.textTertiary,
            transform: [{ translateX }],
          },
        ]}
        numberOfLines={1}
      >
        🏆 287 гравців досягли цілі цього місяця
      </Animated.Text>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function DashboardEmpty() {
  const theme = useTheme();
  const styles = useEmptyStyles(theme);
  const c = theme.colors;

  const totalBalance = useSavingsStore((s) => s.getTotalBalance());
  const userXP = useAuthStore((s) => s.user?.totalXp ?? 0);
  const currentStreak = useQuestStore((s) => s.currentStreak);

  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseScale]);

  const handleFirstDeposit = () => {
    triggerHaptic('depositConfirm');
    triggerImpact('heavy');
    router.push('/vault/deposit');
  };

  return (
    <ScreenLayout scrollable withBottomTabBar>
      <View style={styles.container}>
        {/* Locked Goals Icons */}
        <View style={styles.lockedIconsRow}>
          <Animated.View
            style={[
              styles.lockedIconContainer,
              { transform: [{ scale: pulseScale }] },
            ]}
          >
            <View style={[styles.lockedIconBg, { backgroundColor: c.bgTertiary }]}>
              <Text style={styles.lockedEmoji}>🎮</Text>
            </View>
            <View style={[styles.lockOverlay, { backgroundColor: `${c.bgPrimary}88` }]}>
              <Text style={styles.lockText}>🔒</Text>
            </View>
          </Animated.View>

          <View style={styles.lockedIconContainer}>
            <View style={[styles.lockedIconBg, { backgroundColor: c.bgTertiary }]}>
              <Text style={styles.lockedEmoji}>🖥️</Text>
            </View>
            <View style={[styles.lockOverlay, { backgroundColor: `${c.bgPrimary}88` }]}>
              <Text style={styles.lockText}>🔒</Text>
            </View>
          </View>
        </View>

        {/* Motivational Text */}
        <Text style={styles.motivationalTitle}>
          Почни свій шлях!
        </Text>
        <Text style={styles.motivationalSubtitle}>
          Кожна гривня — крок до мрії 🚀
        </Text>

        {/* CTA Button with Pulse */}
        <Animated.View
          style={[styles.ctaWrapper, { transform: [{ scale: pulseScale }] }]}
        >
          <Button
            variant="primary"
            size="lg"
            label="Перше поповнення"
            onPress={handleFirstDeposit}
            fullWidth
          />
        </Animated.View>

        {/* Stats cards */}
        <View style={styles.statsRow}>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{totalBalance} ₴</Text>
            <Text style={styles.statLabel}>Збережено</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statValue}>{userXP} XP</Text>
            <Text style={styles.statLabel}>Досвід</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{currentStreak} дн.</Text>
            <Text style={styles.statLabel}>Серія</Text>
          </Card>
        </View>

        {/* Social Proof Ticker */}
        <SocialProofTicker />

        {/* Tip Card */}
        <Card variant="glowing" style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipTitle}>Порада дня</Text>
          <Text style={styles.tipText}>
            Почни з невеликої суми — навіть 50 ₴ на день може зробити дивеса за місяць!
          </Text>
        </Card>
      </View>
    </ScreenLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const useEmptyStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: theme.spacing['3xl'],
      gap: theme.spacing.md,
    } as any,
    lockedIconsRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    } as any,
    lockedIconContainer: {
      position: 'relative' as any,
      width: 100,
      height: 100,
    } as any,
    lockedIconBg: {
      width: 100,
      height: 100,
      borderRadius: theme.semanticRadii.cardRadius,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.borderDefault,
    } as any,
    lockedEmoji: {
      fontSize: 48,
      opacity: 0.5,
    },
    lockOverlay: {
      position: 'absolute' as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: theme.semanticRadii.cardRadius,
      alignItems: 'center',
      justifyContent: 'center',
    } as any,
    lockText: {
      fontSize: 28,
    },
    motivationalTitle: {
      ...theme.typography.headingSmall.style,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    } as any,
    motivationalSubtitle: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
    } as any,
    ctaWrapper: {
      width: '100%',
      paddingHorizontal: theme.spacing['2xl'],
      marginVertical: theme.spacing.md,
    } as any,
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      width: '100%',
      marginTop: theme.spacing.md,
    } as any,
    statCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    } as any,
    statEmoji: {
      fontSize: 24,
      marginBottom: theme.spacing.xs,
    },
    statValue: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
    } as any,
    statLabel: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
      marginTop: 2,
    } as any,
    tickerContainer: {
      width: '100%',
      overflow: 'hidden',
      marginTop: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: theme.semanticRadii.cardRadius,
    } as any,
    tickerText: {
      ...theme.typography.bodySmall.style,
      fontSize: 13,
    } as any,
    tipCard: {
      width: '100%',
      marginTop: theme.spacing.md,
    } as any,
    tipEmoji: {
      fontSize: 24,
      marginBottom: theme.spacing.sm,
    },
    tipTitle: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.accentGold,
      marginBottom: theme.spacing.xs,
    } as any,
    tipText: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    } as any,
  }),
);

// Ticker container uses flat styles
const styles = StyleSheet.create({
  tickerContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  tickerText: {
    fontSize: 13,
  },
  ctaWrapper: {
    width: '100%',
  },
});
