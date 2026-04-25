import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withSpring } from 'react-native-reanimated';
import { useTheme, createStyles, triggerImpact } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useQuestStore } from '@/stores/useQuestStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { router } from 'expo-router';

export default function StreakScreen() {
  const theme = useTheme();
  const styles = useStreakStyles(theme);
  const { currentStreak, longestStreak, freezeCount, loadStreak, useStreakFreeze, isLoading } = useQuestStore();
  const lastDepositDate = useQuestStore((s) => s.lastDepositDate);
  const [calData, setCalData] = useState<number[]>([]);

  const fireAnim = useSharedValue(1);
  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireAnim.value }],
  }));

  useEffect(() => {
    loadStreak();
    // Build heatmap from lastDepositDate instead of random
    const days: number[] = [];
    for (let i = 0; i < 35; i++) {
      const offset = 34 - i;
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const dateStr = d.toISOString().split('T')[0];
      // Mark days as active based on streak calculation
      if (lastDepositDate) {
        const lastDate = new Date(lastDepositDate);
        const dayDiff = Math.floor((d.getTime() - lastDate.getTime()) / 86400000);
        days.push(dayDiff <= 0 || dayDiff < currentStreak ? 1 : 0);
      } else {
        days.push(0);
      }
    }
    setCalData(days);
    fireAnim.value = withRepeat(
      withSequence(withSpring(1.05, { damping: 8, stiffness: 100 }), withSpring(0.95, { damping: 8, stiffness: 100 })),
      -1, true,
    );
  }, [loadStreak, fireAnim]);

  const handleFreeze = () => {
    const success = useStreakFreeze();
    if (success) {
      triggerImpact('medium');
    }
  };

  if (isLoading) {
    return (
      <>
        <HeaderBar title="Серія" leftAction={{ icon: '←', onPress: () => router.back() }} />
        <ScreenLayout loading />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Серія" leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Current Streak */}
        <Card variant="glowing" style={styles.streakCard}>
          <View style={styles.streakCenter}>
            <Animated.Text style={[styles.fireEmoji, fireStyle]}>🔥</Animated.Text>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>днів поспіль</Text>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Найкраща серія</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{freezeCount}</Text>
            <Text style={styles.statLabel}>Заморозки</Text>
          </Card>
        </View>

        {/* Freeze Button */}
        {freezeCount > 0 && (
          <Button
            label="❄️ Використати freeze"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={handleFreeze}
          />
        )}

        {/* Calendar Heatmap */}
        <Text style={styles.sectionTitle}>Календар серії</Text>
        <Card style={styles.calendarCard}>
          <View style={styles.calendarGrid}>
            {calData.map((val, i) => (
              <View
                key={i}
                style={[
                  styles.calendarCell,
                  { backgroundColor: val ? theme.colors.accentGreen + '60' : theme.colors.bgTertiary },
                ]}
              />
            ))}
          </View>
          <View style={styles.calendarLegend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.bgTertiary }]} />
              <Text style={styles.legendText}>Немає запису</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.accentGreen + '60' }]} />
              <Text style={styles.legendText}>Активний день</Text>
            </View>
          </View>
        </Card>

        {currentStreak === 0 && (
          <EmptyState
            icon="🔥"
            title="Почніть свою серію!"
            description="Зробіть першу транзакцію сьогодні, щоб почати"
          />
        )}
      </ScreenLayout>
    </>
  );
}

const useStreakStyles = createStyles((theme) =>
  StyleSheet.create({
    streakCard: { marginBottom: theme.spacing.lg, alignItems: 'center' },
    streakCenter: { alignItems: 'center', paddingVertical: theme.spacing.lg },
    fireEmoji: { fontSize: 48 },
    streakNumber: { ...theme.typography.displayLarge.style, fontSize: 64, fontWeight: '900', color: theme.colors.accentOrange },
    streakLabel: { ...theme.typography.bodyLarge.style, color: theme.colors.textSecondary },
    statsRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
    statCard: { flex: 1, alignItems: 'center' },
    statValue: { ...theme.typography.statSmall.style, fontSize: 28, fontWeight: '800', color: theme.colors.textPrimary },
    statLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginTop: theme.spacing.lg, marginBottom: theme.spacing.md },
    calendarCard: {},
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
    calendarCell: { width: '12%', aspectRatio: 1, borderRadius: 4 },
    calendarLegend: { flexDirection: 'row', gap: theme.spacing.lg, marginTop: theme.spacing.md, justifyContent: 'center' },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    legendDot: { width: 10, height: 10, borderRadius: 3 },
    legendText: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
  }),
);
