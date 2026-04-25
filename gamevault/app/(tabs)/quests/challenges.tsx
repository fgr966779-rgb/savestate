import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { EmptyState } from '@/components/ui/EmptyState';

interface Challenge {
  id: string;
  friendName: string;
  goal: string;
  duration: string;
  myProgress: number;
  friendProgress: number;
  target: number;
  daysLeft: number;
  status: 'active' | 'completed' | 'waiting';
}

const MOCK_CHALLENGES: Challenge[] = [
  { id: '1', friendName: 'Алекс_Fin', goal: 'Зберегти 2000 ₴', duration: '7 днів', myProgress: 1400, friendProgress: 1100, target: 2000, daysLeft: 3, status: 'active' },
  { id: '2', friendName: 'Марія_2024', goal: '7 днів поспіль', duration: '7 днів', myProgress: 5, friendProgress: 6, target: 7, daysLeft: 2, status: 'active' },
];

const FRIENDS = ['Алекс_Fin', 'Марія_2024', 'Олег_Gamer'];
const GOALS = ['Зберегти 1000 ₴', 'Зберегти 2000 ₴', 'Зберегти 5000 ₴', '7 днів поспіль', '14 днів поспіль'];
const DURATIONS = ['3 дні', '7 днів', '14 днів', '30 днів'];

export default function ChallengesScreen() {
  const theme = useTheme();
  const styles = useChallengesStyles(theme);
  const [tab, setTab] = useState<'active' | 'create'>('active');

  const activeChallenges = MOCK_CHALLENGES.filter((c) => c.status === 'active');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Виклики" leftAction={{ icon: '←', onPress: () => {} }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Tab Chips */}
        <View style={styles.tabRow}>
          <Chip label="Активні" selected={tab === 'active'} onPress={() => setTab('active')} />
          <Chip label="Створити" selected={tab === 'create'} onPress={() => setTab('create')} />
        </View>

        {tab === 'active' ? (
          <>
            {activeChallenges.length === 0 ? (
              <EmptyState icon="⚔️" title="Немає активних викликів" description="Створіть новий виклик або прийміть від друга" />
            ) : (
              activeChallenges.map((challenge) => (
                <Card key={challenge.id} variant="outlined" style={styles.challengeCard}>
                  {/* VS Layout */}
                  <View style={styles.vsRow}>
                    <View style={styles.vsPlayer}>
                      <Avatar size="sm" name="Ви" accentColor={theme.colors.accentBlue} />
                      <Text style={styles.vsName}>Ви</Text>
                      <Text style={styles.vsProgress}>{challenge.myProgress}/{challenge.target}</Text>
                      <LinearProgress progress={(challenge.myProgress / challenge.target) * 100} color={theme.colors.accentBlue} height={6} />
                    </View>
                    <View style={styles.vsCenter}>
                      <Text style={styles.vsText}>VS</Text>
                      <Text style={styles.vsTimer}>⏱ {challenge.daysLeft}дн</Text>
                    </View>
                    <View style={styles.vsPlayer}>
                      <Avatar size="sm" name={challenge.friendName} />
                      <Text style={styles.vsName}>{challenge.friendName}</Text>
                      <Text style={styles.vsProgress}>{challenge.friendProgress}/{challenge.target}</Text>
                      <LinearProgress progress={(challenge.friendProgress / challenge.target) * 100} color={theme.colors.accentOrange} height={6} />
                    </View>
                  </View>
                  <View style={styles.challengeFooter}>
                    <Text style={styles.challengeGoal}>{challenge.goal}</Text>
                    <Chip label={challenge.duration} selected={false} />
                  </View>
                </Card>
              ))
            )}
          </>
        ) : (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Новий виклик</Text>
            <Text style={styles.formLabel}>Оберіть друга</Text>
            <View style={styles.friendRow}>
              {FRIENDS.map((f) => (
                <Chip key={f} label={f} selected={false} onPress={() => {}} />
              ))}
            </View>
            <Text style={styles.formLabel}>Мета</Text>
            <View style={styles.friendRow}>
              {GOALS.map((g) => (
                <Chip key={g} label={g} selected={false} onPress={() => {}} />
              ))}
            </View>
            <Text style={styles.formLabel}>Тривалість</Text>
            <View style={styles.friendRow}>
              {DURATIONS.map((d) => (
                <Chip key={d} label={d} selected={false} onPress={() => {}} />
              ))}
            </View>
            <Button label="⚔️ Створити виклик" size="lg" fullWidth onPress={() => {}} />
          </Card>
        )}
      </ScreenLayout>
    </>
  );
}

const useChallengesStyles = createStyles((theme) =>
  StyleSheet.create({
    tabRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    challengeCard: { marginBottom: theme.spacing.md },
    vsRow: { flexDirection: 'row', alignItems: 'center' },
    vsPlayer: { flex: 1, alignItems: 'center', gap: theme.spacing.xs },
    vsName: { ...theme.typography.labelMedium.style, color: theme.colors.textPrimary },
    vsProgress: { ...theme.typography.code.style, color: theme.colors.textTertiary, fontSize: 11 },
    vsCenter: { alignItems: 'center', marginHorizontal: theme.spacing.sm },
    vsText: { ...theme.typography.headingSmall.style, color: theme.colors.accentRed, fontWeight: '800' },
    vsTimer: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 4 },
    challengeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.borderSubtle },
    challengeGoal: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    formCard: { gap: theme.spacing.md },
    formTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary },
    formLabel: { ...theme.typography.labelMedium.style, color: theme.colors.textSecondary },
    friendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  }),
);
