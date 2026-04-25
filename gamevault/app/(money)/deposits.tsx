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

export default function DepositsScreen() {
  const theme = useTheme();
  const styles = useDepositsStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore.getState();

  const { transactions, loadTransactions, createTransaction, deleteTransaction } = useSavingsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState(0);
  const [newRate, setNewRate] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTransactions().then(() => setLoading(false)).catch((e: any) => { setError(e?.message || 'Error'); setLoading(false); });
  }, []);

  const deposits = transactions.filter(tr => tr.type === 'deposit');

  const totalAmount = deposits.reduce((s, d) => s + d.amount, 0);

  const handleAdd = async () => {
    if (!newName.trim() || newAmount <= 0) return;
    setSaving(true);
    try {
      await createTransaction({ goalId: '', type: 'deposit', amount: newAmount, category: 'deposit', note: newName });
      setShowAdd(false);
      setNewName('');
      setNewAmount(0);
      setNewRate('');
      setNewTerm('');
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
      <HeaderBar title={t('money.deposits.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }]} />

      {/* Total overview */}
      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>{t('money.deposits.title')}</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalAmount, currency)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('money.deposits.title')}</Text>
            <Text style={styles.statValue}>{deposits.length}</Text>
          </View>
        </View>
      </Card>

      {/* Deposits list */}
      {deposits.length === 0 ? (
        <EmptyState icon="🏦" title={t('common.noData')} description={t('money.deposits.addDeposit')} />
      ) : (
        <View style={styles.depositList}>
          {deposits.map(dep => (
            <Card key={dep.id} style={styles.depositCard}>
              <View style={styles.depositHeader}>
                <Text style={styles.depositBank}>{dep.note || dep.category || t('money.deposits.title')}</Text>
                <Badge variant="status" text="%" status="success" />
              </View>
              <Text style={styles.depositAmount}>{formatCurrency(dep.amount, currency)}</Text>
              <Text style={styles.depositDate}>{dep.createdAt}</Text>
              <View style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-end' }}>
                <Button label={t('common.delete')} variant="ghost" size="sm" onPress={() => handleDelete(dep.id)} />
              </View>
            </Card>
          ))}
        </View>
      )}

      {showAdd && (
        <Card style={styles.addCard}>
          <Text style={styles.addTitle}>{t('money.deposits.addDeposit')}</Text>
          <Input label={t('common.name')} placeholder={t('common.name')} value={newName} onChangeText={setNewName} />
          <AmountInput label={t('common.amount')} value={newAmount} onChangeAmount={setNewAmount} />
          <Input label="%" placeholder="12.0" keyboardType="decimal-pad" value={newRate} onChangeText={setNewRate} />
          <Input label="term" placeholder="12" keyboardType="numeric" value={newTerm} onChangeText={setNewTerm} />
          <View style={styles.addButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowAdd(false)} />
            <Button label={t('common.add')} size="sm" onPress={handleAdd} loading={saving} disabled={!newName.trim() || newAmount <= 0} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useDepositsStyles = createStyles((theme) =>
  StyleSheet.create({
    totalCard: { marginTop: theme.spacing.md, alignItems: 'center', padding: theme.spacing.lg },
    totalLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    totalAmount: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.xs },
    statsRow: { flexDirection: 'row', gap: theme.spacing.xl, marginTop: theme.spacing.md },
    statItem: { alignItems: 'center' },
    statLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    statValue: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary, fontWeight: '700', marginTop: 2 },
    depositList: { marginTop: theme.spacing.md, gap: theme.spacing.md },
    depositCard: { padding: theme.spacing.md },
    depositHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    depositBank: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary, fontWeight: '600' },
    depositAmount: { ...theme.typography.headingSmall.style, color: theme.colors.accentGold, marginTop: theme.spacing.sm },
    depositDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 4 },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
