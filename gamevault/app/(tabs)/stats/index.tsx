import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

export default function StatsDashboardScreen() {
  const theme = useTheme();
  const styles = useStatsStyles(theme);
  const { goals, transactions, loadGoals, loadTransactions, isLoading, getTotalBalance } = useSavingsStore();
  const { quests, loadQuests, currentStreak, loadStreak } = useQuestStore();
  const user = useAuthStore((s) => s.user);
  const currency = useSettingsStore((s) => s.currency);
  const { t } = useLocalized();

  useEffect(() => {
    loadGoals();
    loadTransactions();
    loadQuests();
    loadStreak();
  }, [loadGoals, loadTransactions, loadQuests, loadStreak]);

  const totalSaved = useMemo(() => getTotalBalance(), [getTotalBalance, goals, transactions]);
  const totalXP = user?.totalXp ?? 0;
  const questsCompleted = useMemo(() => quests.filter((q) => q.status === 'completed').length, [quests]);

  // Compute mini-chart data: cumulative deposits grouped by week (last 12 weeks)
  const miniChartData = useMemo(() => {
    if (transactions.length === 0) return new Array(12).fill(0.1);
    const now = new Date();
    const depositTx = transactions.filter((tx) => tx.type === 'deposit');
    const weeklyBuckets = new Array(12).fill(0) as number[];
    depositTx.forEach((tx) => {
      const txDate = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
      const weeksAgo = Math.floor((now.getTime() - txDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo >= 0 && weeksAgo < 12) {
        weeklyBuckets[11 - weeksAgo] += tx.amount;
      }
    });
    // Normalize to 0–1 based on max weekly deposit
    const maxVal = Math.max(...weeklyBuckets, 1);
    return weeklyBuckets.map((v) => Math.max(v / maxVal, 0.05));
  }, [transactions]);

  const summaryCards = [
    { icon: '💰', label: t('profile.main.totalSaved', { default: 'Всього збережено' }), value: formatCurrency(totalSaved, currency), color: theme.colors.accentGreen },
    { icon: '⚡', label: t('quests.xp.totalXp', { default: 'XP зароблено' }), value: `${totalXP.toLocaleString('uk-UA')}`, color: theme.colors.accentBlue },
    { icon: '🔥', label: t('quests.streak.currentStreak', { default: 'Поточна серія' }), value: `${currentStreak} ${t('quests.streak.days', { default: 'дн.' })}`, color: theme.colors.accentOrange },
    { icon: '✅', label: t('quests.hub.completed', { default: 'Квестів виконано' }), value: `${questsCompleted}`, color: theme.colors.accentGold },
  ];

  if (isLoading) {
    return (
      <>
        <HeaderBar title={t('stats.dashboard.title', { default: 'Статистика' })} />
        <ScreenLayout loading />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('stats.dashboard.title', { default: 'Статистика' })} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          {summaryCards.map((card) => (
            <Card key={card.label} onPress={() => router.push('/(tabs)/stats/chart')} style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>{card.icon}</Text>
              <Text style={styles.summaryLabel}>{card.label}</Text>
              <Text style={[styles.summaryValue, { color: card.color }]}>{card.value}</Text>
            </Card>
          ))}
        </View>

        {/* Chart Preview */}
        <Card onPress={() => router.push('/(tabs)/stats/chart')} style={styles.chartPreview}>
          <Text style={styles.previewTitle}>{t('stats.charts.savingsTrend', { default: 'Прогрес заощаджень' })}</Text>
          <View style={styles.miniChart}>
            {miniChartData.map((v, i) => (
              <View key={i} style={[styles.miniBar, { height: `${v * 100}%`, backgroundColor: theme.colors.accentBlue }]} />
            ))}
          </View>
          <Text style={styles.previewLink}>{t('common.seeAll', { default: 'Переглянути детальніше' })} →</Text>
        </Card>

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>{t('stats.dashboard.detailed', { default: 'Детально' })}</Text>
        <Card onPress={() => router.push('/(tabs)/stats/patterns')} style={styles.quickLink}>
          <Text style={styles.quickIcon}>📊</Text>
          <View style={styles.quickInfo}>
            <Text style={styles.quickTitle}>{t('stats.patterns.title', { default: 'Патерни' })}</Text>
            <Text style={styles.quickDesc}>{t('stats.patterns.subtitle', { default: 'Аналіз ваших звичок заощадження' })}</Text>
          </View>
        </Card>
        <Card onPress={() => router.push('/(tabs)/stats/forecast')} style={styles.quickLink}>
          <Text style={styles.quickIcon}>🔮</Text>
          <View style={styles.quickInfo}>
            <Text style={styles.quickTitle}>{t('stats.forecast.title', { default: 'Прогноз' })}</Text>
            <Text style={styles.quickDesc}>{t('stats.forecast.subtitle', { default: 'Коли ви досягнете мети?' })}</Text>
          </View>
        </Card>
        <Card onPress={() => router.push('/(tabs)/stats/report')} style={styles.quickLink}>
          <Text style={styles.quickIcon}>📄</Text>
          <View style={styles.quickInfo}>
            <Text style={styles.quickTitle}>{t('stats.report.title', { default: 'Звіт' })}</Text>
            <Text style={styles.quickDesc}>{t('stats.report.subtitle', { default: 'Щомісячний фінансовий звіт' })}</Text>
          </View>
        </Card>
      </ScreenLayout>
    </>
  );
}

const useStatsStyles = createStyles((theme) =>
  StyleSheet.create({
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    summaryCard: { width: '48%', alignItems: 'center', paddingVertical: theme.spacing.md },
    summaryIcon: { fontSize: 24, marginBottom: theme.spacing.xs },
    summaryLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginBottom: 2 },
    summaryValue: { ...theme.typography.statSmall.style, fontSize: 18, fontWeight: '800' },
    chartPreview: { marginBottom: theme.spacing.lg },
    previewTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    miniChart: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4 },
    miniBar: { flex: 1, borderRadius: 3, backgroundColor: theme.colors.accentBlue },
    previewLink: { ...theme.typography.bodyMedium.style, color: theme.colors.accentBlue, marginTop: theme.spacing.sm, textAlign: 'center' },
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    quickLink: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, paddingVertical: theme.spacing.md },
    quickIcon: { fontSize: 24, marginRight: theme.spacing.md },
    quickInfo: { flex: 1 },
    quickTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary },
    quickDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
  }),
);
