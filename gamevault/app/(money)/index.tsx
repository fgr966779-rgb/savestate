import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LinearProgress } from '@/components/ui/LinearProgress';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { formatRelativeTime } from '@/utils/formatters';

const WEEK_DATA = [3200, 1800, 4100, 2500, 3900, 2800, 3200];
const MAX_WEEK = Math.max(...WEEK_DATA);

export default function WalletScreen() {
  const theme = useTheme();
  const styles = useWalletStyles(theme);
  const router = useRouter();
  const { t } = useLocalized();
  const { currency } = useSettingsStore();

  const {
    transactions,
    isLoading,
    loadGoals,
    loadTransactions,
    getTotalBalance,
  } = useSavingsStore();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadGoals();
        await loadTransactions(undefined, 10);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? t('common.error'));
      }
    })();
    return () => { cancelled = true; };
  }, [loadGoals, loadTransactions, t]);

  const totalBalance = getTotalBalance();

  const { totalIncome, totalExpense } = useMemo(() => {
    const deposits = transactions.filter((tx) => tx.type === 'deposit' || tx.type === 'bonus');
    const withdrawals = transactions.filter((tx) => tx.type === 'withdrawal');
    return {
      totalIncome: deposits.reduce((s, tx) => s + tx.amount, 0),
      totalExpense: withdrawals.reduce((s, tx) => s + tx.amount, 0),
    };
  }, [transactions]);

  const fmt = (val: number) => formatCurrency(val, currency);

  const handleRetry = useCallback(() => {
    setError(null);
    loadGoals().then(() => loadTransactions(undefined, 10)).catch(() => {});
  }, [loadGoals, loadTransactions]);

  if (error) return <ScreenLayout><ErrorState message={error} onRetry={handleRetry} retryLabel={t('common.retry')} /></ScreenLayout>;

  return (
    <ScreenLayout loading={isLoading} withBottomTabBar>
      <HeaderBar title={t('money.wallet.title')} />

      {/* Balance card */}
      <Card variant="elevated" style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t('money.wallet.totalBalance')}</Text>
        <Text style={styles.balanceAmount}>{fmt(totalBalance)}</Text>
        <View style={styles.balanceActions}>
          <Pressable style={styles.balanceBtn} onPress={() => router.push('/(money)/expense')}>
            <Text style={styles.balanceBtnText}>{t('money.expense.addExpense')}</Text>
          </Pressable>
          <Pressable style={styles.balanceBtn} onPress={() => router.push('/(money)/income')}>
            <Text style={styles.balanceBtnText}>{t('money.income.title')}</Text>
          </Pressable>
          <Pressable style={styles.balanceBtn} onPress={() => router.push('/(money)/transfers')}>
            <Text style={styles.balanceBtnText}>{t('money.transfers.title')}</Text>
          </Pressable>
        </View>
      </Card>

      {/* Income / Expense summary */}
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('money.summary.income')}</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.accentGreen }]}>+{fmt(totalIncome)}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('money.summary.expenses')}</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.accentRed }]}>-{fmt(totalExpense)}</Text>
        </Card>
      </View>

      {/* Mini chart: last 7 days */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>{t('money.expense.thisMonthExpenses')}</Text>
        <View style={styles.chartRow}>
          {WEEK_DATA.map((val, i) => {
            const h = MAX_WEEK > 0 ? (val / MAX_WEEK) * 80 : 0;
            return (
              <View key={i} style={styles.chartBarWrap}>
                <View style={[styles.chartBar, { height: h, backgroundColor: theme.colors.accentBlue }]}>
                  <View style={[styles.chartBarGlow, { height: h, backgroundColor: theme.colors.accentBlueLight, opacity: 0.3 }]} />
                </View>
                <Text style={styles.chartDayLabel}>{['Пн','Вт','Ср','Чт','Пт','Сб','Нд'][i]}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Recent transactions */}
      <Text style={styles.sectionTitle}>{t('money.expense.recent')}</Text>
      <View style={styles.txList}>
        {transactions.length === 0 ? (
          <Card style={styles.txCard}>
            <Text style={styles.txName}>{t('common.noData')}</Text>
          </Card>
        ) : (
          transactions.slice(0, 5).map((tx) => {
            const isDeposit = tx.type === 'deposit' || tx.type === 'bonus';
            const displayAmount = isDeposit ? tx.amount : -tx.amount;
            return (
              <Card key={tx.id} style={styles.txCard}>
                <View style={styles.txRow}>
                  <Text style={styles.txIcon}>{isDeposit ? '💰' : '💸'}</Text>
                  <View style={styles.txInfo}>
                    <Text style={styles.txName}>{tx.note ?? tx.category ?? tx.type}</Text>
                    <Text style={styles.txDate}>
                      {tx.createdAt instanceof Date
                        ? formatRelativeTime(tx.createdAt)
                        : formatRelativeTime(new Date(tx.createdAt))}
                    </Text>
                  </View>
                  <Text style={[styles.txAmount, { color: isDeposit ? theme.colors.accentGreen : theme.colors.accentRed }]}>
                    {displayAmount >= 0 ? '+' : ''}{fmt(displayAmount)}
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </View>
    </ScreenLayout>
  );
}

const useWalletStyles = createStyles((theme) =>
  StyleSheet.create({
    balanceCard: { marginTop: theme.spacing.md, alignItems: 'center', padding: theme.spacing.xl },
    balanceLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    balanceAmount: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.sm },
    balanceActions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.lg },
    balanceBtn: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md, borderRadius: theme.radii.md, backgroundColor: theme.colors.bgTertiary, borderWidth: 1, borderColor: theme.colors.borderDefault },
    balanceBtnText: { ...theme.typography.labelMedium.style, color: theme.colors.textSecondary },
    summaryRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md },
    summaryCard: { flex: 1, padding: theme.spacing.md, alignItems: 'center' },
    summaryLabel: { ...theme.typography.caption.style, color: theme.colors.textSecondary },
    summaryValue: { ...theme.typography.headingSmall.style, marginTop: theme.spacing.xs },
    chartCard: { marginTop: theme.spacing.md, padding: theme.spacing.md },
    chartTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary },
    chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: theme.spacing.md, height: 100 },
    chartBarWrap: { alignItems: 'center', flex: 1 },
    chartBar: { width: 20, borderRadius: theme.radii.sm, position: 'relative', overflow: 'hidden' },
    chartBarGlow: { position: 'absolute', top: 0, left: 0, right: 0 },
    chartDayLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 4 },
    sectionTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary, marginTop: theme.spacing.lg },
    txList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    txCard: { padding: theme.spacing.sm },
    txRow: { flexDirection: 'row', alignItems: 'center' },
    txIcon: { fontSize: 24, marginRight: theme.spacing.sm },
    txInfo: { flex: 1 },
    txName: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    txDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    txAmount: { ...theme.typography.bodyLarge.style, fontWeight: '600' },
  }),
);
