import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
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
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function LoansScreen() {
  const theme = useTheme();
  const styles = useLoansStyles(theme);
  const router = useRouter();
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

  const loans = transactions.filter(tr => tr.category === 'loan');

  const totalRemaining = loans.reduce((s, l) => s + l.amount, 0);

  const handleAdd = async () => {
    if (!newName.trim() || newAmount <= 0) return;
    setSaving(true);
    try {
      await createTransaction({ goalId: '', type: 'withdrawal', amount: newAmount, category: 'loan', note: newName });
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

  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout loading={loading} withBottomTabBar>
      <HeaderBar title={t('money.loans.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }]} />

      {/* Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('money.loans.activeLoans')}</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.accentRed }]}>{formatCurrency(totalRemaining, currency)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('money.loans.title')}</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.accentOrange }]}>{loans.length}</Text>
          </View>
        </View>
      </Card>

      {/* Loans list */}
      {loans.length === 0 ? (
        <EmptyState icon="🏦" title={t('common.noData')} description={t('money.loans.addLoan')} />
      ) : (
        <View style={styles.loanList}>
          {loans.map(loan => (
            <Card key={loan.id} style={styles.loanCard}>
              <View style={styles.loanHeader}>
                <Text style={styles.loanName}>{loan.note || t('money.loans.title')}</Text>
                <Badge variant="status" text={loan.type} status="warning" />
              </View>
              <View style={styles.loanDetails}>
                <View style={styles.loanDetail}>
                  <Text style={styles.detailLabel}>{t('common.amount')}</Text>
                  <Text style={styles.detailValue}>{formatCurrency(loan.amount, currency)}</Text>
                </View>
                <View style={styles.loanDetail}>
                  <Text style={styles.detailLabel}>{t('money.loans.title')}</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.accentRed }]}>{formatCurrency(loan.amount, currency)}</Text>
                </View>
              </View>
              <Text style={styles.loanDate}>{loan.createdAt}</Text>
              <View style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-end' }}>
                <Button label={t('common.delete')} variant="ghost" size="sm" onPress={() => handleDelete(loan.id)} />
              </View>
            </Card>
          ))}
        </View>
      )}

      {showAdd && (
        <Card style={styles.addCard}>
          <Text style={styles.addTitle}>{t('money.loans.addLoan')}</Text>
          <Input label={t('common.name')} placeholder={t('common.name')} value={newName} onChangeText={setNewName} />
          <AmountInput label={t('common.amount')} value={newAmount} onChangeAmount={setNewAmount} />
          <Input label="%" placeholder="12.5" keyboardType="decimal-pad" value={newRate} onChangeText={setNewRate} />
          <Input label="term" placeholder="48" keyboardType="numeric" value={newTerm} onChangeText={setNewTerm} />
          <View style={styles.addButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowAdd(false)} />
            <Button label={t('common.add')} size="sm" onPress={handleAdd} loading={saving} disabled={!newName.trim() || newAmount <= 0} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useLoansStyles = createStyles((theme) =>
  StyleSheet.create({
    summaryCard: { marginTop: theme.spacing.md, padding: theme.spacing.md },
    summaryRow: { flexDirection: 'row', gap: theme.spacing.md },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryLabel: { ...theme.typography.caption.style, color: theme.colors.textSecondary },
    summaryValue: { ...theme.typography.headingSmall.style, marginTop: theme.spacing.xs },
    loanList: { marginTop: theme.spacing.md, gap: theme.spacing.md },
    loanCard: { padding: theme.spacing.md },
    loanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    loanName: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    loanDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md },
    loanDetail: { alignItems: 'center' },
    detailLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    detailValue: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary, fontWeight: '600', marginTop: 2 },
    loanDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 4 },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
