import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/useAuthStore';

type LeaderboardTab = 'global' | 'friends';

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  level: number;
  xp: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

const MOCK_GLOBAL: LeaderboardEntry[] = [
  { rank: 1, nickname: 'DragonSlayer', level: 42, xp: 28500, avatar: '🐉' },
  { rank: 2, nickname: 'SavingsQueen', level: 38, xp: 24100, avatar: '👸' },
  { rank: 3, nickname: 'CoinHunter', level: 35, xp: 21300, avatar: '🪙' },
  { rank: 4, nickname: 'VaultMaster', level: 30, xp: 18900, avatar: '🏦' },
  { rank: 5, nickname: 'BudgetNinja', level: 28, xp: 16700 },
  { rank: 6, nickname: 'StreakKing', level: 25, xp: 14200 },
  { rank: 7, nickname: 'GoalCrusher', level: 22, xp: 12500 },
  { rank: 8, nickname: 'XPFarmer', level: 20, xp: 10800 },
  { rank: 9, nickname: 'SmartSaver', level: 18, xp: 9500 },
  { rank: 10, nickname: 'PennyPincher', level: 15, xp: 7200 },
];

const MOCK_FRIENDS: LeaderboardEntry[] = [
  { rank: 1, nickname: 'Алекс_Fin', level: 25, xp: 16500, avatar: '🧑' },
  { rank: 2, nickname: 'Марія_2024', level: 22, xp: 13800, avatar: '👩' },
  { rank: 3, nickname: 'Олег_Gamer', level: 18, xp: 10200, avatar: '👨' },
];

const PODIUM_MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_SIZES = [88, 72, 72];
const PODIUM_OFFSETS = [0, 16, 16];

export default function LeaderboardScreen() {
  const theme = useTheme();
  const styles = useLeaderboardStyles(theme);
  const [tab, setTab] = useState<LeaderboardTab>('global');
  const user = useAuthStore((s) => s.user);

  const data = tab === 'global' ? MOCK_GLOBAL : MOCK_FRIENDS;
  const podium = data.slice(0, 3);
  const rest = data.slice(3);

  const currentUserRank = 12;
  const currentUserXP = user?.totalXp ?? 3500;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Рейтинг" leftAction={{ icon: '←', onPress: () => {} }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Tab Switch */}
        <View style={styles.tabRow}>
          <Chip label="Глобальний" selected={tab === 'global'} onPress={() => setTab('global')} />
          <Chip label="Друзі" selected={tab === 'friends'} onPress={() => setTab('friends')} />
        </View>

        {/* Podium */}
        <View style={styles.podiumContainer}>
          {podium.map((entry, i) => {
            const order = i === 0 ? 0 : i === 1 ? 1 : 2;
            const podiumEntries = [podium[1], podium[0], podium[2]];
            const pe = podiumEntries[order];
            if (!pe) return null;
            return (
              <View key={pe.rank} style={[styles.podiumItem, { marginTop: PODIUM_OFFSETS[order] }]}>
                <Text style={styles.medal}>{PODIUM_MEDALS[order]}</Text>
                <Avatar
                  size="lg"
                  name={pe.nickname}
                  accentColor={order === 0 ? theme.colors.accentGold : theme.colors.accentBlue}
                />
                <Text style={styles.podiumName} numberOfLines={1}>{pe.nickname}</Text>
                <Text style={styles.podiumLevel}>Рівень {pe.level}</Text>
                <Text style={styles.podiumXP}>{pe.xp.toLocaleString('uk-UA')} XP</Text>
              </View>
            );
          })}
        </View>

        {/* Rest of List */}
        <FlatList
          data={rest}
          keyExtractor={(item) => String(item.rank)}
          scrollEnabled={false}
          ListEmptyComponent={tab === 'friends' ? (
            <EmptyState icon="👥" title="Немає друзів" description="Запросіть друзів, щоб побачити їх у рейтингу" />
          ) : undefined}
          renderItem={({ item }) => (
            <Card style={styles.listItem}>
              <Text style={styles.listRank}>#{item.rank}</Text>
              <Avatar size="sm" name={item.nickname} />
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.nickname}</Text>
                <Text style={styles.listLevel}>Рівень {item.level}</Text>
              </View>
              <Text style={styles.listXP}>{item.xp.toLocaleString('uk-UA')} XP</Text>
            </Card>
          )}
        />

        {/* Current User */}
        <Card variant="outlined" selected style={styles.currentUserCard}>
          <Text style={styles.listRank}>#{currentUserRank}</Text>
          <Avatar size="sm" name={user?.nickname} variant="withLevelRing" level={user?.level} />
          <View style={styles.listInfo}>
            <Text style={[styles.listName, { color: theme.colors.accentBlue }]}>{user?.nickname ?? 'Ви'}</Text>
            <Text style={styles.listLevel}>Рівень {user?.level ?? 1}</Text>
          </View>
          <Text style={[styles.listXP, { color: theme.colors.accentBlue }]}>{currentUserXP.toLocaleString('uk-UA')} XP</Text>
        </Card>
      </ScreenLayout>
    </>
  );
}

const useLeaderboardStyles = createStyles((theme) =>
  StyleSheet.create({
    tabRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    podiumContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: theme.spacing.xl },
    podiumItem: { alignItems: 'center', width: '30%', paddingHorizontal: theme.spacing.xs },
    medal: { fontSize: 28, marginBottom: theme.spacing.xs },
    podiumName: { ...theme.typography.labelMedium.style, color: theme.colors.textPrimary, marginTop: theme.spacing.xs },
    podiumLevel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
    podiumXP: { ...theme.typography.code.style, color: theme.colors.accentGold, fontWeight: '700', fontSize: 12, marginTop: 2 },
    listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, paddingVertical: theme.spacing.md },
    listRank: { ...theme.typography.code.style, color: theme.colors.textTertiary, width: 36, fontWeight: '700' },
    listInfo: { flex: 1, marginLeft: theme.spacing.sm },
    listName: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary },
    listLevel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
    listXP: { ...theme.typography.code.style, color: theme.colors.textSecondary, fontWeight: '700' },
    currentUserCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.md },
  }),
);
