import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Badge } from '@/components/ui/Badge';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

export default function SummaryScreen() {
  const theme = useTheme();
  const styles = useSummaryStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore();
  const { goals, transactions, isLoading, loadGoals, loadTransactions, getTotalBalance } = useSavingsStore();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
    loadTransactions();
  }, [loadGoals, loadTransactions]);

  // Compute financial summary from real store data
  const { assets, liabilities, income, expenses } = useMemo(() => {
    const totalBalance = getTotalBalance();

    // Assets = total current savings across all goals
    const totalAssets = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    // Liabilities = sum of target amounts not yet reached (remaining to save)
    const totalLiabilities = goals.reduce((sum, g) => {
      const remaining = Math.max(g.targetAmount - g.currentAmount, 0);
      return sum + remaining;
    }, 0);

    // Income = sum of deposits + bonuses
    const totalIncome = transactions
      .filter(tx => tx.type === 'deposit' || tx.type === 'bonus')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Expenses = sum of withdrawals
    const totalExpenses = transactions
      .filter(tx => tx.type === 'withdrawal')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return { assets: totalAssets, liabilities: totalLiabilities, income: totalIncome, expenses: totalExpenses };
  }, [goals, transactions, getTotalBalance]);

  const netWorth = assets - liabilities;
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const monthlySurplus = income - expenses;

  if (isLoading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.summary.title')} />

      {/* Net Worth */}
      <Card variant="elevated" style={styles.netWorthCard}>
        <Text style={styles.netWorthLabel}>{t('money.analytics.netWorth')}</Text>
        <Text style={[styles.netWorthAmount, { color: netWorth >= 0 ? theme.colors.accentGreen : theme.colors.accentRed }]}>
          {netWorth >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netWorth), currency)}
        </Text>
        <Badge
          variant="status"
          text={netWorth >= 0 ? t('money.summary.positive', 'Positive') : t('money.summary.negative', 'Negative')}
          status={netWorth >= 0 ? 'success' : 'error'}
        />
      </Card>

      {/* Assets vs Liabilities */}
      <View style={styles.balanceRow}>
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('money.summary.assets', 'Assets')}</Text>
          <Text style={[styles.balanceValue, { color: theme.colors.accentGreen }]}>{formatCurrency(assets, currency)}</Text>
          <Text style={styles.balanceDesc}>{t('money.summary.savingsDesc', 'Savings + deposits')}</Text>
        </Card>
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('money.summary.liabilities', 'Liabilities')}</Text>
          <Text style={[styles.balanceValue, { color: theme.colors.accentRed }]}>{formatCurrency(liabilities, currency)}</Text>
          <Text style={styles.balanceDesc}>{t('money.summary.liabilitiesDesc', 'Remaining goals')}</Text>
        </Card>
      </View>

      {/* Assets/Liabilities ratio */}
      <Card style={styles.ratioCard}>
        <Text style={styles.ratioLabel}>{t('money.summary.ratioLabel', 'Assets to Liabilities Ratio')}</Text>
        {((assets + liabilities) > 0) && (
          <>
            <LinearProgress
              progress={liabilities > 0 ? Math.min((assets / (assets + liabilities)) * 100, 100) : 100}
              color={theme.colors.accentGreen}
              height={10}
              showLabel
              style={{ marginTop: theme.spacing.sm }}
            />
            <View style={styles.ratioLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.accentGreen }]} />
                <Text style={styles.legendText}>
                  {t('money.summary.assets', 'Assets')} {(assets + liabilities) > 0 ? Math.round(assets / (assets + liabilities) * 100) : 0}%
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.accentRed }]} />
                <Text style={styles.legendText}>
                  {t('money.summary.liabilities', 'Liabilities')} {liabilities > 0 ? Math.round(liabilities / (assets + liabilities) * 100) : 0}%
                </Text>
              </View>
            </View>
          </>
        )}
      </Card>

      {/* Income vs Expenses */}
      <Card style={styles.monthlyCard}>
        <Text style={styles.monthlyTitle}>{t('money.summary.monthly', 'Monthly balance')}</Text>
        <View style={styles.monthlyRow}>
          <View style={styles.monthlyItem}>
            <Text style={styles.monthlyLabel}>{t('money.summary.income')}</Text>
            <Text style={[styles.monthlyValue, { color: theme.colors.accentGreen }]}>+{formatCurrency(income, currency)}</Text>
          </View>
          <View style={styles.monthlyItem}>
            <Text style={styles.monthlyLabel}>{t('money.summary.expenses')}</Text>
            <Text style={[styles.monthlyValue, { color: theme.colors.accentRed }]}>-{formatCurrency(expenses, currency)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.surplusRow}>
          <Text style={styles.surplusLabel}>{t('money.summary.net')}</Text>
          <Text style={[styles.surplusValue, { color: monthlySurplus >= 0 ? theme.colors.accentGreen : theme.colors.accentRed }]}>
            {monthlySurplus >= 0 ? '+' : ''}{formatCurrency(monthlySurplus, currency)}
          </Text>
        </View>
      </Card>

      {/* Savings rate */}
      <Card style={styles.savingsCard}>
        <Text style={styles.savingsLabel}>{t('money.analytics.savingsRate')}</Text>
        <LinearProgress
          progress={savingsRate}
          color={savingsRate >= 20 ? theme.colors.accentGreen : theme.colors.accentOrange}
          height={12}
          showLabel
          style={{ marginTop: theme.spacing.sm }}
        />
        <Text style={styles.savingsHint}>
          {savingsRate >= 20
            ? t('money.summary.savingsGreat', '🎉 Great result! Recommended 20%+')
            : t('money.summary.savingsHint', '💡 Recommended to save at least 20% of income')}
        </Text>
      </Card>
    </ScreenLayout>
  );
}

const useSummaryStyles = createStyles((theme) =>
  StyleSheet.create({
    netWorthCard: { marginTop: theme.spacing.md, alignItems: 'center', padding: theme.spacing.xl },
    netWorthLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    netWorthAmount: { ...theme.typography.headingLarge.style, marginTop: theme.spacing.sm, fontSize: 36 },
    balanceRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md },
    balanceCard: { flex: 1, padding: theme.spacing.md, alignItems: 'center' },
    balanceLabel: { ...theme.typography.caption.style, color: theme.colors.textSecondary },
    balanceValue: { ...theme.typography.headingSmall.style, marginTop: theme.spacing.xs },
    balanceDesc: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    ratioCard: { marginTop: theme.spacing.md, padding: theme.spacing.md },
    ratioLabel: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary },
    ratioLegend: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { ...theme.typography.caption.style, color: theme.colors.textSecondary },
    monthlyCard: { marginTop: theme.spacing.md, padding: theme.spacing.lg },
    monthlyTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary },
    monthlyRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md },
    monthlyItem: { alignItems: 'center' },
    monthlyLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    monthlyValue: { ...theme.typography.headingSmall.style, marginTop: 2 },
    divider: { height: 1, backgroundColor: theme.colors.borderSubtle, marginVertical: theme.spacing.md },
    surplusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    surplusLabel: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    surplusValue: { ...theme.typography.headingSmall.style, fontWeight: '700' },
    savingsCard: { marginTop: theme.spacing.md, padding: theme.spacing.lg },
    savingsLabel: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary },
    savingsHint: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, textAlign: 'center' },
  }),
);
