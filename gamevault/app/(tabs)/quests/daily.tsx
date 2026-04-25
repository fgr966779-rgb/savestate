import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme, createStyles, triggerImpact } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuestCard } from '@/components/shared/QuestCard';
import { useQuestStore } from '@/stores/useQuestStore';
import { dailyQuests } from '@/constants/quests';
import { router } from 'expo-router';

const DAILY_QUESTS = dailyQuests.map((t) => ({
  id: t.id,
  title: t.title,
  xp: t.xpReward,
  target: t.target,
  icon: t.iconName ?? '📋',
  description: t.description,
}));

export default function DailyQuestsScreen() {
  const theme = useTheme();
  const styles = useDailyStyles(theme);
  const { quests, loadQuests, isLoading, generateDailyQuests, completeQuest } = useQuestStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState('23:59:59');

  const scaleAnim = useSharedValue(0);
  const confettiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: scaleAnim.value > 0 ? 1 : 0,
  }));

  useEffect(() => {
    loadQuests();
    generateDailyQuests();
  }, [loadQuests, generateDailyQuests]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const allDone = useMemo(() => {
    return dailyQuestIds.every((id) => storeQuestsById[id]?.status === 'completed');
  }, [storeQuestsById, dailyQuestIds]);

  const completedCount = useMemo(() => {
    return dailyQuestIds.filter((id) => storeQuestsById[id]?.status === 'completed').length;
  }, [storeQuestsById, dailyQuestIds]);

  const storeQuestsById = useMemo(() => {
    const map: Record<string, typeof quests[0]> = {};
    for (const q of quests) map[q.questTemplateId] = q;
    return map;
  }, [quests]);

  const dailyQuestIds = dailyQuests.map((t) => t.id);

  const handleComplete = (id: string) => {
    const storeQuest = storeQuestsById[id];
    if (!storeQuest || storeQuest.status === 'completed') return;
    completeQuest(storeQuest.id);
    triggerImpact('heavy');
    if (completedCount + 1 >= DAILY_QUESTS.length) {
      setShowConfetti(true);
      scaleAnim.value = withSpring(1, { damping: 8, stiffness: 100 });
    }
  };

  if (isLoading && quests.length === 0) {
    return (
      <>
        <HeaderBar title="Щоденні квести" leftAction={{ icon: '←', onPress: () => router.back() }} />
        <ScreenLayout loading />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Щоденні квести" leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Timer + Progress */}
        <Card style={styles.timerCard}>
          <View style={styles.timerRow}>
            <Text style={styles.timerIcon}>⏱️</Text>
            <View style={styles.timerInfo}>
              <Text style={styles.timerTitle}>До скидання</Text>
              <Text style={styles.timerValue}>{countdown}</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{completedCount}/{DAILY_QUESTS.length}</Text>
            </View>
          </View>
        </Card>

        {/* Quest List */}
        {DAILY_QUESTS.map((quest) => {
          const storeQuest = storeQuestsById[quest.id];
          const currentProgress = storeQuest?.progress ?? 0;
          const isCompleted = storeQuest?.status === 'completed';
          return (
            <View key={quest.id} style={styles.questItem}>
              <QuestCard
                id={storeQuest?.id ?? quest.id}
                title={quest.title}
                description={quest.description}
                progress={currentProgress}
                target={quest.target}
                xpReward={quest.xp}
                type="daily"
                completed={isCompleted}
                difficulty="easy"
                iconName={quest.icon}
                onPress={isCompleted ? undefined : () => handleComplete(quest.id)}
              />
            </View>
          );
        })}

        {/* Confetti overlay */}
        {showConfetti && (
          <Animated.View style={[styles.confettiContainer, confettiStyle]}>
            <Text style={styles.confettiEmoji}>🎉</Text>
            <Text style={styles.confettiTitle}>Всі щоденні виконано!</Text>
            <Text style={styles.confettiSub}>+{DAILY_QUESTS.reduce((s, q) => s + q.xp, 0)} XP</Text>
          </Animated.View>
        )}
      </ScreenLayout>
    </>
  );
}

const useDailyStyles = createStyles((theme) =>
  StyleSheet.create({
    timerCard: { marginBottom: theme.spacing.lg },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    timerIcon: { fontSize: 28 },
    timerInfo: { flex: 1 },
    timerTitle: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    timerValue: { ...theme.typography.titleLarge.style, color: theme.colors.accentBlue, fontFamily: theme.fontFamilies.mono },
    progressBadge: {
      backgroundColor: theme.colors.accentGreen + '20',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.semanticRadii.chipRadius,
    },
    progressBadgeText: { ...theme.typography.code.style, color: theme.colors.accentGreen, fontWeight: '700' },
    questItem: { marginBottom: theme.spacing.md },
    confettiContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.bgSurface,
      borderRadius: theme.semanticRadii.cardRadius,
      padding: theme.spacing['2xl'],
      marginTop: theme.spacing.lg,
    },
    confettiEmoji: { fontSize: 48 },
    confettiTitle: { ...theme.typography.headingSmall.style, color: theme.colors.textPrimary, marginTop: theme.spacing.md },
    confettiSub: { ...theme.typography.bodyLarge.style, color: theme.colors.accentGreen, marginTop: theme.spacing.sm },
  }),
);
