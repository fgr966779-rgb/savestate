import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { getLevelForXP } from '@/constants/levels';
import { useLocalized } from '@/hooks/useLocalized';

export default function ProfileScreen() {
  const theme = useTheme();
  const styles = useProfileStyles(theme);
  const { t } = useLocalized();
  const { user, signOut } = useAuthStore();
  const { currentStreak, achievements } = useQuestStore();
  const { goals } = useSavingsStore();

  const levelInfo = useMemo(() => {
    if (!user) return { level: 1, title: t('profile.main.novice') };
    return getLevelForXP(user.totalXp);
  }, [user]);

  const goalsCount = goals.length;
  const achievementsCount = achievements.filter((a) => a.unlocked).length;

  const handleSignOut = () => {
    signOut();
    router.replace('/auth/sign-in');
  };

  if (!user) {
    return (
      <>
        <HeaderBar title={t('profile.main.title')} />
        <ScreenLayout>
          <Button label={t('profile.main.signIn')} size="lg" fullWidth onPress={() => router.replace('/auth/sign-in')} />
        </ScreenLayout>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.main.title')} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Avatar + Info */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              size="lg"
              name={user.nickname}
              accentColor={user.avatarColor ?? theme.colors.accentPurple}
              variant="withLevelRing"
              level={user.level}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.nickname}</Text>
              <View style={styles.badgeRow}>
                <Badge variant="level" text={`${t('profile.main.levelBadge')} ${user.level}`} />
                <Badge variant="xp" text={`${user.totalXp.toLocaleString('uk-UA')} ${t('profile.main.xp')}`} />
              </View>
              <Text style={styles.profileTitle}>{levelInfo.title}</Text>
            </View>
          </View>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} onPress={() => router.push('/(tabs)/profile/goals')}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{goalsCount}</Text>
            <Text style={styles.statLabel}>{t('profile.main.goalsStat')}</Text>
          </Card>
          <Card style={styles.statCard} onPress={() => router.push('/(tabs)/quests/streak')}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>{t('profile.main.streak')}</Text>
          </Card>
          <Card style={styles.statCard} onPress={() => router.push('/(tabs)/quests/achievements')}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{achievementsCount}</Text>
            <Text style={styles.statLabel}>{t('profile.main.achievementsStat')}</Text>
          </Card>
        </View>

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>{t('profile.settings.title')}</Text>
        <Card onPress={() => router.push('/(tabs)/profile/edit')} style={styles.linkCard}>
          <Text style={styles.linkIcon}>✏️</Text>
          <Text style={styles.linkLabel}>{t('profile.main.editProfile')}</Text>
          <Text style={styles.linkArrow}>→</Text>
        </Card>
        <Card onPress={() => router.push('/(tabs)/profile/goals')} style={styles.linkCard}>
          <Text style={styles.linkIcon}>🎯</Text>
          <Text style={styles.linkLabel}>{t('profile.goals.title')}</Text>
          <Text style={styles.linkArrow}>→</Text>
        </Card>
        <Card onPress={() => router.push('/(tabs)/profile/settings')} style={styles.linkCard}>
          <Text style={styles.linkIcon}>⚙️</Text>
          <Text style={styles.linkLabel}>{t('profile.settings.title')}</Text>
          <Text style={styles.linkArrow}>→</Text>
        </Card>
        <Card onPress={() => router.push('/(tabs)/profile/about')} style={styles.linkCard}>
          <Text style={styles.linkIcon}>ℹ️</Text>
          <Text style={styles.linkLabel}>{t('profile.settings.about')}</Text>
          <Text style={styles.linkArrow}>→</Text>
        </Card>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button label={t('profile.main.logout')} variant="danger" size="lg" fullWidth onPress={handleSignOut} />
        </View>
      </ScreenLayout>
    </>
  );
}

const useProfileStyles = createStyles((theme) =>
  StyleSheet.create({
    profileCard: { marginBottom: theme.spacing.lg },
    profileHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
    profileInfo: { flex: 1 },
    profileName: { ...theme.typography.headingSmall.style, color: theme.colors.textPrimary },
    badgeRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    profileTitle: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary, fontStyle: 'italic', marginTop: theme.spacing.xs },
    statsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.md },
    statIcon: { fontSize: 20, marginBottom: theme.spacing.xs },
    statValue: { ...theme.typography.statSmall.style, fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary },
    statLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginTop: 2 },
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    linkCard: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, paddingVertical: theme.spacing.md },
    linkIcon: { fontSize: 20, marginRight: theme.spacing.md },
    linkLabel: { flex: 1, ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    linkArrow: { ...theme.typography.bodyLarge.style, color: theme.colors.textTertiary },
    logoutSection: { marginTop: theme.spacing['2xl'] },
  }),
);
