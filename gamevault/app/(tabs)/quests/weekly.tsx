import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuestCard } from '@/components/shared/QuestCard';
import { useQuestStore } from '@/stores/useQuestStore';
import { weeklyQuests } from '@/constants/quests';
import { router } from 'expo-router';

const WEEKLY_DISPLAY = weeklyQuests.map((t) => ({
  id: t.id,
  title: t.title,
  xp: t.xpReward,
  target: t.target,
  icon: t.iconName ?? '⚔️',
  description: t.description,
}));

export default function WeeklyQuestsScreen() {
  const theme = useTheme();
  const styles = useWeeklyStyles(theme);
  const { quests, loadQuests, isLoading, generateWeeklyQuests } = useQuestStore();

  useEffect(() => {
    loadQuests();
    generateWeeklyQuests();
  }, [loadQuests, generateWeeklyQuests]);

  const storeQuestsById = useMemo(() => {
    const map: Record<string, typeof quests[0]> = {};
    for (const q of quests) map[q.questTemplateId] = q;
    return map;
  }, [quests]);

  const daysUntilReset = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    return monday;
  }, []);

  const completedCount = useMemo(() => {
    return WEEKLY_DISPLAY.filter((q) => storeQuestsById[q.id]?.status === 'completed').length;
  }, [storeQuestsById]);

  if (isLoading && quests.length === 0) {
    return (
      <>
        <HeaderBar title="Тижневі квести" leftAction={{ icon: '←', onPress: () => router.back() }} />
        <ScreenLayout loading />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Тижневі квести" leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Reset Indicator */}
        <Card style={styles.resetCard}>
          <View style={styles.resetRow}>
            <Text style={styles.resetIcon}>📅</Text>
            <View style={styles.resetInfo}>
              <Text style={styles.resetTitle}>Скидання в понеділок</Text>
              <Text style={styles.resetSub}>Залишилось {daysUntilReset} дн.</Text>
            </View>
          </View>
        </Card>

        {/* Weekly Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Прогрес тижня</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Виконано</Text>
            <Text style={styles.summaryValue}>{completedCount} / {WEEKLY_DISPLAY.length}</Text>
          </View>
          <LinearProgress
            progress={(completedCount / WEEKLY_DISPLAY.length) * 100}
            color={theme.colors.accentGold}
            height={8}
          />
          <Text style={styles.xpTotal}>
            Можна заробити: +{WEEKLY_DISPLAY.reduce((s, q) => s + q.xp, 0)} XP
          </Text>
        </Card>

        {/* Quests */}
        <Text style={styles.sectionTitle}>Тижневі квести</Text>
        {WEEKLY_DISPLAY.map((quest) => {
          const storeQuest = storeQuestsById[quest.id];
          const questProgress = storeQuest?.progress ?? 0;
          const isCompleted = storeQuest?.status === 'completed';
          return (
            <View key={quest.id} style={styles.questItem}>
              <QuestCard
                id={storeQuest?.id ?? quest.id}
                title={quest.title}
                description={quest.description}
                progress={questProgress}
                target={quest.target}
                xpReward={quest.xp}
                type="weekly"
                completed={isCompleted}
                difficulty="hard"
                iconName={quest.icon}
              />
            </View>
          );
        })}
      </ScreenLayout>
    </>
  );
}

const useWeeklyStyles = createStyles((theme) =>
  StyleSheet.create({
    resetCard: { marginBottom: theme.spacing.md },
    resetRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    resetIcon: { fontSize: 28 },
    resetInfo: { flex: 1 },
    resetTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary },
    resetSub: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    summaryCard: { marginBottom: theme.spacing.lg },
    summaryTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
    summaryLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    summaryValue: { ...theme.typography.code.style, color: theme.colors.accentGold, fontWeight: '700' },
    xpTotal: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, marginTop: theme.spacing.sm },
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    questItem: { marginBottom: theme.spacing.md },
  }),
);
