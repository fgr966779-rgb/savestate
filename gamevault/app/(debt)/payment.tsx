import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AmountInput } from '@/components/ui/AmountInput';
import { Input } from '@/components/ui/Input';
import { LinearProgress } from '@/components/ui/LinearProgress';
import ErrorState from '@/components/ui/ErrorState';
import { useLocalized } from '@/hooks/useLocalized';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { formatCurrency } from '@/utils/formatters';

interface DebtInfo {
  id: string;
  name: string;
  totalAmount: number;
  paid: number;
  remaining: number;
  dueDate: string;
  category: string;
}

export default function PaymentScreen() {
  const theme = useTheme();
  const styles = usePaymentStyles(theme);
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string; amount?: string; paid?: string; dueDate?: string; category?: string }>();
  const { t } = useLocalized();
  const { currency } = useSettingsStore();

  // Build debt info from route params (passed from debt list screen)
  const debt: DebtInfo = {
    id: params.id ?? '',
    name: params.name ?? t('debt.payment.title'),
    totalAmount: Number(params.amount ?? 0),
    paid: Number(params.paid ?? 0),
    remaining: Number(params.amount ?? 0) - Number(params.paid ?? 0),
    dueDate: params.dueDate ?? '',
    category: params.category ?? '',
  };

  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState('');

  const progressPercent = debt.totalAmount > 0 ? (debt.paid / debt.totalAmount) * 100 : 0;
  const newRemaining = debt.remaining - paymentAmount;
  const newProgress = debt.totalAmount > 0 ? ((debt.paid + paymentAmount) / debt.totalAmount) * 100 : 0;
  const isOverpaying = paymentAmount > debt.remaining;

  const handleSave = useCallback(async () => {
    if (paymentAmount <= 0) { setAmountError(t('errors.validation.amountTooSmall')); return; }
    if (isOverpaying) { setAmountError(t('debt.payment.exceedsRemaining', 'Amount exceeds remaining balance')); return; }
    setAmountError('');
    setSaving(true);
    try {
      // Debt payments are tracked locally; simulate persistence
      await new Promise(r => setTimeout(r, 300));
      router.back();
    } catch {
      setError(t('debt.payment.paymentFailed'));
    } finally { setSaving(false); }
  }, [paymentAmount, isOverpaying, router, t]);

  if (error) {
    return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} retryLabel={t('common.retry')} /></ScreenLayout>;
  }

  return (
    <ScreenLayout>
      <HeaderBar title={t('debt.payment.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />

      {/* Debt info card */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('debt.add.creditor')}</Text>
          <Text style={styles.infoValue}>{debt.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('debt.main.totalDebt')}</Text>
          <Text style={styles.infoValue}>{formatCurrency(debt.totalAmount, currency)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('debt.main.remaining')}</Text>
          <Text style={[styles.infoValue, { color: theme.colors.accentRed }]}>{formatCurrency(debt.remaining, currency)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('debt.add.dueDate')}</Text>
          <Text style={styles.infoValue}>{debt.dueDate || '—'}</Text>
        </View>
        <LinearProgress progress={progressPercent} color={theme.colors.accentOrange} showLabel style={{ marginTop: theme.spacing.md }} />
      </Card>

      {/* Payment form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>{t('debt.payment.makePayment')}</Text>
        <AmountInput label={t('debt.payment.amount')} value={paymentAmount} onChangeAmount={setPaymentAmount} maxValue={debt.remaining} />
        {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}

        <Input label={t('debt.payment.date')} placeholder="yyyy-mm-dd" value={paymentDate} onChangeText={setPaymentDate} keyboardType="numeric" style={{ marginTop: theme.spacing.lg }} />

        {/* Preview */}
        {paymentAmount > 0 && !isOverpaying && (
          <Card style={styles.previewCard}>
            <Text style={styles.previewTitle}>{t('debt.payment.afterPayment', 'After payment:')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('debt.payment.newRemaining', 'New remaining')}</Text>
              <Text style={[styles.infoValue, { color: newRemaining === 0 ? theme.colors.accentGreen : theme.colors.accentOrange }]}>
                {formatCurrency(newRemaining, currency)}
              </Text>
            </View>
            <LinearProgress progress={newProgress} color={newProgress >= 100 ? theme.colors.accentGreen : theme.colors.accentOrange} showLabel style={{ marginTop: theme.spacing.sm }} />
            {newRemaining === 0 && <Text style={styles.completeText}>🎉 {t('debt.payment.debtPaid', 'Debt fully paid!')}</Text>}
          </Card>
        )}

        <Button label={t('debt.payment.confirm')} fullWidth onPress={handleSave} loading={saving} style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing['2xl'] }} />
      </View>
    </ScreenLayout>
  );
}

const usePaymentStyles = createStyles((theme) =>
  StyleSheet.create({
    infoCard: { marginTop: theme.spacing.md, padding: theme.spacing.lg },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.sm },
    infoLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    infoValue: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary, fontWeight: '600' },
    formSection: { marginTop: theme.spacing.lg },
    formTitle: { ...theme.typography.headingSmall.style, color: theme.colors.textPrimary },
    errorText: { ...theme.typography.bodySmall.style, color: theme.colors.accentRed, marginTop: theme.spacing.xs },
    previewCard: { marginTop: theme.spacing.lg, padding: theme.spacing.md },
    previewTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary },
    completeText: { ...theme.typography.bodyMedium.style, color: theme.colors.accentGreen, marginTop: theme.spacing.sm, textAlign: 'center' },
  }),
);
