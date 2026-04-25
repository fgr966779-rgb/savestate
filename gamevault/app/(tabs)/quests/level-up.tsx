import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withDelay } from 'react-native-reanimated';
import { useTheme, createStyles, triggerImpact, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { Button } from '@/components/ui/Button';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/useAuthStore';
import { getLevelForXP, getXPProgress, levels, rarityColors } from '@/constants/levels';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function LevelUpScreen() {
  const theme = useTheme();
  const styles = useLevelUpStyles(theme);
  const router = useRouter();
  const params = useLocalSearchParams<{ level?: string }>();
  const user = useAuthStore((s) => s.user);

  const levelNum = parseInt(params.level ?? '1', 10);
  const levelDef = levels[levelNum - 1] ?? levels[0];
  const nextLevel = levels[levelNum] ?? null;

  const scaleAnim = useSharedValue(0);
  const burstAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    triggerImpact('heavy');
    triggerHaptic('questComplete');
    scaleAnim.value = withSequence(
      withSpring(0.3, { damping: 6, stiffness: 80 }),
      withDelay(200, withSpring(1, { damping: 8, stiffness: 100 })),
    );
    burstAnim.value = withDelay(100, withSpring(1, { damping: 4, stiffness: 60 }));
    fadeAnim.value = withDelay(400, withSpring(1, { damping: 12, stiffness: 100 }));
  }, []);

  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: burstAnim.value }],
    opacity: burstAnim.value > 0.8 ? 0.6 - (burstAnim.value - 0.8) * 3 : burstAnim.value * 0.6,
  }));

  const mainStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const xpProgress = useMemo(() => {
    if (!user) return { progress: 0, xpInLevel: 0, xpNeeded: 100 };
    const prog = getXPProgress(user.totalXp);
    return { progress: Math.round(prog.progress * 100), xpInLevel: prog.xpInCurrentLevel, xpNeeded: prog.xpNeeded };
  }, [user]);

  const rarityColor = rarityColors[levelDef.rarity];

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <ScreenLayout scrollable>
        <View style={styles.container}>
          {/* Burst background */}
          <Animated.View style={[styles.burstCircle, burstStyle, { borderColor: rarityColor }]} />
          <Animated.View style={[styles.burstCircle2, burstStyle, { borderColor: rarityColor }]} />

          {/* Level Text */}
          <Animated.View style={[styles.mainContent, mainStyle]}>
            <Text style={styles.subtitle}>НОВИЙ РІВЕНЬ</Text>
            <Text style={[styles.levelNumber, { color: rarityColor }]}>{levelNum}</Text>
            <Text style={styles.levelTitle}>{levelDef.title}</Text>
            <View style={styles.rarityBadge}>
              <Text style={[styles.rarityText, { color: rarityColor }]}>{levelDef.rarity.toUpperCase()}</Text>
            </View>
          </Animated.View>

          {/* Details */}
          <Animated.View style={[styles.details, fadeStyle]}>
            <Card style={styles.unlockCard}>
              <Text style={styles.unlockTitle}>Розблоковано:</Text>
              <Text style={styles.unlockDesc}>{levelDef.unlockDescription}</Text>
            </Card>

            {/* XP to Next */}
            {nextLevel && (
              <Card style={styles.xpCard}>
                <Text style={styles.xpNextLabel}>До наступного рівня</Text>
                <LinearProgress
                  progress={xpProgress.progress}
                  color={rarityColor}
                  height={10}
                />
                <Text style={styles.xpNextInfo}>
                  {xpProgress.xpInLevel} / {xpProgress.xpNeeded} XP
                </Text>
              </Card>
            )}

            {/* Rewards */}
            <Card style={styles.rewardsCard}>
              <Text style={styles.rewardsTitle}>Нагороди на цьому рівні</Text>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardIcon}>⚡</Text>
                <Text style={styles.rewardText}>+{levelDef.levelUpXP} XP доступно</Text>
              </View>
            </Card>

            <Button
              label="Продовжити"
              size="lg"
              fullWidth
              onPress={() => router.back()}
            />
          </Animated.View>
        </View>
      </ScreenLayout>
    </>
  );
}

const useLevelUpStyles = createStyles((theme) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingVertical: theme.spacing['3xl'] },
    burstCircle: {
      position: 'absolute', top: 60, width: 200, height: 200, borderRadius: 100,
      borderWidth: 3, backgroundColor: 'transparent',
    },
    burstCircle2: {
      position: 'absolute', top: 80, width: 160, height: 160, borderRadius: 80,
      borderWidth: 2, backgroundColor: 'transparent',
    },
    mainContent: { alignItems: 'center', marginBottom: theme.spacing['2xl'] },
    subtitle: { ...theme.typography.labelLarge.style, color: theme.colors.textTertiary, letterSpacing: 4, marginBottom: theme.spacing.sm },
    levelNumber: { ...theme.typography.displayLarge.style, fontSize: 72, fontWeight: '900' },
    levelTitle: { ...theme.typography.headingSmall.style, color: theme.colors.textPrimary, marginTop: theme.spacing.sm },
    rarityBadge: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md, paddingVertical: 4,
      borderRadius: theme.semanticRadii.chipRadius,
      backgroundColor: theme.colors.bgTertiary,
    },
    rarityText: { ...theme.typography.labelSmall.style, fontWeight: '800', letterSpacing: 2 },
    details: { width: '100%', gap: theme.spacing.md },
    unlockCard: {},
    unlockTitle: { ...theme.typography.labelMedium.style, color: theme.colors.accentGold, marginBottom: theme.spacing.xs },
    unlockDesc: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    xpCard: {},
    xpNextLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
    xpNextInfo: { ...theme.typography.code.style, color: theme.colors.textTertiary, marginTop: theme.spacing.sm, textAlign: 'center' },
    rewardsCard: {},
    rewardsTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    rewardRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    rewardIcon: { fontSize: 20 },
    rewardText: { ...theme.typography.bodyMedium.style, color: theme.colors.accentGreen },
  }),
);
