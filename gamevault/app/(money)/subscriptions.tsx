import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { formatRelativeTime } from '@/utils/formatters';

export default function SubscriptionsScreen() {
  const theme = useTheme();
  const styles = useSubsStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore();

  const {
    transactions,
    isLoading,
    loadGoals,
    loadTransactions,
    getActiveGoal,
    createTransaction,
    deleteTransaction,
  } = useSavingsStore();

  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addName, setAddName] = useState('');
  const [addAmount, setAddAmount] = useState(0);
  const [addDate, setAddDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await loadGoals();
        await loadTransactions();
      } catch (e: any) {
        setError(e?.message ?? t('common.error'));
      }
    })();
  }, [loadGoals, loadTransactions, t]);

  // Filter transactions for subscriptions (category = 'subscription')
  const subscriptions = useMemo(() => {
    return transactions.filter(
      (tx) =>
        tx.type === 'withdrawal' &&
        (tx.category === 'subscription' || tx.category?.toLowerCase() === 'subscriptions')
    );
  }, [transactions]);

  const monthlyTotal = subscriptions.reduce((s, x) => s + x.amount, 0);

  const fmt = (val: number) => formatCurrency(val, currency);

  const handleCancelSubscription = useCallback(async (txId: string) => {
    try {
      await deleteTransaction(txId);
    } catch (e: any) {
      setError(e?.message ?? t('common.error'));
    }
  }, [deleteTransaction, t]);

  const handleAddSubscription = useCallback(async () => {
    if (addAmount <= 0 || !addName.trim()) return;
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
        type: 'withdrawal',
        amount: addAmount,
        category: 'subscription',
        note: addName.trim(),
      });
      setShowAdd(false);
      setAddName('');
      setAddAmount(0);
      setAddDate('');
    } catch (e: any) {
      setError(e?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }, [addAmount, addName, getActiveGoal, createTransaction, t]);

  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout loading={isLoading} withBottomTabBar>
      <HeaderBar title={t('money.subscriptions.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }]} />

      {/* Totals */}
      <Card style={styles.totalsCard}>
        <View style={styles.totalsRow}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>{t('money.subscriptions.monthlyCost')}</Text>
            <Text style={[styles.totalValue, { color: theme.colors.accentOrange }]}>{fmt(monthlyTotal)}</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>/ {t('money.subscriptions.active')}</Text>
            <Text style={[styles.totalValue, { color: theme.colors.accentPurple }]}>{subscriptions.length}</Text>
          </View>
        </View>
      </Card>

      {/* Subscriptions list */}
      {subscriptions.length === 0 ? (
        <EmptyState icon="🔗" title={t('money.subscriptions.noSubscriptions')} description={t('money.subscriptions.addSubscription')} />
      ) : (
        <View style={styles.subList}>
          {subscriptions.map((sub) => (
            <Card key={sub.id} style={styles.subCard}>
              <View style={styles.subRow}>
                <Text style={styles.subIcon}>🔗</Text>
                <View style={styles.subInfo}>
                  <Text style={styles.subName}>{sub.note ?? sub.category ?? 'Subscription'}</Text>
                  <Text style={styles.subDate}>
                    {sub.createdAt instanceof Date
                      ? formatRelativeTime(sub.createdAt)
                      : formatRelativeTime(new Date(sub.createdAt))}
                  </Text>
                </View>
                <View style={styles.subRight}>
                  <Text style={styles.subAmount}>{fmt(sub.amount)}</Text>
                  <Text style={styles.subCycle}>/міс</Text>
                </View>
              </View>
              <Button
                label={t('money.subscriptions.cancelSubscription')}
                variant="ghost"
                size="sm"
                onPress={() => handleCancelSubscription(sub.id)}
                style={{ alignSelf: 'flex-end', marginTop: theme.spacing.sm }}
              />
            </Card>
          ))}
        </View>
      )}

      {/* Add subscription form */}
      {showAdd && (
        <Card style={styles.addCard}>
          <Text style={styles.addTitle}>{t('money.subscriptions.addSubscription')}</Text>
          <Input label={t('money.subscriptions.title')} placeholder="Назва сервісу" value={addName} onChangeText={setAddName} />
          <AmountInput label={t('money.subscriptions.monthlyCost')} value={addAmount} onChangeAmount={setAddAmount} />
          <Input label={t('money.subscriptions.nextPayment')} placeholder="рррр-мм-дд" keyboardType="numeric" value={addDate} onChangeText={setAddDate} />
          <View style={styles.addButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => { setShowAdd(false); setAddName(''); setAddAmount(0); setAddDate(''); }} />
            <Button label={t('common.add')} size="sm" onPress={handleAddSubscription} loading={saving} disabled={addAmount <= 0 || !addName.trim()} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useSubsStyles = createStyles((theme) =>
  StyleSheet.create({
    totalsCard: { marginTop: theme.spacing.md, padding: theme.spacing.lg },
    totalsRow: { flexDirection: 'row', alignItems: 'center' },
    totalItem: { flex: 1, alignItems: 'center' },
    totalLabel: { ...theme.typography.caption.style, color: theme.colors.textSecondary },
    totalValue: { ...theme.typography.headingSmall.style, marginTop: theme.spacing.xs },
    totalDivider: { width: 1, height: 40, backgroundColor: theme.colors.borderDefault },
    subList: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    subCard: { padding: theme.spacing.md },
    subRow: { flexDirection: 'row', alignItems: 'center' },
    subIcon: { fontSize: 28, marginRight: theme.spacing.sm },
    subInfo: { flex: 1 },
    subName: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    subDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    subRight: { alignItems: 'flex-end' },
    subAmount: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary, fontWeight: '600' },
    subCycle: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
