import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { formatRelativeTime } from '@/utils/formatters';

export default function IncomeScreen() {
  const theme = useTheme();
  const styles = useIncomeStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore();

  const {
    goals,
    transactions,
    isLoading,
    loadGoals,
    loadTransactions,
    getActiveGoal,
    createTransaction,
  } = useSavingsStore();

  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addSource, setAddSource] = useState('');
  const [addAmount, setAddAmount] = useState(0);
  const [addFrequency, setAddFrequency] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await loadGoals();
        await loadTransactions(undefined, 50);
      } catch (e: any) {
        setError(e?.message ?? t('common.error'));
      }
    })();
  }, [loadGoals, loadTransactions, t]);

  // Filter transactions: deposits as income, withdrawals as expenses
  const { incomeTransactions, totalMonthlyIncome, totalExpense } = useMemo(() => {
    const deposits = transactions.filter((tx) => tx.type === 'deposit' || tx.type === 'bonus');
    const withdrawals = transactions.filter((tx) => tx.type === 'withdrawal');
    return {
      incomeTransactions: deposits,
      totalMonthlyIncome: deposits.reduce((s, tx) => s + tx.amount, 0),
      totalExpense: withdrawals.reduce((s, tx) => s + tx.amount, 0),
    };
  }, [transactions]);

  const netSavings = totalMonthlyIncome - totalExpense;
  const savingsRate = totalMonthlyIncome > 0 ? Math.round((netSavings / totalMonthlyIncome) * 100) : 0;

  const fmt = (val: number) => formatCurrency(val, currency);

  const handleAddIncome = useCallback(async () => {
    if (addAmount <= 0 || !addSource.trim()) return;
    setSaving(true);
    try {
      const activeGoal = getActiveGoal();
      if (!activeGoal) {
        setError(t('common.error'));
        setSaving(false);
        return;
      }
      await createTransaction({
        goalId: activeGoal.id,
        type: 'deposit',
        amount: addAmount,
        category: 'income',
        note: addSource.trim(),
      });
      setShowAdd(false);
      setAddSource('');
      setAddAmount(0);
      setAddFrequency('');
    } catch (e: any) {
      setError(e?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }, [addAmount, addSource, getActiveGoal, createTransaction, t]);

  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout loading={isLoading} withBottomTabBar>
      <HeaderBar title={t('money.income.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }]} />

      {/* Monthly summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{t('money.income.thisMonth')}</Text>
        <Text style={styles.summaryAmount}>{fmt(totalMonthlyIncome)}</Text>
        <View style={styles.compareRow}>
          <View style={styles.compareItem}>
            <Text style={styles.compareLabel}>{t('money.summary.expenses')}</Text>
            <Text style={[styles.compareValue, { color: theme.colors.accentRed }]}>{fmt(totalExpense)}</Text>
          </View>
          <View style={styles.compareItem}>
            <Text style={styles.compareLabel}>{t('money.budget.remaining')}</Text>
            <Text style={[styles.compareValue, { color: netSavings >= 0 ? theme.colors.accentGreen : theme.colors.accentRed }]}>{fmt(netSavings)}</Text>
          </View>
          <View style={styles.compareItem}>
            <Text style={styles.compareLabel}>{t('money.analytics.savingsRate')}</Text>
            <Text style={[styles.compareValue, { color: savingsRate >= 20 ? theme.colors.accentGreen : theme.colors.accentOrange }]}>{savingsRate}%</Text>
          </View>
        </View>
      </Card>

      {/* Income sources list */}
      {incomeTransactions.length === 0 ? (
        <EmptyState icon="💵" title={t('common.noData')} description={t('money.income.addIncome')} />
      ) : (
        <View style={styles.incomeList}>
          {incomeTransactions.map((tx) => (
            <Card key={tx.id} style={styles.incomeCard}>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeIcon}>💰</Text>
                <View style={styles.incomeInfo}>
                  <Text style={styles.incomeName}>{tx.note ?? tx.category ?? tx.type}</Text>
                  <Text style={styles.incomeFreq}>
                    {tx.createdAt instanceof Date
                      ? formatRelativeTime(tx.createdAt)
                      : formatRelativeTime(new Date(tx.createdAt))}
                  </Text>
                </View>
                <View style={styles.incomeRight}>
                  <Text style={[styles.incomeAmount, { color: theme.colors.accentGreen }]}>+{fmt(tx.amount)}</Text>
                  <Badge variant="status" text={tx.type === 'bonus' ? t('money.income.oneTime') : t('money.income.recurring')} status="success" />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Add income form */}
      {showAdd && (
        <Card style={styles.addCard}>
          <Text style={styles.addTitle}>{t('money.income.addIncome')}</Text>
          <Input label={t('money.income.source')} placeholder={t('money.income.source')} value={addSource} onChangeText={setAddSource} />
          <AmountInput label={t('money.income.amount')} value={addAmount} onChangeAmount={setAddAmount} />
          <Input label={t('money.income.frequency')} placeholder={t('money.income.recurring')} value={addFrequency} onChangeText={setAddFrequency} />
          <View style={styles.addButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => { setShowAdd(false); setAddSource(''); setAddAmount(0); setAddFrequency(''); }} />
            <Button label={t('common.add')} size="sm" onPress={handleAddIncome} loading={saving} disabled={addAmount <= 0 || !addSource.trim()} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useIncomeStyles = createStyles((theme) =>
  StyleSheet.create({
    summaryCard: { marginTop: theme.spacing.md, padding: theme.spacing.lg, alignItems: 'center' },
    summaryLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    summaryAmount: { ...theme.typography.headingLarge.style, color: theme.colors.accentGreen, marginTop: theme.spacing.xs },
    compareRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: theme.spacing.md },
    compareItem: { flex: 1, alignItems: 'center' },
    compareLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    compareValue: { ...theme.typography.bodyMedium.style, fontWeight: '600', marginTop: 2 },
    incomeList: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    incomeCard: { padding: theme.spacing.md },
    incomeRow: { flexDirection: 'row', alignItems: 'center' },
    incomeIcon: { fontSize: 28, marginRight: theme.spacing.sm },
    incomeInfo: { flex: 1 },
    incomeName: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    incomeFreq: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    incomeRight: { alignItems: 'flex-end', gap: 4 },
    incomeAmount: { ...theme.typography.bodyLarge.style, fontWeight: '600' },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
