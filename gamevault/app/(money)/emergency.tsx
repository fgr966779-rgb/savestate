import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LinearProgress } from '@/components/ui/LinearProgress';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

const CATEGORY_ICONS: Record<string, string> = {
  'Транспорт': '🚗',
  'Медицина': '🏥',
  'Ремонт': '🔧',
  default: '💰',
};

export default function EmergencyScreen() {
  const theme = useTheme();
  const styles = useEmergencyStyles(theme);
  const { t } = useLocalized();
  const { goals, transactions, loadGoals, loadTransactions, isLoading } = useSavingsStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
    loadTransactions();
  }, [loadGoals, loadTransactions]);

  const emergencyGoal = useMemo(() => goals.find(g => g.status === 'active'), [goals]);
  const totalBalance = useSavingsStore(state => state.getTotalBalance());

  const targetAmount = emergencyGoal?.targetAmount ?? 75000;
  const currentAmount = emergencyGoal?.currentAmount ?? totalBalance;

  // Compute monthly contribution from deposit transactions in the last 30 days
  const monthlyContribution = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return transactions
      .filter(tx => tx.type === 'deposit' && new Date(tx.createdAt) >= thirtyDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  // Withdrawals from the emergency goal
  const withdrawals = useMemo(() => {
    if (!emergencyGoal) return [];
    return transactions
      .filter(tx => tx.goalId === emergencyGoal.id && tx.type === 'withdrawal')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(tx => ({
        id: tx.id,
        date: tx.createdAt,
        amount: tx.amount,
        reason: tx.note ?? tx.category ?? t('money.emergency.withdrawal'),
      }));
  }, [transactions, emergencyGoal, t]);

  const percentage = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
  const remaining = Math.max(0, targetAmount - currentAmount);
  const monthsToTarget = monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : 0;

  const isLoadingState = isLoading || loading;
  if (isLoadingState) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout>
      <HeaderBar title={t('money.emergency.title')} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        {/* Progress card */}
        <Card style={styles.progressCard}>
          <Text style={styles.progressLabel}>{t('money.emergency.title')}</Text>
          <Text style={styles.progressAmount}>{formatCurrency(currentAmount)}</Text>
          <Text style={styles.progressTarget}>{t('money.emergency.target')}: {formatCurrency(targetAmount)}</Text>
          <LinearProgress progress={percentage} color={percentage >= 100 ? theme.colors.accentGreen : theme.colors.accentBlue} height={8} showLabel style={{ marginTop: theme.spacing.md }} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('money.emergency.remaining')}</Text>
              <Text style={[styles.statValue, { color: theme.colors.accentOrange }]}>{formatCurrency(remaining)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('money.emergency.monthsToTarget')}</Text>
              <Text style={[styles.statValue, { color: theme.colors.accentBlue }]}>{monthsToTarget}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('money.emergency.monthly')}</Text>
              <Text style={[styles.statValue, { color: theme.colors.accentGreen }]}>{formatCurrency(monthlyContribution)}</Text>
            </View>
          </View>
        </Card>

        {/* Contribution plan */}
        <Card style={styles.planCard}>
          <Text style={styles.planTitle}>{t('money.emergency.planTitle')}</Text>
          <View style={styles.planRow}>
            <Text style={styles.planLabel}>{t('money.emergency.monthlyContribution')}</Text>
            <Text style={styles.planValue}>{formatCurrency(monthlyContribution)}</Text>
          </View>
          <View style={styles.planRow}>
            <Text style={styles.planLabel}>{t('money.emergency.progress')}</Text>
            <Text style={styles.planValue}>{percentage}%</Text>
          </View>
          <Button label={t('money.emergency.addFunds')} variant="secondary" size="sm" onPress={() => {}} style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-start' }} />
        </Card>

        {/* Withdrawals history */}
        <Text style={styles.sectionTitle}>{t('money.emergency.withdrawalHistory')}</Text>
        {withdrawals.length === 0 ? (
          <EmptyState icon="🔒" title={t('money.emergency.noWithdrawals')} description={t('money.emergency.noWithdrawalsDesc')} />
        ) : (
          <View style={styles.withdrawalList}>
            {withdrawals.map(w => (
              <Card key={w.id} style={styles.withdrawalCard}>
                <View style={styles.withdrawalRow}>
                  <View style={styles.withdrawalInfo}>
                    <Text style={styles.withdrawalReason}>{w.reason}</Text>
                    <Text style={styles.withdrawalDate}>{typeof w.date === 'string' ? w.date.split('T')[0] : String(w.date)}</Text>
                  </View>
                  <Text style={[styles.withdrawalAmount, { color: theme.colors.accentRed }]}>-{formatCurrency(w.amount)}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const useEmergencyStyles = createStyles((theme) =>
  StyleSheet.create({
    progressCard: { padding: theme.spacing.lg, alignItems: 'center' },
    progressLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    progressAmount: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.sm },
    progressTarget: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: theme.spacing.xs },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: theme.spacing.lg },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    statValue: { ...theme.typography.bodyLarge.style, fontWeight: '700', marginTop: 2 },
    planCard: { marginTop: theme.spacing.md, padding: theme.spacing.md },
    planTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary },
    planRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.sm, alignItems: 'center' },
    planLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    planValue: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary, fontWeight: '600' },
    sectionTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary, marginTop: theme.spacing.xl },
    withdrawalList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    withdrawalCard: { padding: theme.spacing.md },
    withdrawalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    withdrawalInfo: { flex: 1 },
    withdrawalReason: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    withdrawalDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    withdrawalAmount: { ...theme.typography.bodyLarge.style, fontWeight: '700' },
  }),
);
