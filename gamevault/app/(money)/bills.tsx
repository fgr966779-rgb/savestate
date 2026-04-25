import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
import { formatCurrency, formatDate } from '@/utils/formatters';

const FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'yearly'];

export default function BillsScreen() {
  const theme = useTheme();
  const styles = useBillsStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore();
  const { transactions, isLoading, loadTransactions, goals, loadGoals, createTransaction, getActiveGoal } = useSavingsStore();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState(0);
  const [newFreq, setNewFreq] = useState('monthly');
  const [newDate, setNewDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGoals();
    loadTransactions();
  }, [loadGoals, loadTransactions]);

  // Filter transactions for bills category
  const bills = transactions.filter(tx => tx.category === 'bills' || tx.category === 'bill');
  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0);

  const freqLabels: Record<string, string> = {
    weekly: t('vault.recurring.weekly'),
    monthly: t('vault.recurring.monthly'),
    quarterly: t('money.bills.quarterly', 'Quarterly'),
    yearly: t('money.bills.yearly', 'Yearly'),
  };

  const handleAdd = useCallback(async () => {
    if (!newName.trim() || newAmount <= 0) return;
    setSaving(true);
    try {
      const activeGoal = getActiveGoal();
      if (activeGoal) {
        await createTransaction({
          goalId: activeGoal.id,
          type: 'withdrawal',
          amount: newAmount,
          category: 'bills',
          note: `${newName} (${freqLabels[newFreq]})${newDate ? ` - ${newDate}` : ''}`,
        });
      }
      setShowAdd(false);
      setNewName('');
      setNewAmount(0);
      setNewFreq('monthly');
      setNewDate('');
    } catch {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  }, [newName, newAmount, newFreq, newDate, getActiveGoal, createTransaction, t, freqLabels]);

  if (isLoading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.bills.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }]} />

      {/* Total monthly */}
      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>{t('money.bills.totalBills')}</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalMonthly, currency)}</Text>
        <Text style={styles.totalCount}>{bills.length} {t('money.bills.recurringBills')}</Text>
      </Card>

      {/* Bills list */}
      {bills.length === 0 ? (
        <EmptyState icon="📄" title={t('money.bills.noBills')} description={t('money.bills.addBill')} />
      ) : (
        <View style={styles.billList}>
          {bills.map(bill => (
            <Card key={bill.id} style={styles.billCard}>
              <View style={styles.billRow}>
                <View style={styles.billInfo}>
                  <Text style={styles.billName}>{bill.note ?? t('money.bills.title')}</Text>
                  <Text style={styles.billFreq}>{bill.category}</Text>
                </View>
                <View style={styles.billRight}>
                  <Text style={styles.billAmount}>{formatCurrency(bill.amount, currency)}</Text>
                  <Badge variant="status" text={formatDate(bill.createdAt, 'short')} status="info" />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Add bill form */}
      {showAdd && (
        <Card style={styles.addCard}>
          <Text style={styles.addTitle}>{t('money.bills.addBill')}</Text>
          <Input label={t('money.bills.billName', 'Name')} placeholder="..." value={newName} onChangeText={setNewName} />
          <AmountInput label={t('common.amount')} value={newAmount} onChangeAmount={setNewAmount} />
          <View style={styles.freqRow}>
            {FREQUENCIES.map(f => (
              <Pressable key={f} style={[styles.freqBtn, newFreq === f && styles.freqBtnActive]} onPress={() => setNewFreq(f)}>
                <Text style={[styles.freqText, newFreq === f && styles.freqTextActive]}>{freqLabels[f]}</Text>
              </Pressable>
            ))}
          </View>
          <Input label={t('vault.recurring.startDate')} placeholder="yyyy-mm-dd" value={newDate} onChangeText={setNewDate} keyboardType="numeric" />
          <View style={styles.addButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowAdd(false)} />
            <Button label={t('common.add')} size="sm" onPress={handleAdd} loading={saving} disabled={!newName.trim() || newAmount <= 0} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useBillsStyles = createStyles((theme) =>
  StyleSheet.create({
    totalCard: { marginTop: theme.spacing.md, alignItems: 'center', padding: theme.spacing.lg },
    totalLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    totalAmount: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.xs },
    totalCount: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: theme.spacing.xs },
    billList: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    billCard: { padding: theme.spacing.md },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    billInfo: { flex: 1 },
    billName: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    billFreq: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    billRight: { alignItems: 'flex-end', gap: 4 },
    billAmount: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary, fontWeight: '600' },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginTop: theme.spacing.sm },
    freqBtn: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.borderDefault },
    freqBtnActive: { borderColor: theme.colors.accentBlue, backgroundColor: `${theme.colors.accentBlue}20` },
    freqText: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    freqTextActive: { color: theme.colors.accentBlue },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
