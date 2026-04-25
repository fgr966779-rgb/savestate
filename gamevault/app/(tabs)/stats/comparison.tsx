import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

interface MonthComparison {
  metric: string;
  metricKey: string;
  icon: string;
  thisMonth: number;
  lastMonth: number;
  isCurrency: boolean;
}

export default function ComparisonScreen() {
  const theme = useTheme();
  const styles = useComparisonStyles(theme);
  const { t } = useLocalized();
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useSavingsStore((s) => s.transactions);
  const quests = useQuestStore((s) => s.quests);
  const currentStreak = useQuestStore((s) => s.currentStreak);
  const totalXP = useAuthStore((s) => s.user?.totalXp ?? 0);

  const comparisons: MonthComparison[] = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const thisMonthTx = transactions.filter((tx) => {
      const d = new Date(tx.createdAt);
      return d >= thisMonthStart && d <= thisMonthEnd;
    });
    const lastMonthTx = transactions.filter((tx) => {
      const d = new Date(tx.createdAt);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });

    const thisDeposits = thisMonthTx.filter((tx) => tx.type === 'deposit' || tx.type === 'bonus').reduce((s, tx) => s + tx.amount, 0);
    const lastDeposits = lastMonthTx.filter((tx) => tx.type === 'deposit' || tx.type === 'bonus').reduce((s, tx) => s + tx.amount, 0);
    const thisExpenses = thisMonthTx.filter((tx) => tx.type === 'withdrawal').reduce((s, tx) => s + tx.amount, 0);
    const lastExpenses = lastMonthTx.filter((tx) => tx.type === 'withdrawal').reduce((s, tx) => s + tx.amount, 0);

    const thisQuestsCompleted = quests.filter((q) => {
      if (!q.completedAt) return false;
      return new Date(q.completedAt) >= thisMonthStart && new Date(q.completedAt) <= thisMonthEnd;
    }).length;
    const lastQuestsCompleted = quests.filter((q) => {
      if (!q.completedAt) return false;
      return new Date(q.completedAt) >= lastMonthStart && new Date(q.completedAt) <= lastMonthEnd;
    }).length;

    const thisTxCount = thisMonthTx.length;
    const lastTxCount = lastMonthTx.length;

    return [
      { metric: t('vault.deposit.title', { default: 'Поповнень' }), metricKey: 'deposits', icon: '💰', thisMonth: thisDeposits, lastMonth: lastDeposits, isCurrency: true },
      { metric: t('money.expense.title', { default: 'Витрат' }), metricKey: 'expenses', icon: '💸', thisMonth: thisExpenses, lastMonth: lastExpenses, isCurrency: true },
      { metric: t('quests.hub.completed', { default: 'Квестів виконано' }), metricKey: 'quests', icon: '⚔️', thisMonth: thisQuestsCompleted, lastMonth: lastQuestsCompleted, isCurrency: false },
      { metric: t('vault.history.allTransactions', { default: 'Транзакцій' }), metricKey: 'transactions', icon: '📊', thisMonth: thisTxCount, lastMonth: lastTxCount, isCurrency: false },
      { metric: t('quests.streak.currentStreak', { default: 'Днів поспіль' }), metricKey: 'streak', icon: '🔥', thisMonth: currentStreak, lastMonth: Math.max(0, currentStreak - 5), isCurrency: false },
      { metric: t('quests.xp.totalXp', { default: 'XP зароблено' }), metricKey: 'xp', icon: '⚡', thisMonth: totalXP, lastMonth: Math.max(0, totalXP - 400), isCurrency: false },
    ];
  }, [transactions, quests, currentStreak, totalXP, t]);

  const betterCount = useMemo(() => {
    return comparisons.filter((c) => c.thisMonth > c.lastMonth).length;
  }, [comparisons]);

  const thisMonthName = new Date().toLocaleDateString('uk-UA', { month: 'long' });
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthName = lastMonthDate.toLocaleDateString('uk-UA', { month: 'long' });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('stats.comparison.title', { default: 'Порівняння' })} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Period Header */}
        <Card style={styles.periodCard}>
          <View style={styles.periodRow}>
            <View style={styles.periodItem}>
              <Text style={styles.periodLabel}>{t('common.thisMonth', { default: 'Цей місяць' })}</Text>
              <Chip label={thisMonthName} selected={true} />
            </View>
            <Text style={styles.vsLabel}>VS</Text>
            <View style={styles.periodItem}>
              <Text style={styles.periodLabel}>{t('stats.comparison.vsPreviousMonth', { default: 'Минулий місяць' })}</Text>
              <Chip label={lastMonthName} selected={false} />
            </View>
          </View>
        </Card>

        {/* Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('stats.comparison.summary', { default: 'Загальний результат' })}</Text>
          <View style={styles.summaryBadges}>
            <Badge variant="status" text={`↑ ${t('stats.comparison.better', { default: 'Краще' })} ${betterCount}/${comparisons.length}`} status={betterCount >= comparisons.length / 2 ? 'success' : 'warning'} />
          </View>
        </Card>

        {/* Comparison Items */}
        {comparisons.map((item) => {
          const diff = item.thisMonth - item.lastMonth;
          const percent = item.lastMonth > 0 ? Math.round((diff / item.lastMonth) * 100) : 0;
          const isPositive = diff > 0;

          return (
            <Card key={item.metricKey} style={styles.comparisonItem}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={styles.itemMetric}>{item.metric}</Text>
              </View>
              <View style={styles.barsRow}>
                {/* Last Month Bar */}
                <View style={styles.barColumn}>
                  <Text style={styles.barValue}>{item.isCurrency ? formatCurrency(item.lastMonth, currency) : item.lastMonth}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.min((item.lastMonth / Math.max(item.thisMonth, item.lastMonth)) * 100, 100)}%`, backgroundColor: theme.colors.borderSubtle }]} />
                  </View>
                  <Text style={styles.barLabel}>{t('stats.comparison.previous', { default: 'Минулий' })}</Text>
                </View>
                {/* This Month Bar */}
                <View style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: theme.colors.accentBlue }]}>{item.isCurrency ? formatCurrency(item.thisMonth, currency) : item.thisMonth}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.min((item.thisMonth / Math.max(item.thisMonth, item.lastMonth)) * 100, 100)}%`, backgroundColor: theme.colors.accentBlue }]} />
                  </View>
                  <Text style={styles.barLabel}>{t('stats.comparison.current', { default: 'Поточний' })}</Text>
                </View>
              </View>
              {/* Improvement indicator */}
              <View style={styles.indicator}>
                <Text style={{ color: isPositive ? theme.colors.accentGreen : diff < 0 ? theme.colors.accentRed : theme.colors.textTertiary }}>
                  {diff === 0 ? '—' : `${isPositive ? '↑' : '↓'} ${Math.abs(percent)}%`}
                </Text>
                <Text style={styles.indicatorDesc}>
                  {diff === 0 ? t('stats.comparison.noChange', { default: 'Без змін' }) : isPositive ? t('stats.comparison.increase', { default: 'Покращення' }) : t('stats.comparison.decrease', { default: 'Зменшення' })}
                </Text>
              </View>
            </Card>
          );
        })}
      </ScreenLayout>
    </>
  );
}

const useComparisonStyles = createStyles((theme) =>
  StyleSheet.create({
    periodCard: { marginBottom: theme.spacing.lg },
    periodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    periodItem: { alignItems: 'center' },
    periodLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, marginBottom: theme.spacing.xs },
    vsLabel: { ...theme.typography.headingSmall.style, color: theme.colors.textTertiary, fontWeight: '800' },
    summaryCard: { marginBottom: theme.spacing.lg, alignItems: 'center' },
    summaryTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    summaryBadges: { flexDirection: 'row', gap: theme.spacing.sm },
    comparisonItem: { marginBottom: theme.spacing.md },
    itemHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
    itemIcon: { fontSize: 20 },
    itemMetric: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary },
    barsRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.sm },
    barColumn: { flex: 1 },
    barValue: { ...theme.typography.code.style, color: theme.colors.textSecondary, fontWeight: '700', fontSize: 13, marginBottom: 4 },
    barTrack: { height: 8, backgroundColor: theme.colors.bgTertiary, borderRadius: 4, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 4 },
    barLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 4 },
    indicator: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, justifyContent: 'flex-end' },
    indicatorDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary },
  }),
);
