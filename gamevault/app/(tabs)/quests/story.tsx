import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles, applyShadow } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { QuestCard } from '@/components/shared/QuestCard';
import { storyQuests, getStoryChapter } from '@/constants/quests';
import { useQuestStore } from '@/stores/useQuestStore';
import { router } from 'expo-router';

interface ChapterNode {
  chapter: number;
  title: string;
  totalQuests: number;
  completedQuests: number;
  status: 'locked' | 'unlocked' | 'current' | 'completed';
}

export default function StoryQuestsScreen() {
  const theme = useTheme();
  const styles = useStoryStyles(theme);
  const { quests } = useQuestStore();
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  // Build lookup of quest template progress from store
  const storeQuestsById = useMemo(() => {
    const map: Record<string, typeof quests[0]> = {};
    for (const q of quests) map[q.questTemplateId] = q;
    return map;
  }, [quests]);

  const chapters = useMemo<ChapterNode[]>(() => {
    const chapters_so_far_completed: boolean[] = [];
    const chapterTitles = [
      'Розділ 1: Початок шляху',
      'Розділ 2: Битва за бюджет',
      'Розділ 3: Мистецтво накопичення',
      'Розділ 4: Стратегія фінансової фортеці',
      'Розділ 5: Шлях до фінансової свободи',
    ];
    return chapterTitles.map((title, i) => {
      const chapterNum = i + 1;
      const chapterQuests = storyQuests.filter((q) => q.chapter === chapterNum);
      const completed = chapterQuests.filter((q) => storeQuestsById[q.id]?.status === 'completed').length;
      const total = chapterQuests.length;
      const hasActive = chapterQuests.some((q) => storeQuestsById[q.id]?.status === 'active');
      const prevCompleted = i === 0 ? true : chapters_so_far_completed[i - 1];
      chapters_so_far_completed.push(prevCompleted && completed >= total);
      const status: ChapterNode['status'] = completed >= total ? 'completed' : prevCompleted && hasActive ? 'current' : prevCompleted ? 'unlocked' : 'locked';
      return {
        chapter: chapterNum,
        title,
        totalQuests: chapterQuests.length,
        completedQuests: completed,
        status,
      };
    });
  }, []);

  const selectedQuests = useMemo(() => {
    if (selectedChapter === null) return [];
    return storyQuests.filter((q) => q.chapter === selectedChapter);
  }, [selectedChapter]);

  const npcHint = useMemo(() => {
    const hints = [
      '💪 "Кожен крок наближає тебе до мети. Не здавайся!"',
      '🧙 "Таємниця бюджету розкриється перед терплячими."',
      '📜 "Накопичення — це не спринт, а марафон."',
      '🏰 "Твоя фортеця міцна, якщо вона збудована на дисципліні."',
      '🌟 "Фінансова свобода — найвища нагорода."',
    ];
    return selectedChapter !== null ? hints[selectedChapter - 1] ?? hints[0] : hints[0];
  }, [selectedChapter]);

  const getStatusIcon = (status: ChapterNode['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '🔥';
      case 'unlocked': return '🔓';
      default: return '🔒';
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Сюжетні квести" leftAction={{ icon: '←', onPress: () => {} }} />
      <ScreenLayout scrollable withBottomTabBar>
        {selectedChapter === null ? (
          <>
            {/* Chapter Map */}
            <Text style={styles.sectionTitle}>Мапа пригод</Text>
            <View style={styles.mapContainer}>
              {chapters.map((ch, idx) => (
                <View key={ch.chapter} style={styles.mapNode}>
                  {idx > 0 && <View style={styles.mapConnector} />}
                  <Card
                    variant={ch.status === 'current' ? 'glowing' : ch.status === 'completed' ? 'achievement' : 'default'}
                    onPress={ch.status !== 'locked' ? () => setSelectedChapter(ch.chapter) : undefined}
                    selected={ch.status === 'current'}
                    style={[styles.chapterCard, ch.status === 'locked' && styles.lockedCard]}
                  >
                    <View style={styles.chapterHeader}>
                      <Text style={styles.chapterIcon}>{getStatusIcon(ch.status)}</Text>
                      <View style={styles.chapterInfo}>
                        <Text style={[styles.chapterTitle, ch.status === 'locked' && styles.lockedText]}>{ch.title}</Text>
                        <Text style={styles.chapterProgress}>
                          {ch.status === 'locked' ? 'Заблоковано' : `${ch.completedQuests}/${ch.totalQuests} квестів`}
                        </Text>
                      </View>
                      {ch.status !== 'locked' && (
                        <Badge variant="level" text={ch.status === 'completed' ? '100%' : `${Math.round((ch.completedQuests / ch.totalQuests) * 100)}%`} />
                      )}
                    </View>
                  </Card>
                </View>
              ))}
            </View>

            {/* NPC Hint */}
            <Card style={styles.npcCard}>
              <Text style={styles.npcLabel}>Порада наставника</Text>
              <Text style={styles.npcHint}>{npcHint}</Text>
            </Card>
          </>
        ) : (
          <>
            <Chip label="← Назад до мапи" selected={false} onPress={() => setSelectedChapter(null)} />
            <Text style={styles.sectionTitle}>{chapters[selectedChapter - 1].title}</Text>
            <FlatList
              data={selectedQuests}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.questItem}>
                  <QuestCard
                    id={storeQuestsById[item.id]?.id ?? item.id}
                    title={item.title}
                    description={item.description}
                    progress={storeQuestsById[item.id]?.progress ?? 0}
                    target={item.target}
                    xpReward={item.xpReward}
                    coinReward={item.coinReward}
                    type="story"
                    completed={storeQuestsById[item.id]?.status === 'completed'}
                    difficulty={item.difficulty === 'boss' ? 'hard' : 'easy'}
                    iconName={item.iconName}
                  />
                </View>
              )}
            />
            <Card style={styles.npcCard}>
              <Text style={styles.npcHint}>{npcHint}</Text>
            </Card>
          </>
        )}
      </ScreenLayout>
    </>
  );
}

const useStoryStyles = createStyles((theme) =>
  StyleSheet.create({
    sectionTitle: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.lg,
    },
    mapContainer: { gap: theme.spacing.md, marginBottom: theme.spacing.lg },
    mapNode: { position: 'relative' },
    mapConnector: {
      position: 'absolute',
      top: -theme.spacing.md,
      left: 32,
      width: 2,
      height: theme.spacing.md,
      backgroundColor: theme.colors.borderSubtle,
    },
    chapterCard: { width: '100%' },
    lockedCard: { opacity: 0.5 },
    lockedText: { color: theme.colors.textTertiary },
    chapterHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    chapterIcon: { fontSize: 24 },
    chapterInfo: { flex: 1 },
    chapterTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary },
    chapterProgress: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
    npcCard: { marginTop: theme.spacing.lg },
    npcLabel: { ...theme.typography.labelMedium.style, color: theme.colors.accentGold, marginBottom: theme.spacing.xs },
    npcHint: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, fontStyle: 'italic' },
    questItem: { marginBottom: theme.spacing.md },
  }),
);
