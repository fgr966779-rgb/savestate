import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Toggle } from '@/components/ui/Toggle';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function TransfersScreen() {
  const theme = useTheme();
  const styles = useTransfersStyles(theme);
  const router = useRouter();
  const { t } = useLocalized();
  const { currency } = useSettingsStore.getState();

  const { transactions, loadTransactions, createTransaction } = useSavingsStore();
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState(0);
  const [recurring, setRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadTransactions().then(() => setLoading(false)).catch((e: any) => { setError(e?.message || 'Error'); setLoading(false); });
  }, []);

  const transfers = transactions.filter(tr => tr.category === 'transfer');

  const handleTransfer = useCallback(async () => {
    if (!fromAccount || !toAccount || amount <= 0) { setFormError(t('common.noData')); return; }
    if (fromAccount === toAccount) { setFormError(t('common.noData')); return; }
    setFormError('');
    setSaving(true);
    try {
      await createTransaction({ goalId: '', type: 'withdrawal', amount, category: 'transfer', note: `${fromAccount} → ${toAccount}` });
      router.back();
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setSaving(false);
    }
  }, [fromAccount, toAccount, amount, router, createTransaction]);

  if (loading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.transfers.title')} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        {/* Transfer form */}
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>{t('money.transfers.newTransfer')}</Text>
          <Input label={t('money.transfers.from')} placeholder={t('money.transfers.from')} value={fromAccount} onChangeText={setFromAccount} />
          <Input label={t('money.transfers.to')} placeholder={t('money.transfers.to')} value={toAccount} onChangeText={setToAccount} />
          <AmountInput label={t('common.amount')} value={amount} onChangeAmount={setAmount} />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <View style={styles.recurringRow}>
            <View style={styles.recurringInfo}>
              <Text style={styles.recurringTitle}>{t('money.transfers.newTransfer')}</Text>
              <Text style={styles.recurringDesc}>{t('money.transfers.title')}</Text>
            </View>
            <Toggle value={recurring} onValueChange={setRecurring} />
          </View>
          <Button label={t('money.transfers.newTransfer')} fullWidth onPress={handleTransfer} loading={saving} style={{ marginTop: theme.spacing.md }} />
        </Card>

        {/* History */}
        <Text style={styles.sectionTitle}>{t('money.transfers.title')}</Text>
        {transfers.length === 0 ? (
          <EmptyState icon="🔄" title={t('common.noData')} description={t('money.transfers.newTransfer')} />
        ) : (
          <View style={styles.transferList}>
            {transfers.map(tr => (
              <Card key={tr.id} style={styles.transferCard}>
                <View style={styles.transferRow}>
                  <View style={styles.transferInfo}>
                    <Text style={styles.transferFlow}>{tr.note || t('money.transfers.title')}</Text>
                    <Text style={styles.transferDate}>{tr.createdAt}</Text>
                  </View>
                  <Text style={styles.transferAmount}>{formatCurrency(tr.amount, currency)}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const useTransfersStyles = createStyles((theme) =>
  StyleSheet.create({
    formCard: { padding: theme.spacing.lg },
    formTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    formError: { ...theme.typography.bodySmall.style, color: theme.colors.accentRed, marginTop: theme.spacing.xs },
    recurringRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md, padding: theme.spacing.md, backgroundColor: theme.colors.bgTertiary, borderRadius: theme.radii.md },
    recurringInfo: { flex: 1 },
    recurringTitle: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    recurringDesc: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    sectionTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary, marginTop: theme.spacing.xl },
    transferList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    transferCard: { padding: theme.spacing.md },
    transferRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    transferInfo: { flex: 1 },
    transferFlow: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    transferDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    transferAmount: { ...theme.typography.bodyLarge.style, color: theme.colors.accentBlue, fontWeight: '600' },
  }),
);
