/**
 * Screen 44 — Game Over / Restart
 *
 * Retro CRT-styled game over screen with scanline overlay, flickering
 * "GAME OVER" title with red glow, journey stats in a 2-column grid,
 * blinking "INSERT COIN TO CONTINUE" prompt, and two CTA buttons.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useQuestStore } from '@/stores/useQuestStore';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

// ── Journey Stats (computed from stores) ─────────────────────────

interface StatItem {
  icon: string;
  label: string;
  value: string;
  color: string;
}

// ── Scanline Overlay ──────────────────────────────────────────────

function ScanlineOverlay() {
  return (
    <View style={scanlineStyles.container} pointerEvents="none">
      <View style={scanlineStyles.scanlines} />
      <View style={scanlineStyles.vignette} />
    </View>
  );
}

const scanlineStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.03)',
    overflow: 'hidden',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
  },
});

// ── Stat Card ─────────────────────────────────────────────────────

function StatCard({ item, index }: { item: StatItem; index: number }) {
  const theme = useTheme();
  const styles = useScreenStyles(theme);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80 + 400).duration(400)}>
      <Card variant="outlined" style={styles.statCard}>
        <Text style={styles.statIcon}>{item.icon}</Text>
        <Text style={styles.statValue} numberOfLines={1}>
          {item.value}
        </Text>
        <Text style={styles.statLabel}>{item.label}</Text>
        <View style={[styles.statAccent, { backgroundColor: item.color }]} />
      </Card>
    </Animated.View>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function GameOverRestart() {
  const theme = useTheme();
  const styles = useScreenStyles(theme);
  const c = theme.colors;

  // ── Read data from stores ─────────────────────────────────────
  const user = useAuthStore((s) => s.user);
  const totalBalance = useSavingsStore((s) => s.getTotalBalance());
  const completedQuests = useQuestStore((s) => s.quests.filter((q) => q.status === 'completed'));
  const currentStreak = useQuestStore((s) => s.currentStreak);
  const longestStreak = useQuestStore((s) => s.longestStreak);
  const achievements = useQuestStore((s) => s.achievements.filter((a) => a.unlocked));

  function fmtCurrency(n: number): string {
    return `₴${new Intl.NumberFormat('uk-UA').format(n)}`;
  }

  const JOURNEY_STATS: StatItem[] = [
    { icon: '📅', label: 'Днів у грі', value: `${currentStreak}`, color: '#FF3B3B' },
    { icon: '💰', label: 'Всього зібрано', value: fmtCurrency(totalBalance), color: '#00FF88' },
    { icon: '🔥', label: 'Макс стрік', value: `${longestStreak} дн`, color: '#FF6B00' },
    { icon: '🏅', label: 'Досягнень', value: `${achievements.length}`, color: '#FFD700' },
    { icon: '📊', label: 'XP зароблено', value: `${user?.totalXp ?? 0}`, color: '#00AAFF' },
    { icon: '🎮', label: 'Квестів', value: `${completedQuests.length}`, color: '#9D4EDD' },
  ];

  const flickerOpacity = useSharedValue(1);
  const blinkOpacity = useSharedValue(1);

  useEffect(() => {
    // Heavy error haptic on game over appearance
    triggerHaptic('error');

    // Flickering animation for the title
    flickerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0.85, { duration: 60 }),
        withTiming(1, { duration: 80 }),
        withTiming(0.9, { duration: 40 }),
        withTiming(1, { duration: 200 }),
      ),
      -1,
      false,
    );

    // Blinking animation for the coin prompt
    blinkOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 400 }),
      ),
      -1,
      false,
    );
  }, [flickerOpacity, blinkOpacity]);

  const flickerStyle = useAnimatedStyle(() => ({
    opacity: flickerOpacity.value,
  }));

  const blinkStyle = useAnimatedStyle(() => ({
    opacity: blinkOpacity.value,
  }));

  const handleNewGame = () => {
    Alert.alert(
      '🆕 Нова гра',
      'Ви впевнені? Весь прогрес буде втрачено!',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Почати заново', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  const handleContinue = () => {
    // Restore saved progress
  };

  return (
    <ScreenLayout scrollable>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Scanline CRT Overlay */}
      <ScanlineOverlay />

      <View style={styles.retroBorder}>
        <View style={styles.retroInner}>

          {/* GAME OVER Title */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.titleBlock}
          >
            <Animated.Text style={[styles.gameOverTitle, flickerStyle]}>
              G A M E{'\n'}O V E R
            </Animated.Text>
            <View style={styles.titleUnderline} />
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.statsGrid}
          >
            {JOURNEY_STATS.map((item, i) => (
              <StatCard key={item.label} item={item} index={i} />
            ))}
          </Animated.View>

          {/* INSERT COIN Blink */}
          <Animated.Text style={[styles.coinPrompt, blinkStyle]}>
            ▸ INSERT COIN TO CONTINUE ◂
          </Animated.Text>

          {/* Action Buttons */}
          <View style={styles.ctaContainer}>
            <Button
              variant="primary"
              size="lg"
              label="🆕 Нова гра"
              onPress={handleNewGame}
              fullWidth
            />
            <Button
              variant="secondary"
              size="lg"
              label="▶️  Continue"
              onPress={handleContinue}
              fullWidth
            />
          </View>

        </View>
      </View>
    </ScreenLayout>
  );
}

// ── Themed Styles ─────────────────────────────────────────────────

const useScreenStyles = createStyles((theme) =>
  StyleSheet.create({
    retroBorder: {
      borderWidth: 3,
      borderColor: theme.colors.accentRed,
      borderRadius: theme.radii.lg,
      padding: 3,
      backgroundColor: 'rgba(255,59,59,0.06)',
    } as any,
    retroInner: {
      borderRadius: theme.radii.md,
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
    } as any,
    titleBlock: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    } as any,
    gameOverTitle: {
      fontFamily: theme.fontFamilies.mono,
      fontSize: 36,
      fontWeight: '900',
      color: theme.colors.accentRed,
      textAlign: 'center',
      lineHeight: 44,
      letterSpacing: 6,
      textShadowColor: theme.colors.accentRed,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 20,
    } as any,
    titleUnderline: {
      width: '60%',
      height: 2,
      backgroundColor: theme.colors.accentRed,
      marginTop: theme.spacing.md,
      opacity: 0.5,
    } as any,
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      justifyContent: 'space-between',
    } as any,
    statCard: {
      width: '48%',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      position: 'relative' as any,
      overflow: 'hidden' as any,
    } as any,
    statIcon: {
      fontSize: 28,
      marginBottom: theme.spacing.xs,
    } as any,
    statValue: {
      fontFamily: theme.fontFamilies.mono,
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      letterSpacing: 1,
    } as any,
    statLabel: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    } as any,
    statAccent: {
      position: 'absolute' as any,
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      opacity: 0.7,
    } as any,
    coinPrompt: {
      fontFamily: theme.fontFamilies.mono,
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accentGreen,
      textAlign: 'center',
      letterSpacing: 3,
      marginTop: theme.spacing.sm,
      textShadowColor: theme.colors.accentGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    } as any,
    ctaContainer: {
      gap: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    } as any,
  }),
);
