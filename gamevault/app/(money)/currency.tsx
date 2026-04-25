import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function CurrencyScreen() {
  const theme = useTheme();
  const styles = useCurrencyStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore.getState();

  const { getTotalBalance, loadTransactions } = useSavingsStore();
  const [convertFrom, setConvertFrom] = useState('');
  const [convertTo, setConvertTo] = useState('');
  const [convertAmount, setConvertAmount] = useState(0);
  const [showConvert, setShowConvert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions().then(() => setLoading(false)).catch((e: any) => { setError(e?.message || 'Error'); setLoading(false); });
  }, []);

  const totalBalance = getTotalBalance();

  if (loading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.currency.title')} rightActions={[{ icon: '🔄', onPress: () => setShowConvert(!showConvert) }]} />

      {/* Total */}
      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>{t('money.currency.baseCurrency')}</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalBalance, currency)}</Text>
      </Card>

      {/* Empty state — currency service not yet implemented */}
      <EmptyState icon="💱" title={t('common.noData')} description={t('money.currency.title')} />

      {/* Converter */}
      {showConvert && (
        <Card style={styles.convertCard}>
          <Text style={styles.convertTitle}>{t('money.currency.exchangeRate')}</Text>
          <View style={{ marginTop: theme.spacing.md }}>
            <AmountInput label={t('common.amount')} value={convertAmount} onChangeAmount={setConvertAmount} />
          </View>
          <View style={styles.convertRow}>
            <View style={{ flex: 1 }}>
              <Input label={t('money.transfers.from')} placeholder="USD" value={convertFrom} onChangeText={setConvertFrom} />
            </View>
            <Text style={styles.convertArrow}>→</Text>
            <View style={{ flex: 1 }}>
              <Input label={t('money.transfers.to')} placeholder="UAH" value={convertTo} onChangeText={setConvertTo} />
            </View>
          </View>
          <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowConvert(false)} style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-end' }} />
        </Card>
      )}
    </ScreenLayout>
  );
}

const useCurrencyStyles = createStyles((theme) =>
  StyleSheet.create({
    totalCard: { marginTop: theme.spacing.md, alignItems: 'center', padding: theme.spacing.lg },
    totalLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    totalAmount: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.xs },
    convertCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    convertTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary },
    convertRow: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.md },
    convertArrow: { ...theme.typography.headingSmall.style, color: theme.colors.textTertiary, marginBottom: theme.spacing.md },
  }),
);
