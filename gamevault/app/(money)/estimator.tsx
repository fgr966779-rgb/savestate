import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AmountInput } from '@/components/ui/AmountInput';
import { Badge } from '@/components/ui/Badge';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

export default function EstimatorScreen() {
  const theme = useTheme();
  const styles = useEstimatorStyles(theme);
  const router = useRouter();
  const { t } = useLocalized();
  const { transactions, loadTransactions, isLoading } = useSavingsStore();

  const [price, setPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Compute monthly savings from deposit transactions in the last 30 days
  const monthlySavings = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return transactions
      .filter(tx => (tx.type === 'deposit' || tx.type === 'bonus') && new Date(tx.createdAt) >= thirtyDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const calculations = useMemo(() => {
    if (price <= 0 || monthlySavings <= 0) return null;
    const monthsNeeded = Math.ceil(price / monthlySavings);
    const weeksNeeded = Math.ceil(monthsNeeded * 4.33);
    const affordDate = new Date();
    affordDate.setMonth(affordDate.getMonth() + monthsNeeded);
    const dateStr = affordDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
    const saveMorePerWeek = price > monthlySavings * 3 ? Math.ceil((price - monthlySavings * 3) / (3 * 4.33)) : 0;
    return { monthsNeeded, weeksNeeded, dateStr, saveMorePerWeek };
  }, [price, monthlySavings]);

  if (isLoading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout>
      <HeaderBar title={t('money.estimator.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />

      <View style={{ marginTop: theme.spacing.md }}>
        <AmountInput label={t('money.estimator.itemPrice')} value={price} onChangeAmount={setPrice} />

        <Text style={styles.savingsNote}>
          {t('money.estimator.subtitle')}: <Text style={{ color: theme.colors.accentGreen, fontWeight: '700' }}>{formatCurrency(monthlySavings)}</Text>
        </Text>

        {calculations && (
          <>
            <Card style={styles.resultCard}>
              <Text style={styles.resultLabel}>{t('money.estimator.timeToSave')}</Text>
              <View style={styles.resultRow}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultValue}>{calculations.monthsNeeded}</Text>
                  <Text style={styles.resultUnit}>{t('money.estimator.months')}</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultItem}>
                  <Text style={styles.resultValue}>{calculations.weeksNeeded}</Text>
                  <Text style={styles.resultUnit}>{t('money.estimator.weeks')}</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.dateCard}>
              <Text style={styles.dateLabel}>{t('money.estimator.affordDate')}</Text>
              <Text style={styles.dateValue}>{calculations.dateStr}</Text>
              <Badge variant="status" text={`~${calculations.monthsNeeded} ${t('money.estimator.monthsShort')}`} status="info" />
            </Card>

            {calculations.saveMorePerWeek > 0 && (
              <Card style={styles.tipCard}>
                <Text style={styles.tipEmoji}>💡</Text>
                <Text style={styles.tipText}>
                  {t('money.estimator.tip', { amount: formatCurrency(calculations.saveMorePerWeek) })}
                </Text>
              </Card>
            )}

            <Button label={t('money.estimator.addToGoal')} fullWidth style={{ marginTop: theme.spacing.xl }} onPress={() => router.push('/(money)/dreams')} />
          </>
        )}

        {price <= 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>{t('money.estimator.enterPrice')}</Text>
            <Text style={styles.emptyDesc}>{t('money.estimator.enterPriceDesc')}</Text>
          </Card>
        )}
      </View>
    </ScreenLayout>
  );
}

const useEstimatorStyles = createStyles((theme) =>
  StyleSheet.create({
    savingsNote: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, marginTop: theme.spacing.lg, textAlign: 'center' },
    resultCard: { marginTop: theme.spacing.xl, alignItems: 'center', padding: theme.spacing.lg },
    resultLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    resultRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.md },
    resultItem: { flex: 1, alignItems: 'center' },
    resultValue: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold },
    resultUnit: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: theme.spacing.xs },
    resultDivider: { width: 1, height: 50, backgroundColor: theme.colors.borderDefault },
    dateCard: { marginTop: theme.spacing.md, alignItems: 'center', padding: theme.spacing.lg },
    dateLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    dateValue: { ...theme.typography.headingSmall.style, color: theme.colors.accentBlue, marginTop: theme.spacing.sm },
    tipCard: { marginTop: theme.spacing.md, flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.sm },
    tipEmoji: { fontSize: 24 },
    tipText: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, flex: 1 },
    emptyCard: { marginTop: theme.spacing.xl, alignItems: 'center', padding: theme.spacing.xl },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary, marginTop: theme.spacing.md },
    emptyDesc: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary, marginTop: theme.spacing.sm, textAlign: 'center' },
  }),
);
