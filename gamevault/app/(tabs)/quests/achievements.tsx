import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AchievementCard } from '@/components/shared/AchievementCard';
import { useQuestStore } from '@/stores/useQuestStore';
import { achievements, achievementCategoryLabels, type Achievement } from '@/constants/achievements';

type ViewMode = 'grid' | 'list';
type CategoryFilter = 'all' | Achievement['category'];

const CATEGORY_TABS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'Усі' },
  { key: 'savings', label: 'Накопичення' },
  { key: 'streak', label: 'Стріки' },
  { key: 'level', label: 'Рівні' },
  { key: 'quest', label: 'Квести' },
  { key: 'social', label: 'Соціальні' },
];

export default function AchievementsScreen() {
  const theme = useTheme();
  const styles = useAchievementsStyles(theme);
  const { achievements: unlockedAchievements, loadAchievements, isLoading } = useQuestStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [category, setCategory] = useState<CategoryFilter>('all');

  useEffect(() => { loadAchievements(); }, [loadAchievements]);

  const unlockedIds = useMemo(() => {
    return new Set(unlockedAchievements.filter((a) => a.unlocked).map((a) => a.achievementId));
  }, [unlockedAchievements]);

  const filteredAchievements = useMemo(() => {
    if (category === 'all') return achievements;
    return achievements.filter((a) => a.category === category);
  }, [category]);

  const unlockedCount = useMemo(() => {
    return achievements.filter((a) => unlockedIds.has(a.id)).length;
  }, [achievements, unlockedIds]);

  if (isLoading) {
    return (
      <>
        <HeaderBar title="Досягнення" leftAction={{ icon: '←', onPress: () => {} }} />
        <ScreenLayout loading />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar
        title="Досягнення"
        leftAction={{ icon: '←', onPress: () => {} }}
        rightActions={[
          {
            icon: viewMode === 'list' ? '▦' : '☰',
            onPress: () => setViewMode((v) => (v === 'list' ? 'grid' : 'list')),
          },
        ]}
      />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Progress Header */}
        <Card style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressIcon}>🏆</Text>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Розблоковано</Text>
              <Text style={styles.progressValue}>
                {unlockedCount} / {achievements.length}
              </Text>
            </View>
            <Text style={styles.progressPercent}>
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </Text>
          </View>
        </Card>

        {/* Category Filters */}
        <View style={styles.filterRow}>
          {CATEGORY_TABS.map((tab) => (
            <Chip
              key={tab.key}
              label={tab.label}
              selected={category === tab.key}
              onPress={() => setCategory(tab.key)}
            />
          ))}
        </View>

        {/* Achievements */}
        {filteredAchievements.length === 0 ? (
          <EmptyState icon="🔒" title="Немає досягнень" description="У цій категорії ще немає досягнень" />
        ) : viewMode === 'list' ? (
          <FlatList
            data={filteredAchievements}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.achievementItem}>
                <AchievementCard
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  icon={item.iconName}
                  rarity={item.rarity}
                  unlocked={unlockedIds.has(item.id)}
                  hidden={item.hidden}
                  xpBonus={item.xpBonus}
                  onPress={() => {}}
                />
              </View>
            )}
          />
        ) : (
          <View style={styles.gridContainer}>
            {filteredAchievements.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <AchievementCard
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  icon={item.iconName}
                  rarity={item.rarity}
                  unlocked={unlockedIds.has(item.id)}
                  hidden={item.hidden}
                  xpBonus={item.xpBonus}
                  onPress={() => {}}
                />
              </View>
            ))}
          </View>
        )}
      </ScreenLayout>
    </>
  );
}

const useAchievementsStyles = createStyles((theme) =>
  StyleSheet.create({
    progressCard: { marginBottom: theme.spacing.md },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    progressIcon: { fontSize: 28 },
    progressInfo: { flex: 1 },
    progressTitle: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    progressValue: { ...theme.typography.titleLarge.style, color: theme.colors.accentGold, fontWeight: '700' },
    progressPercent: { ...theme.typography.code.style, color: theme.colors.accentGreen, fontSize: 16, fontWeight: '700' },
    filterRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      flexWrap: 'wrap',
    },
    achievementItem: { marginBottom: theme.spacing.md },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    gridItem: { width: '48%' },
  }),
);
