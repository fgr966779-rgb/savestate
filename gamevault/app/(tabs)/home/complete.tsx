/**
 * Screen 09 — Dashboard Complete (Goal 100% Reached)
 *
 * Celebration screen when the user fully reaches their savings goal.
 * Confetti animation, gold coin rain, 3D-style UNLOCKED text,
 * amount display, and three CTA buttons.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  triggerImpact,
  triggerNotification,
  spacing,
  typography,
  fontFamilies,
  semanticRadii,
} from '@/constants/theme';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// ── Helpers ──────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Confetti Particle ─────────────────────────────────────────────

interface ConfettiPieceProps {
  delay: number;
  color: string;
  startX: number;
  size: number;
}

function ConfettiPiece({ delay, color, startX, size }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(700, { duration: 3000, easing: Easing.out(Easing.quad) }),
    );
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(startX + (Math.random() > 0.5 ? 60 : -60), {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(startX, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
    );
    rotation.value = withDelay(delay, withRepeat(withTiming(360, { duration: 1200 }), -1));
    opacity.value = withDelay(delay + 2500, withTiming(0, { duration: 500 }));
  }, [delay, color, startX, size, translateY, translateX, rotation, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          width: size,
          height: size * 1.5,
          backgroundColor: color,
          borderRadius: 2,
          left: startX,
        },
        animatedStyle,
      ]}
    />
  );
}

// ── Gold Coin Rain ────────────────────────────────────────────────

function GoldCoin({ delay, startX }: { delay: number; startX: number }) {
  const translateY = useSharedValue(-40);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(800, { duration: 3500, easing: Easing.in(Easing.quad) }),
    );
    opacity.value = withDelay(delay + 3000, withTiming(0, { duration: 500 }));
  }, [delay, startX, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.goldCoin,
        { position: 'absolute', left: startX, top: 0 },
        animatedStyle,
      ]}
    >
      🪙
    </Animated.Text>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function DashboardComplete() {
  const theme = useTheme();
  const styles = useCompleteStyles(theme);
  const c = theme.colors;

  const { goals, getTotalBalance } = useSavingsStore();
  const { addXP } = useQuestStore();

  const completedGoal = goals.find((g) => g.status === 'completed');
  const totalBalance = getTotalBalance();
  const xpAwardedRef = useRef(false);

  const titleScale = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    triggerImpact('heavy');
    triggerHaptic('questComplete');
    triggerNotification('success');
    if (!xpAwardedRef.current) {
      addXP(200);
      xpAwardedRef.current = true;
    }

    titleScale.value = withSpring(1, {
      damping: 8,
      stiffness: 120,
      mass: 1.2,
    });
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
  }, [titleScale, subtitleOpacity, addXP]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const handleBuyNow = useCallback(() => {
    triggerHaptic('buttonPress');
    Alert.alert('🎉 Вітаємо!', 'Переходимо до покупки...');
  }, []);

  const handleNewGoal = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/goals/create');
  }, []);

  const handleShareVictory = useCallback(async () => {
    triggerHaptic('buttonPress');
    try {
      await Share.share({
        message: `🏆 Я досяг(ла) своєї цілі у SaveState! Зібрав(ла) ${formatCurrency(completedGoal?.targetAmount ?? totalBalance)} ₴ на ${completedGoal?.title ?? 'мрію'}!`,
      });
    } catch {
      // User cancelled
    }
  }, [completedGoal, totalBalance]);

  const confettiColors = [
    c.accentGold, c.accentBlue, c.accentPurple,
    c.accentGreen, c.accentOrange, '#FFFFFF',
  ];

  return (
    <View style={[styles.fullScreen, { backgroundColor: c.bgPrimary }]}>
      {/* Confetti */}
      <View style={styles.confettiLayer} pointerEvents="none">
        {Array.from({ length: 30 }).map((_, i) => (
          <ConfettiPiece
            key={`confetti-${i}`}
            delay={i * 80}
            color={confettiColors[i % confettiColors.length]}
            startX={Math.random() * 340 + 10}
            size={Math.random() * 6 + 4}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <GoldCoin
            key={`coin-${i}`}
            delay={i * 250 + 400}
            startX={Math.random() * 340 + 10}
          />
        ))}
      </View>

      {/* Content */}
      <Animated.View
        entering={FadeInUp.duration(800).delay(200)}
        style={styles.contentContainer}
      >
        {/* Trophy Icon */}
        <Animated.View entering={ZoomIn.duration(600).delay(100)}>
          <Text style={styles.trophyEmoji}>🏆</Text>
        </Animated.View>

        {/* UNLOCKED Title */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={styles.unlockedTitle}>UNLOCKED!</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={subtitleAnimatedStyle}>
          <Text style={styles.subtitle}>ЦІЛЬ ДОСЯГНУТА!</Text>
        </Animated.View>

        {/* Amount Display */}
        <Card variant="achievement" style={styles.amountCard}>
          <Text style={styles.amountText}>
            {formatCurrency(completedGoal?.currentAmount ?? totalBalance)} ₴
          </Text>
          <Text style={styles.amountOf}>
            з {formatCurrency(completedGoal?.targetAmount ?? 0)} ₴ — 100%
          </Text>
          <View style={styles.goalNameRow}>
            <Text style={styles.goalName}>{completedGoal?.title ?? 'Ціль'}</Text>
            <Badge variant="achievement" text="ВИКОНАНО" />
          </View>
        </Card>

        {/* XP Reward */}
        <Card variant="glowing" style={styles.xpCard}>
          <View style={styles.xpRow}>
            <Text style={styles.xpIcon}>⚡</Text>
            <Text style={styles.xpText}>+200 XP за досягнення цілі!</Text>
          </View>
        </Card>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <Button
            variant="primary"
            size="lg"
            label="🛒 Купити зараз"
            onPress={handleBuyNow}
            fullWidth
          />
          <View style={styles.ctaRow}>
            <Button
              variant="secondary"
              size="md"
              label="Нова ціль"
              onPress={handleNewGoal}
              fullWidth
            />
            <Button
              variant="secondary"
              size="md"
              label="Поділитись"
              onPress={handleShareVictory}
              fullWidth
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ── Flat Styles ────────────────────────────────────────────────────

const flatStyles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  confettiLayer: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  confettiPiece: {
    position: 'absolute' as any,
    top: -20,
  },
  goldCoin: {
    fontSize: 24,
  },
});

const styles = flatStyles;

// ── Themed Styles ──────────────────────────────────────────────────

const useCompleteStyles = createStyles((theme) =>
  StyleSheet.create({
    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    } as any,
    confettiLayer: {
      position: 'absolute' as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    } as any,
    confettiPiece: {
      position: 'absolute' as any,
      top: -20,
    } as any,
    goldCoin: {
      fontSize: 24,
    } as any,
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing['2xl'],
      gap: theme.spacing.lg,
      zIndex: 2,
    } as any,
    trophyEmoji: {
      fontSize: 72,
    },
    titleContainer: {
      marginTop: theme.spacing.md,
    } as any,
    unlockedTitle: {
      ...theme.typography.headingLarge.style,
      fontFamily: theme.fontFamilies.display,
      color: theme.colors.accentGold,
      fontSize: 42,
      fontWeight: '900',
      letterSpacing: 4,
      textShadowColor: theme.colors.accentGold,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 12,
    } as any,
    subtitle: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.accentGreen,
      fontWeight: '700',
      letterSpacing: 2,
      marginTop: theme.spacing.xs,
    } as any,
    amountCard: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    } as any,
    amountText: {
      fontFamily: theme.fontFamilies.mono,
      fontSize: 36,
      fontWeight: '800',
      color: theme.colors.accentGold,
    } as any,
    amountOf: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    } as any,
    goalNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    } as any,
    goalName: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
    } as any,
    xpCard: {
      width: '100%',
      marginTop: theme.spacing.sm,
    } as any,
    xpRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    } as any,
    xpIcon: {
      fontSize: 24,
    },
    xpText: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.accentGreen,
      fontWeight: '700',
    } as any,
    ctaContainer: {
      width: '100%',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    } as any,
    ctaRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    } as any,
  }),
);
