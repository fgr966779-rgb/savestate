/**
 * Screen 43 — Milestone Celebration (FULL SCREEN)
 *
 * Full-screen overlay triggered at 25%, 50%, 75%, 100% goal progress.
 * Each milestone has unique particle animation, title, NPC quote, and badge.
 * Auto-dismisses after 5 seconds with countdown.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Share } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  triggerNotification,
  triggerHapticSequence,
} from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  ZoomIn,
} from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSavingsStore } from '@/stores/useSavingsStore';

// ── Types & Constants ────────────────────────────────────────────

type MilestoneKey = '25' | '50' | '75' | '100';

interface MilestoneConfig {
  emoji: string;
  title: string;
  subtitle: string;
  npcQuote: string;
  particleEmoji: string;
  particleCount: number;
  badgeColor: string;
  glowColor: string;
}

const MILESTONE_CONFIGS: Record<MilestoneKey, MilestoneConfig> = {
  '25': {
    emoji: '🥈',
    title: 'Чверть шляху!',
    subtitle: '25% цієї цілі вже за тобою!',
    npcQuote: 'Ти на правильному шляху! Кожна гривня рахується. 💪',
    particleEmoji: '🪙',
    particleCount: 15,
    badgeColor: '#C0C0C0',
    glowColor: 'rgba(192,192,192,0.3)',
  },
  '50': {
    emoji: '🥇',
    title: 'Половина шляху!',
    subtitle: 'Ціль оживає — 50% вже зібрано!',
    npcQuote: 'Ти вже на половині! Твоя ціль починає відчуватись реальністю. ✨',
    particleEmoji: '🪙',
    particleCount: 25,
    badgeColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.3)',
  },
  '75': {
    emoji: '🔥',
    title: 'Три чверті!',
    subtitle: '75% — фінішна пряма!',
    npcQuote: 'Фініш близько! Не зупиняйся, ти майже там! 🚀',
    particleEmoji: '✨',
    particleCount: 30,
    badgeColor: '#FF8C00',
    glowColor: 'rgba(255,140,0,0.3)',
  },
  '100': {
    emoji: '🏆',
    title: 'ЦІЛЬ ДОСЯГНУТА!',
    subtitle: '100% — ти зробив це!',
    npcQuote: 'Легенда! Ти довів що можеш! Світ належить тобі! 🌟',
    particleEmoji: '🎊',
    particleCount: 40,
    badgeColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.4)',
  },
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const AUTO_DISMISS_SECONDS = 5;

// ── Helpers ──────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isValidMilestone(val: string | string[]): val is MilestoneKey {
  return ['25', '50', '75', '100'].includes(Array.isArray(val) ? val[0] : val);
}

// ── Particle Component ───────────────────────────────────────────

interface ParticleProps {
  delay: number;
  emoji: string;
  startX: number;
  startY: number;
  size: number;
}

function CelebrationParticle({ delay, emoji, startX, startY, size }: ParticleProps) {
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startY - 200, { duration: 2000, easing: Easing.out(Easing.quad) }),
          withTiming(startY, { duration: 2500, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + (Math.random() > 0.5 ? 40 : -40), {
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(startX, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    rotation.value = withDelay(delay, withRepeat(withTiming(360, { duration: 1500 }), -1));
    opacity.value = withDelay(delay + 4200, withTiming(0, { duration: 600 }));
  }, [delay, startX, startY, translateY, translateX, rotation, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        { position: 'absolute' as const, fontSize: size, left: startX, top: startY },
        animatedStyle,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

// ── Animated Progress Bar ────────────────────────────────────────

interface ProgressBarProps {
  percentage: number;
  color: string;
  glowColor: string;
  trackBg: string;
  radius: number;
}

function AnimatedProgressBar({ percentage, color, glowColor, trackBg, radius }: ProgressBarProps) {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withDelay(800, withTiming(percentage, { duration: 1500, easing: Easing.out(Easing.cubic) }));
  }, [percentage, progressWidth]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={[stylesLocal.progressTrack, { borderRadius: radius, backgroundColor: trackBg }]}>
      <Animated.View
        style={[
          stylesLocal.progressFill,
          {
            backgroundColor: color,
            borderRadius: radius,
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 8,
            shadowOpacity: 1,
          },
          animatedBarStyle,
        ]}
      />
    </View>
  );
}

// ── Local layout-only styles (no theme tokens needed) ───────────

const stylesLocal = StyleSheet.create({
  particleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  } as any,
  progressTrack: {
    width: '100%',
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});

// ── Main Component ───────────────────────────────────────────────

export default function MilestoneCelebration() {
  const theme = useTheme();
  const styles = useMilestoneStyles(theme);
  const c = theme.colors;
  const params = useLocalSearchParams<{ milestone: string }>();

  const milestoneKey: MilestoneKey = isValidMilestone(params.milestone)
    ? (Array.isArray(params.milestone) ? params.milestone[0] : params.milestone) as MilestoneKey
    : '25';

  const config = MILESTONE_CONFIGS[milestoneKey];
  const milestoneNum = parseInt(milestoneKey, 10);

  const [countdown, setCountdown] = useState(AUTO_DISMISS_SECONDS);

  // ── Seed particles per milestone ───────────────────────────────
  const particles = useMemo(() => {
    const result: Array<{ delay: number; startX: number; startY: number; size: number }> = [];
    for (let i = 0; i < config.particleCount; i++) {
      result.push({
        delay: i * 100 + Math.random() * 50,
        startX: Math.random() * (SCREEN_W - 40) + 20,
        startY: SCREEN_H * 0.3 + Math.random() * SCREEN_H * 0.4,
        size: Math.random() * 14 + 14,
      });
    }
    return result;
  }, [config.particleCount]);

  // ── Haptic celebration on mount ────────────────────────────────
  useEffect(() => {
    const seq: Array<{ key: 'achievementUnlock' | 'questComplete' | 'coinSpin' | 'levelUp'; delayMs?: number }> = [
      { key: 'achievementUnlock', delayMs: 0 },
      { key: 'coinSpin', delayMs: 200 },
      { key: 'questComplete', delayMs: 500 },
    ];
    if (milestoneKey === '100') seq.push({ key: 'levelUp', delayMs: 900 });
    triggerHapticSequence(seq);
    triggerNotification('success');
  }, [milestoneKey]);

  // ── Auto-dismiss countdown ─────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.back();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Badge pulse animation ──────────────────────────────────────
  const badgeScale = useSharedValue(0);
  const badgePulse = useSharedValue(1);

  useEffect(() => {
    badgeScale.value = withDelay(300, withSpring(1, { damping: 6, stiffness: 100, mass: 1.5 }));
    badgePulse.value = withDelay(
      1200,
      withRepeat(withSequence(withTiming(1.08, { duration: 600 }), withTiming(1, { duration: 600 })), -1, true),
    );
  }, [badgeScale, badgePulse]);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value * badgePulse.value }],
  }));

  // ── Goal amounts from store ───────────────────────────────────
  const activeGoal = useSavingsStore((s) => {
    const g = s.goals.find((g) => g.status === 'active' || g.status === 'completed');
    return g;
  });
  const targetAmount = activeGoal?.targetAmount ?? 0;
  const currentAmount = activeGoal?.currentAmount ?? 0;

  // ── Share handler ──────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    triggerHaptic('buttonPress');
    try {
      await Share.share({
        message: `${config.emoji} Я досяг(ла) ${milestoneKey}% цілі у SaveState! Зібрав(ла) ₴${formatCurrency(currentAmount)} з ₴${formatCurrency(targetAmount)}. ${config.title}`,
      });
    } catch { /* user cancelled */ }
  }, [config, milestoneKey, currentAmount, targetAmount]);

  // ── Dismiss handler ────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    triggerHaptic('buttonPress');
    router.back();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />

      <View style={[styles.fullScreen, { backgroundColor: c.bgOverlay }]}>
        {/* ── Particle Layer ──────────────────────────────────────── */}
        <View style={stylesLocal.particleLayer} pointerEvents="none">
          {particles.map((p, i) => (
            <CelebrationParticle
              key={`p-${milestoneKey}-${i}`}
              delay={p.delay}
              emoji={config.particleEmoji}
              startX={p.startX}
              startY={p.startY}
              size={p.size}
            />
          ))}
          {milestoneKey === '100' &&
            Array.from({ length: 20 }).map((_, i) => (
              <CelebrationParticle
                key={`cf-${i}`}
                delay={i * 60}
                emoji={['🎉', '🎊', '⭐', '💫', '🥳'][i % 5]}
                startX={Math.random() * SCREEN_W}
                startY={Math.random() * SCREEN_H * 0.3}
                size={Math.random() * 12 + 16}
              />
            ))}
        </View>

        {/* ── Main Content ───────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.duration(700).delay(200)} style={styles.contentContainer}>
          {/* Milestone Badge */}
          <Animated.View style={[styles.badgeWrapper, badgeAnimatedStyle]}>
            <View
              style={[
                styles.badgeCircle,
                {
                  borderColor: config.badgeColor,
                  backgroundColor: c.bgPrimary,
                  shadowColor: config.glowColor,
                  shadowRadius: 20,
                  shadowOpacity: 1,
                  shadowOffset: { width: 0, height: 0 },
                },
              ]}
            >
              <Text style={styles.badgeEmoji}>{config.emoji}</Text>
              <Text style={[styles.badgePercent, { color: config.badgeColor }]}>{milestoneKey}%</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.duration(600).delay(500)}
            style={[styles.title, milestoneKey === '100' && { color: c.accentGold }]}
          >
            {config.title}
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text entering={FadeIn.duration(500).delay(700)} style={styles.subtitle}>
            {config.subtitle}
          </Animated.Text>

          {/* NPC Quote */}
          <Animated.View entering={FadeInUp.duration(500).delay(900)}>
            <Card variant="glowing" style={styles.npcCard}>
              <View style={styles.npcRow}>
                <Text style={styles.npcAvatar}>🧙</Text>
                <Text style={styles.npcQuote}>{config.npcQuote}</Text>
              </View>
            </Card>
          </Animated.View>

          {/* Goal Progress */}
          <Animated.View entering={FadeInUp.duration(500).delay(1100)} style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              ₴{formatCurrency(currentAmount)} / ₴{formatCurrency(targetAmount)}
            </Text>
            <AnimatedProgressBar
              percentage={milestoneNum}
              color={config.badgeColor}
              glowColor={config.glowColor}
              trackBg={c.bgTertiary}
              radius={theme.radii.md}
            />
          </Animated.View>

          {/* 100% Sound Icon */}
          {milestoneKey === '100' && (
            <Animated.View entering={ZoomIn.duration(400).delay(1300)}>
              <Text style={styles.soundIcon}>🔊</Text>
            </Animated.View>
          )}

          {/* Share Button */}
          <Animated.View entering={FadeInUp.duration(500).delay(1400)} style={styles.shareSection}>
            <Button variant="primary" size="lg" label="📤 Поділитись 🎊" onPress={handleShare} fullWidth />
          </Animated.View>

          {/* Dismiss / Countdown */}
          <Animated.View entering={FadeIn.duration(400).delay(1800)} style={styles.dismissSection}>
            <Button variant="ghost" size="sm" label={`Закрити (${countdown})`} onPress={handleDismiss} fullWidth />
          </Animated.View>
        </Animated.View>
      </View>
    </>
  );
}

// ── Themed Styles ────────────────────────────────────────────────

const useMilestoneStyles = createStyles((theme) =>
  StyleSheet.create({
    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.bgOverlay,
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing['2xl'],
      gap: theme.spacing.md,
      zIndex: 2,
    },
    badgeWrapper: {
      marginBottom: theme.spacing.xs,
    },
    badgeCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeEmoji: {
      fontSize: 36,
    },
    badgePercent: {
      fontFamily: theme.fontFamilies.mono,
      fontSize: 22,
      fontWeight: '900',
      marginTop: theme.spacing.xxs,
    },
    title: {
      ...theme.typography.headingLarge.style,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      textShadowColor: theme.colors.glowGold,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 12,
    },
    subtitle: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    npcCard: {
      width: '100%',
      paddingVertical: theme.spacing.md,
    },
    npcRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    npcAvatar: {
      fontSize: 28,
      flexShrink: 0,
    },
    npcQuote: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      lineHeight: 20,
      flex: 1,
    },
    progressSection: {
      width: '100%',
      gap: theme.spacing.sm,
    },
    progressLabel: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    soundIcon: {
      fontSize: 36,
      marginTop: theme.spacing.xxs,
    },
    shareSection: {
      width: '100%',
      marginTop: theme.spacing.sm,
    },
    dismissSection: {
      width: '100%',
      marginTop: theme.spacing.xs,
    },
  }),
);
