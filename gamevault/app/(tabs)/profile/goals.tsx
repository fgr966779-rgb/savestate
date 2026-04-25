import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { GoalProgressCard } from '@/components/shared/GoalProgressCard';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';

type GoalFilter = 'all' | 'active' | 'completed' | 'paused';

export default function GoalsScreen() {
  const theme = useTheme();
  const styles = useGoalsStyles(theme);
  const { goals, loadGoals, deleteGoal, isLoading } = useSavingsStore();
  const { t } = useLocalized();
  const [filter, setFilter] = useState<GoalFilter>('all');

  const FILTERS: { key: GoalFilter; labelKey: string }[] = useMemo(() => [
    { key: 'all', labelKey: 'common.all' },
    { key: 'active', labelKey: 'profile.goals.active' },
    { key: 'completed', labelKey: 'profile.goals.completed' },
    { key: 'paused', labelKey: 'profile.goals.paused' },
  ], []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const filteredGoals = useMemo(() => {
    if (filter === 'all') return goals;
    return goals.filter((g) => g.status === filter);
  }, [goals, filter]);

  const handleDelete = (goalId: string) => {
    triggerHaptic('buttonPress');
    deleteGoal(goalId);
  };

  const handleAddGoal = () => {
    router.push('/(tabs)/vault/add');
  };

  if (isLoading) {
    return (
      <>
        <HeaderBar title={t('profile.goals.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
        <ScreenLayout loading />
      </>
    );
  }

  const getEmptyTitle = () => {
    if (filter === 'all') return t('profile.goals.noGoals');
    if (filter === 'active') return t('profile.goals.noActiveGoals');
    if (filter === 'completed') return t('profile.goals.noCompletedGoals');
    return t('profile.goals.noPausedGoals');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar
        title={t('profile.goals.title')}
        leftAction={{ icon: '←', onPress: () => router.back() }}
        rightActions={[{ icon: '+', onPress: handleAddGoal }]}
      />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{goals.filter((g) => g.status === 'active').length}</Text>
              <Text style={styles.summaryLabel}>{t('profile.goals.activeCount')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{goals.filter((g) => g.status === 'completed').length}</Text>
              <Text style={styles.summaryLabel}>{t('profile.goals.completedCount')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{goals.length}</Text>
              <Text style={styles.summaryLabel}>{t('profile.goals.total')}</Text>
            </View>
          </View>
        </Card>

        {/* Filters */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={t(f.labelKey)} selected={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </View>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <EmptyState
            icon="🎯"
            title={getEmptyTitle()}
            description={t('profile.goals.emptyDesc')}
            ctaLabel={t('profile.goals.addNewGoal')}
            onCta={handleAddGoal}
          />
        ) : (
          filteredGoals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <GoalProgressCard
                goalId={goal.id}
                title={goal.title}
                targetAmount={goal.targetAmount}
                currentAmount={goal.currentAmount}
                icon={goal.icon ?? '🎯'}
                color={goal.color ?? theme.colors.accentBlue}
                onPress={(id) => router.push(`/(tabs)/vault/${id}`)}
              />
              <View style={styles.goalActions}>
                {goal.status !== 'completed' && (
                  <Button label={t('common.delete')} variant="ghost" size="sm" onPress={() => handleDelete(goal.id)} />
                )}
              </View>
            </View>
          ))
        )}

        {/* Add Goal */}
        <Button
          label={t('profile.goals.addNewGoal')}
          variant="secondary"
          size="lg"
          fullWidth
          onPress={handleAddGoal}
        />
      </ScreenLayout>
    </>
  );
}

const useGoalsStyles = createStyles((theme) =>
  StyleSheet.create({
    summaryCard: { marginBottom: theme.spacing.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center' },
    summaryValue: { ...theme.typography.statSmall.style, fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary },
    summaryLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginTop: 2 },
    filterRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    goalItem: { marginBottom: theme.spacing.md },
    goalActions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm, justifyContent: 'flex-end' },
  }),
);
