import React, { useState, useEffect } from 'react';
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
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function CashbackScreen() {
  const theme = useTheme();
  const styles = useCashbackStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore.getState();

  const { transactions, loadTransactions, createTransaction, deleteTransaction } = useSavingsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSource, setNewSource] = useState('');
  const [newAmount, setNewAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTransactions().then(() => setLoading(false)).catch((e: any) => { setError(e?.message || 'Error'); setLoading(false); });
  }, []);

  const cashbackEntries = transactions.filter(tr => tr.category === 'cashback');

  const totalCashback = cashbackEntries.reduce((s, c) => s + c.amount, 0);

  const handleAdd = async () => {
    if (!newSource.trim() || newAmount <= 0) return;
    setSaving(true);
    try {
      await createTransaction({ goalId: '', type: 'bonus', amount: newAmount, category: 'cashback', note: newSource });
      setShowAdd(false);
      setNewSource('');
      setNewAmount(0);
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteTransaction(id); } catch (e: any) { setError(e?.message || 'Error'); }
  };

  if (loading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.cashback.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }]} />

      {/* Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{t('money.cashback.totalCashback')}</Text>
        <Text style={[styles.summaryAmount, { color: theme.colors.accentGreen }]}>+{formatCurrency(totalCashback, currency)}</Text>
        <View style={styles.pendingRow}>
          <Text style={styles.pendingLabel}>{t('money.cashback.title')}:</Text>
          <Text style={styles.pendingValue}>{cashbackEntries.length}</Text>
          <Badge variant="status" text={t('money.cashback.title')} status="warning" />
        </View>
      </Card>

      {/* Cashback history */}
      {cashbackEntries.length === 0 ? (
        <EmptyState icon="💳" title={t('common.noData')} description={t('money.cashback.title')} />
      ) : (
        <View style={styles.cashbackList}>
          {cashbackEntries.map(entry => (
            <Card key={entry.id} style={styles.cashbackCard}>
              <View style={styles.cashbackRow}>
                <View style={styles.cashbackInfo}>
                  <Text style={styles.cashbackSource}>{entry.note || entry.category}</Text>
                  <Text style={styles.cashbackDate}>{entry.createdAt}</Text>
                </View>
                <View style={styles.cashbackRight}>
                  <Text style={[styles.cashbackAmount, { color: theme.colors.accentGreen }]}>
                    +{formatCurrency(entry.amount, currency)}
                  </Text>
                  <Badge variant="status" text={entry.type} status="success" />
                  <Button label={t('common.delete')} variant="ghost" size="sm" onPress={() => handleDelete(entry.id)} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Add cashback */}
      {showAdd && (
        <Card style={styles.addCard}>
          <Text style={styles.addTitle}>{t('money.cashback.title')}</Text>
          <Input label={t('common.name')} placeholder={t('common.name')} value={newSource} onChangeText={setNewSource} />
          <AmountInput label={t('common.amount')} value={newAmount} onChangeAmount={setNewAmount} />
          <View style={styles.addButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowAdd(false)} />
            <Button label={t('common.add')} size="sm" onPress={handleAdd} loading={saving} disabled={!newSource.trim() || newAmount <= 0} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useCashbackStyles = createStyles((theme) =>
  StyleSheet.create({
    summaryCard: { marginTop: theme.spacing.md, alignItems: 'center', padding: theme.spacing.lg },
    summaryLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    summaryAmount: { ...theme.typography.headingLarge.style, marginTop: theme.spacing.xs },
    pendingRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    pendingLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    pendingValue: { ...theme.typography.bodyMedium.style, color: theme.colors.accentOrange, fontWeight: '600' },
    cashbackList: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    cashbackCard: { padding: theme.spacing.md },
    cashbackRow: { flexDirection: 'row', alignItems: 'center' },
    cashbackInfo: { flex: 1 },
    cashbackSource: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    cashbackDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    cashbackRight: { alignItems: 'flex-end', gap: 4 },
    cashbackAmount: { ...theme.typography.bodyLarge.style, fontWeight: '600' },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
