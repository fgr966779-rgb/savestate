import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

const CATEGORY_COLORS = [
  'accentBlue', 'accentGold', 'accentPurple', 'accentGreen', 'accentOrange',
] as const;

const DAY_NAMES_UK = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота', 'Неділя'];
const DAY_NAMES_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function PatternsScreen() {
  const theme = useTheme();
  const styles = usePatternsStyles(theme);
  const { t } = useLocalized();
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useSavingsStore((s) => s.transactions);

  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== 'deposit' && tx.type !== 'bonus') continue;
      const cat = tx.category || t('common.noData', { default: 'Інше' });
      catMap.set(cat, (catMap.get(cat) ?? 0) + tx.amount);
    }
    return Array.from(catMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((cat, i) => ({
        ...cat,
        color: theme.colors[CATEGORY_COLORS[i % CATEGORY_COLORS.length]],
      }));
  }, [transactions, t, theme]);

  const heatmapData = useMemo(() => {
    const now = new Date();
    const data: number[] = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const hasDeposit = transactions.some((tx) => {
        if (tx.type !== 'deposit' && tx.type !== 'bonus') return false;
        const txDate = new Date(tx.createdAt);
        return txDate >= dayStart && txDate <= dayEnd;
      });
      data.push(hasDeposit ? 1 : 0);
    }
    return data;
  }, [transactions]);

  const stats = useMemo(() => {
    const deposits = transactions.filter((tx) => tx.type === 'deposit' || tx.type === 'bonus');
    const avgDeposit = deposits.length > 0
      ? Math.round(deposits.reduce((s, tx) => s + tx.amount, 0) / deposits.length)
      : 0;

    // Consistency: days with deposits / total days in last 30 days
    const now = new Date();
    const totalDays = 30;
    const daysSet = new Set<string>();
    for (const tx of deposits) {
      const txDate = new Date(tx.createdAt);
      const diff = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= totalDays) {
        daysSet.add(txDate.toISOString().split('T')[0]);
      }
    }
    const consistencyScore = Math.round((daysSet.size / totalDays) * 100);

    // Best day of week
    const dayTotals = new Array(7).fill(0);
    for (const tx of deposits) {
      const dow = new Date(tx.createdAt).getDay();
      const idx = dow === 0 ? 6 : dow - 1; // Monday = 0
      dayTotals[idx] += tx.amount;
    }
    const bestDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
    const lang = useSettingsStore.getState().language;
    const bestDay = lang === 'en' ? DAY_NAMES_EN[bestDayIdx] : DAY_NAMES_UK[bestDayIdx];

    return { avgDeposit, consistencyScore, bestDay };
  }, [transactions]);

  const total = categories.reduce((s, c) => s + c.amount, 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('stats.patterns.title', { default: 'Патерни' })} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Heatmap */}
        <Card style={styles.heatmapCard}>
          <Text style={styles.sectionTitle}>{t('stats.charts.dailyActivity', { default: 'Карта активності' })}</Text>
          <View style={styles.heatmapGrid}>
            {heatmapData.map((val, i) => (
              <View
                key={i}
                style={[
                  styles.heatmapCell,
                  { backgroundColor: val ? theme.colors.accentGreen + (i % 5 === 0 ? 'A0' : i % 3 === 0 ? '80' : '50') : theme.colors.bgTertiary },
                ]}
              />
            ))}
          </View>
          <View style={styles.legend}>
            <Text style={styles.legendText}>{t('common.less', { default: 'Менше' })}</Text>
            {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
              <View key={i} style={[styles.legendDot, { backgroundColor: theme.colors.accentGreen, opacity }]} />
            ))}
            <Text style={styles.legendText}>{t('common.more', { default: 'Більше' })}</Text>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statLabel}>{t('stats.patterns.bestDay', { default: 'Найкращий день' })}</Text>
            <Text style={styles.statValue}>{stats.bestDay}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>💵</Text>
            <Text style={styles.statLabel}>{t('stats.calculator.monthlySaving', { default: 'Середнє поповнення' })}</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.avgDeposit, currency)}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statLabel}>{t('stats.patterns.consistency', { default: 'Консистентність' })}</Text>
            <Text style={styles.statValue}>{stats.consistencyScore}%</Text>
          </Card>
        </View>

        {/* Category Breakdown */}
        <Card style={styles.categoryCard}>
          <Text style={styles.sectionTitle}>{t('stats.charts.categoryBreakdown', { default: 'Розподіл за категоріями' })}</Text>
          {categories.length === 0 ? (
            <Text style={styles.emptyText}>{t('common.noData', { default: 'Немає даних' })}</Text>
          ) : (
            categories.map((cat) => {
              const percent = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
              return (
                <View key={cat.name} style={styles.categoryRow}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryAmount}>{formatCurrency(cat.amount, currency)}</Text>
                    <Text style={styles.categoryPercent}>{percent}%</Text>
                  </View>
                  <LinearProgress progress={percent} color={cat.color} height={6} />
                </View>
              );
            })
          )}
        </Card>
      </ScreenLayout>
    </>
  );
}

const usePatternsStyles = createStyles((theme) =>
  StyleSheet.create({
    heatmapCard: { marginBottom: theme.spacing.lg },
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
    heatmapCell: { width: '12%', aspectRatio: 1, borderRadius: 4 },
    legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: theme.spacing.sm },
    legendText: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    legendDot: { width: 12, height: 12, borderRadius: 3 },
    statsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.md },
    statIcon: { fontSize: 20, marginBottom: theme.spacing.xs },
    statLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
    statValue: { ...theme.typography.code.style, color: theme.colors.textPrimary, fontWeight: '700', marginTop: theme.spacing.xs },
    categoryCard: { marginBottom: theme.spacing.lg },
    categoryRow: { marginBottom: theme.spacing.md },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs },
    categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: theme.spacing.sm },
    categoryName: { flex: 1, ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    categoryAmount: { ...theme.typography.code.style, color: theme.colors.textSecondary, marginRight: theme.spacing.sm },
    categoryPercent: { ...theme.typography.code.style, color: theme.colors.textTertiary, width: 36, textAlign: 'right' },
    emptyText: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary, textAlign: 'center', paddingVertical: theme.spacing.md },
  }),
);
