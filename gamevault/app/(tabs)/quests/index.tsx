import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { QuestCard } from '@/components/shared/QuestCard';
import { useQuestStore } from '@/stores/useQuestStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { getLevelForXP, getXPProgress } from '@/constants/levels';

type QuestTab = 'daily' | 'weekly' | 'story';

export default function QuestHubScreen() {
  const theme = useTheme();
  const styles = useQuestHubStyles(theme);
  const [activeTab, setActiveTab] = useState<QuestTab>('daily');
  const { quests, loadQuests, isLoading } = useQuestStore();
  const user = useAuthStore((s) => s.user);

  const levelInfo = useMemo(() => {
    if (!user) return { level: 1, title: 'Новачок', progress: 0, xpInLevel: 0, xpNeeded: 100 };
    const xpProg = getXPProgress(user.totalXp);
    return {
      level: xpProg.currentLevel.level,
      title: xpProg.currentLevel.title,
      progress: Math.round(xpProg.progress * 100),
      xpInLevel: xpProg.xpInCurrentLevel,
      xpNeeded: xpProg.xpNeeded,
    };
  }, [user]);

  useEffect(() => { loadQuests(); }, [loadQuests]);

  const filteredQuests = useMemo(() => {
    const active = quests.filter((q) => q.status === 'active' && q.type === activeTab);
    const completed = quests.filter((q) => q.status === 'completed' && q.type === activeTab);
    return { active, completed };
  }, [quests, activeTab]);

  const tabs: { key: QuestTab; label: string }[] = [
    { key: 'daily', label: 'Щоденні' },
    { key: 'weekly', label: 'Тижневі' },
    { key: 'story', label: 'Сюжетні' },
  ];

  if (isLoading && quests.length === 0) {
    return (
      <>
        <HeaderBar title="Квести" />
        <ScreenLayout loading />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Квести" />
      <ScreenLayout scrollable withBottomTabBar>
        {/* XP Bar Section */}
        <Card style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Рівень {levelInfo.level}</Text>
            </View>
            <Text style={styles.levelTitle}>{levelInfo.title}</Text>
            <Text style={styles.xpLabel}>
              {levelInfo.xpInLevel} / {levelInfo.xpNeeded} XP
            </Text>
          </View>
          <LinearProgress
            progress={levelInfo.progress}
            color={theme.colors.accentBlue}
            height={8}
            showLabel={false}
          />
        </Card>

        {/* Tab Chips */}
        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <Chip
              key={tab.key}
              label={tab.label}
              selected={activeTab === tab.key}
              onPress={() => setActiveTab(tab.key)}
            />
          ))}
        </View>

        {/* Active Quests */}
        <Text style={styles.sectionTitle}>
          Активні квести ({filteredQuests.active.length})
        </Text>
        {filteredQuests.active.length === 0 ? (
          <EmptyState
            icon="⚔️"
            title="Немає активних квестів"
            description="Завершіть попередні квести або зачекайте оновлення"
          />
        ) : (
          <FlatList
            data={filteredQuests.active}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={<EmptyState icon="⚔️" title="Немає квестів" description="Нові квести з'являться скоро" />}
            renderItem={({ item }) => (
              <View style={styles.questItem}>
                <QuestCard
                  id={item.id}
                  title={item.questTemplateId}
                  description={`${item.type === 'daily' ? 'Щоденний' : item.type === 'weekly' ? 'Тижневий' : 'Сюжетний'} квест`}
                  progress={item.progress}
                  target={item.target}
                  xpReward={item.xpReward}
                  coinReward={item.coinReward}
                  type={item.type}
                  completed={false}
                  onPress={() => {}}
                />
              </View>
            )}
          />
        )}

        {/* Completed Quests */}
        {filteredQuests.completed.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>
              Виконані ({filteredQuests.completed.length})
            </Text>
            <FlatList
              data={filteredQuests.completed}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.questItem}>
                  <QuestCard
                    id={item.id}
                    title={item.questTemplateId}
                    description="Квест виконано"
                    progress={item.target}
                    target={item.target}
                    xpReward={item.xpReward}
                    coinReward={item.coinReward}
                    type={item.type}
                    completed={true}
                    onPress={() => {}}
                  />
                </View>
              )}
            />
          </>
        )}
      </ScreenLayout>
    </>
  );
}

const useQuestHubStyles = createStyles((theme) =>
  StyleSheet.create({
    xpCard: { marginBottom: theme.spacing.md },
    xpHeader: { marginBottom: theme.spacing.sm },
    levelBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.accentPurple,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.semanticRadii.chipRadius,
      marginBottom: theme.spacing.xs,
    },
    levelBadgeText: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    levelTitle: {
      ...theme.typography.headingSmall.style,
      color: theme.colors.textPrimary,
    },
    xpLabel: {
      ...theme.typography.code.style,
      color: theme.colors.textTertiary,
      fontSize: 12,
    },
    tabRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    questItem: { marginBottom: theme.spacing.md },
  }),
);
