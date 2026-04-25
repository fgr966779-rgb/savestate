import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Badge } from '@/components/ui/Badge';
import { useLocalSearchParams } from 'expo-router';

interface FriendStats {
  nickname: string;
  level: number;
  xp: number;
  goalsCompleted: number;
  currentStreak: number;
  achievements: number;
}

const MOCK_FRIEND: FriendStats = {
  nickname: 'Алекс_Fin',
  level: 25,
  xp: 16500,
  goalsCompleted: 3,
  currentStreak: 14,
  achievements: 18,
};

const MOCK_FRIEND_GOALS = [
  { title: 'PlayStation 5', friendProgress: 72, myProgress: 45 },
  { title: 'Новий монітор', friendProgress: 35, myProgress: 60 },
  { title: 'Відпустка', friendProgress: 55, myProgress: 20 },
];

export default function FriendProfileScreen() {
  const theme = useTheme();
  const styles = useFriendProfileStyles(theme);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Профіль друга" leftAction={{ icon: '←', onPress: () => {} }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Profile Header */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar size="lg" name={MOCK_FRIEND.nickname} accentColor={theme.colors.accentBlue} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{MOCK_FRIEND.nickname}</Text>
              <View style={styles.profileBadges}>
                <Badge variant="level" text={`Рівень ${MOCK_FRIEND.level}`} />
                <Badge variant="xp" text={`${MOCK_FRIEND.xp.toLocaleString('uk-UA')} XP`} />
              </View>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{MOCK_FRIEND.goalsCompleted}</Text>
            <Text style={styles.statLabel}>Цілей</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{MOCK_FRIEND.currentStreak}</Text>
            <Text style={styles.statLabel}>Серія</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{MOCK_FRIEND.achievements}</Text>
            <Text style={styles.statLabel}>Досягнень</Text>
          </Card>
        </View>

        {/* Challenge Button */}
        <Button label="⚔️ Кинути виклик" size="lg" fullWidth onPress={() => {}} />
        <Button label="📨 Надіслати запрошення" variant="secondary" size="lg" fullWidth onPress={() => {}} />

        {/* Compare Goals */}
        <Text style={styles.sectionTitle}>Порівняння цілей</Text>
        {MOCK_FRIEND_GOALS.map((goal, i) => {
          const friendBetter = goal.friendProgress > goal.myProgress;
          return (
            <Card key={i} style={styles.compareCard}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <View style={styles.compareRow}>
                <View style={styles.compareSide}>
                  <Text style={styles.compareLabel}>Ви</Text>
                  <LinearProgress progress={goal.myProgress} color={theme.colors.accentBlue} height={6} />
                  <Text style={styles.comparePercent}>{goal.myProgress}%</Text>
                </View>
                <Text style={styles.vsText}>VS</Text>
                <View style={styles.compareSide}>
                  <Text style={styles.compareLabel}>{MOCK_FRIEND.nickname}</Text>
                  <LinearProgress progress={goal.friendProgress} color={friendBetter ? theme.colors.accentGreen : theme.colors.accentOrange} height={6} />
                  <Text style={styles.comparePercent}>{goal.friendProgress}%</Text>
                </View>
              </View>
            </Card>
          );
        })}
      </ScreenLayout>
    </>
  );
}

const useFriendProfileStyles = createStyles((theme) =>
  StyleSheet.create({
    profileCard: { marginBottom: theme.spacing.lg },
    profileHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
    profileInfo: { flex: 1 },
    profileName: { ...theme.typography.headingSmall.style, color: theme.colors.textPrimary },
    profileBadges: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    statsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.md },
    statIcon: { fontSize: 20, marginBottom: theme.spacing.xs },
    statValue: { ...theme.typography.statSmall.style, fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary },
    statLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginTop: 2 },
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginTop: theme.spacing.lg, marginBottom: theme.spacing.md },
    compareCard: { marginBottom: theme.spacing.md },
    goalTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    compareRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    compareSide: { flex: 1 },
    compareLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginBottom: 4 },
    comparePercent: { ...theme.typography.code.style, color: theme.colors.textTertiary, fontSize: 11, marginTop: 4 },
    vsText: { ...theme.typography.labelMedium.style, color: theme.colors.textTertiary, fontWeight: '800' },
  }),
);
