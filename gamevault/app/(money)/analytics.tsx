import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { LinearProgress } from '@/components/ui/LinearProgress';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency, formatDate } from '@/utils/formatters';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔', transport: '🚌', shopping: '🛍️', housing: '🏠', entertainment: '🎮',
  bills: '📄', health: '💊', education: '📚', subscriptions: '📱', other: '📦',
};

const CATEGORY_COLORS: Record<string, string> = {
  food: '#FF6B00', transport: '#00AAFF', shopping: '#9D4EDD', housing: '#FFD700',
  entertainment: '#00FF88', bills: '#FF4081', health: '#00E5FF', education: '#7C4DFF',
  subscriptions: '#FF9100', other: '#78909C',
};

export default function AnalyticsScreen() {
  const theme = useTheme();
  const styles = useAnalyticsStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore();
  const { transactions, isLoading, loadTransactions, loadGoals } = useSavingsStore();

  const [filter, setFilter] = useState('all');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
    loadTransactions();
  }, [loadGoals, loadTransactions]);

  // Compute spending categories from real transactions
  const { categories, totalExpense, filteredExpenses, categoryNames } = useMemo(() => {
    const withdrawals = transactions.filter(tx => tx.type === 'withdrawal');

    // Build category map
    const catMap: Record<string, number> = {};
    withdrawals.forEach(tx => {
      const cat = tx.category ?? 'other';
      catMap[cat] = (catMap[cat] || 0) + tx.amount;
    });

    const total = withdrawals.reduce((s, tx) => s + tx.amount, 0);

    const cats = Object.entries(catMap)
      .map(([name, amount]) => ({
        id: name,
        name,
        icon: CATEGORY_ICONS[name] ?? '📦',
        amount,
        color: CATEGORY_COLORS[name] ?? '#78909C',
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const catNames = ['all', ...cats.map(c => c.name)];

    const filtered = filter === 'all'
      ? withdrawals.slice(0, 5)
      : withdrawals.filter(tx => (tx.category ?? 'other') === filter).slice(0, 5);

    return { categories: cats, totalExpense: total, filteredExpenses: filtered, categoryNames: catNames };
  }, [transactions, filter]);

  // Compute monthly income/expense comparison from real data
  const monthComparison = useMemo(() => {
    const monthMap: Record<string, { expense: number; income: number }> = {};
    transactions.forEach(tx => {
      const date = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { expense: 0, income: 0 };
      if (tx.type === 'withdrawal') monthMap[key].expense += tx.amount;
      else monthMap[key].income += tx.amount;
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-5)
      .map(([month, data]) => ({
        month: month.split('-')[1],
        ...data,
      }));
  }, [transactions]);

  if (isLoading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  const periodLabels = { daily: t('money.analytics.daily', 'Day'), weekly: t('money.analytics.weekly', 'Week'), monthly: t('money.analytics.monthly', 'Month') };

  return (
    <ScreenLayout>
      <HeaderBar title={t('money.analytics.title')} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        {/* Period selector */}
        <View style={styles.periodRow}>
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <Pressable key={p} style={[styles.periodBtn, period === p && styles.periodBtnActive]} onPress={() => setPeriod(p)}>
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{periodLabels[p]}</Text>
            </Pressable>
          ))}
        </View>

        {/* Top spending categories */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('money.analytics.spendingByCategory')}</Text>
          <Text style={styles.totalLabel}>{t('common.total')}: {formatCurrency(totalExpense, currency)}</Text>
          {categories.length === 0 ? (
            <EmptyState icon="📊" title={t('common.noData')} description="" />
          ) : (
            <View style={styles.categoryList}>
              {categories.map(cat => (
                <View key={cat.id} style={styles.catRow}>
                  <View style={styles.catInfo}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={styles.catName}>{cat.name}</Text>
                  </View>
                  <View style={styles.catRight}>
                    <Text style={styles.catAmount}>{formatCurrency(cat.amount, currency)}</Text>
                    <LinearProgress progress={cat.percentage} color={cat.color} height={6} style={{ width: 80 }} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Trend bars (month over month) */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('stats.charts.monthlyComparison')}</Text>
          {monthComparison.length === 0 ? (
            <EmptyState icon="📈" title={t('common.noData')} description="" />
          ) : (
            <>
              {monthComparison.map(m => {
                const maxVal = Math.max(...monthComparison.map(x => x.expense), ...monthComparison.map(x => x.income), 1);
                const expW = (m.expense / maxVal) * 100;
                const incW = (m.income / maxVal) * 100;
                return (
                  <View key={m.month} style={styles.monthRow}>
                    <Text style={styles.monthLabel}>{m.month}</Text>
                    <View style={styles.monthBars}>
                      <View style={[styles.monthBar, { width: `${incW}%`, backgroundColor: theme.colors.accentGreen }]} />
                      <View style={[styles.monthBar, { width: `${expW}%`, backgroundColor: theme.colors.accentRed }]} />
                    </View>
                  </View>
                );
              })}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.accentGreen }]} /><Text style={styles.legendText}>{t('money.summary.income')}</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.accentRed }]} /><Text style={styles.legendText}>{t('money.summary.expenses')}</Text></View>
              </View>
            </>
          )}
        </Card>

        {/* Top 5 expenses */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('money.analytics.topExpenses', 'Top 5 expenses')}</Text>
          <View style={styles.filterRow}>
            {categoryNames.map(f => (
              <Pressable key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === 'all' ? t('common.all') : f}</Text>
              </Pressable>
            ))}
          </View>
          {filteredExpenses.length === 0 ? (
            <EmptyState icon="💳" title={t('common.noData')} description="" />
          ) : (
            filteredExpenses.map(exp => (
              <View key={exp.id} style={styles.expenseRow}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseName}>{exp.note ?? exp.category ?? t('money.expense.title')}</Text>
                  <Text style={styles.expenseMeta}>{formatDate(exp.createdAt, 'medium')} · {exp.category ?? '—'}</Text>
                </View>
                <Text style={styles.expenseAmount}>{formatCurrency(exp.amount, currency)}</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
}

const useAnalyticsStyles = createStyles((theme) =>
  StyleSheet.create({
    periodRow: { flexDirection: 'row', gap: theme.spacing.sm, backgroundColor: theme.colors.bgTertiary, borderRadius: theme.radii.md, padding: 4 },
    periodBtn: { flex: 1, paddingVertical: theme.spacing.sm, alignItems: 'center', borderRadius: theme.radii.sm },
    periodBtnActive: { backgroundColor: theme.colors.bgSecondary },
    periodText: { ...theme.typography.labelMedium.style, color: theme.colors.textTertiary },
    periodTextActive: { color: theme.colors.textPrimary },
    sectionCard: { marginTop: theme.spacing.md, padding: theme.spacing.md },
    sectionTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary },
    totalLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: theme.spacing.sm },
    categoryList: { marginTop: theme.spacing.md, gap: theme.spacing.md },
    catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    catInfo: { flexDirection: 'row', alignItems: 'center' },
    catIcon: { fontSize: 20, marginRight: theme.spacing.sm },
    catName: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    catRight: { alignItems: 'flex-end', gap: 4 },
    catAmount: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, fontWeight: '600' },
    monthRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    monthLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary, width: 30 },
    monthBars: { flex: 1, flexDirection: 'row', gap: 2 },
    monthBar: { height: 16, borderRadius: theme.radii.xs },
    legendRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    filterRow: { flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.sm, flexWrap: 'wrap' },
    filterChip: { paddingHorizontal: theme.spacing.sm, paddingVertical: 4, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.borderDefault },
    filterChipActive: { borderColor: theme.colors.accentBlue, backgroundColor: `${theme.colors.accentBlue}20` },
    filterText: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    filterTextActive: { color: theme.colors.accentBlue },
    expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSubtle },
    expenseInfo: { flex: 1 },
    expenseName: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    expenseMeta: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    expenseAmount: { ...theme.typography.bodyLarge.style, color: theme.colors.accentRed, fontWeight: '600' },
  }),
);
