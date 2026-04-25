import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

export default function CalculatorScreen() {
  const theme = useTheme();
  const styles = useCalcStyles(theme);
  const currency = useSettingsStore((s) => s.currency);
  const { t } = useLocalized();
  const [targetAmount, setTargetAmount] = useState(30000);
  const [monthlySavings, setMonthlySavings] = useState(2500);

  const results = useMemo(() => {
    if (monthlySavings <= 0 || targetAmount <= 0) {
      return { months: Infinity, weekly: 0, totalWithInterest: 0 };
    }
    const months = Math.ceil(targetAmount / monthlySavings);
    const weekly = Math.round(monthlySavings / 4.33);
    const interestRate = 0.12;
    const totalWithInterest = Math.round(
      monthlySavings * ((Math.pow(1 + interestRate / 12, months) - 1) / (interestRate / 12)),
    );
    return { months, weekly, totalWithInterest };
  }, [targetAmount, monthlySavings]);

  const progress = monthlySavings > 0 ? Math.min((monthlySavings / (targetAmount / 12)) * 100, 100) : 0;

  const handleTarget = (text: string) => {
    const val = parseInt(text.replace(/\D/g, ''), 10);
    if (!isNaN(val) && val >= 0) setTargetAmount(val);
  };

  const handleMonthly = (text: string) => {
    const val = parseInt(text.replace(/\D/g, ''), 10);
    if (!isNaN(val) && val >= 0) setMonthlySavings(val);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('stats.calculator.title', { default: 'Калькулятор' })} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Target Amount */}
        <Card style={styles.inputCard}>
          <Text style={styles.inputLabel}>{t('stats.calculator.targetAmount', { default: 'Цільова сума' })}</Text>
          <Slider
            value={targetAmount}
            onValueChange={setTargetAmount}
            min={1000}
            max={500000}
            step={1000}
            label={formatCurrency(targetAmount, currency)}
          />
          <View style={styles.manualInputRow}>
            <Text style={styles.manualLabel}>{t('stats.calculator.orEnter', { default: 'або введіть:' })}</Text>
            <View style={styles.manualInput}>
              <Text style={styles.currencyPrefix}>{currency}</Text>
              <Text style={styles.manualValue}>{targetAmount.toLocaleString('uk-UA')}</Text>
            </View>
          </View>
        </Card>

        {/* Monthly Savings */}
        <Card style={styles.inputCard}>
          <Text style={styles.inputLabel}>{t('stats.calculator.monthlySaving', { default: 'Щомісячні заощадження' })}</Text>
          <Slider
            value={monthlySavings}
            onValueChange={setMonthlySavings}
            min={100}
            max={20000}
            step={100}
            label={formatCurrency(monthlySavings, currency)}
          />
          <View style={styles.manualInputRow}>
            <Text style={styles.manualLabel}>{t('stats.calculator.orEnter', { default: 'або введіть:' })}</Text>
            <View style={styles.manualInput}>
              <Text style={styles.currencyPrefix}>{currency}</Text>
              <Text style={styles.manualValue}>{monthlySavings.toLocaleString('uk-UA')}</Text>
            </View>
          </View>
        </Card>

        {/* Visual Progress Indicator */}
        <Card style={styles.progressCard}>
          <Text style={styles.progressLabel}>{t('stats.calculator.visualProgress', { default: 'Візуальний прогрес' })}</Text>
          <LinearProgress progress={progress} color={theme.colors.accentBlue} height={12} />
          <Text style={styles.progressDesc}>
            {progress >= 100 ? '🎯' : `${t('stats.calculator.needToSave', { default: 'Потрібно зберігати' })} ${formatCurrency(Math.round(targetAmount / 12), currency)}/${t('stats.calculator.perMonth', { default: 'міс.' })}`}
          </Text>
        </Card>

        {/* Results */}
        <Card variant="achievement" style={styles.resultCard}>
          <Text style={styles.resultTitle}>{t('stats.calculator.result', { default: 'Результат' })}</Text>
          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{results.months === Infinity ? '∞' : results.months}</Text>
              <Text style={styles.resultLabel}>{t('stats.calculator.timeToGoal', { default: 'місяців потрібно' })}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{results.weekly}</Text>
              <Text style={styles.resultLabel}>{formatCurrency(results.weekly, currency)}/{t('stats.calculator.perWeek', { default: 'тиждень' })}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{formatCurrency(results.totalWithInterest, currency)}</Text>
              <Text style={styles.resultLabel}>{t('stats.calculator.withInterest', { default: 'з 12% річних' })}</Text>
            </View>
          </View>
          <Text style={styles.interestNote}>
            * {t('stats.calculator.compoundNote', { default: 'Розрахунок з урахуванням складних відсотків під 12% річних' })}
          </Text>
        </Card>
      </ScreenLayout>
    </>
  );
}

const useCalcStyles = createStyles((theme) =>
  StyleSheet.create({
    inputCard: { marginBottom: theme.spacing.md },
    inputLabel: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    manualInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.sm },
    manualLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary },
    manualInput: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, backgroundColor: theme.colors.bgTertiary, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.semanticRadii.chipRadius },
    currencyPrefix: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary },
    manualValue: { ...theme.typography.code.style, color: theme.colors.textPrimary, fontWeight: '700' },
    progressCard: { marginBottom: theme.spacing.md },
    progressLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
    progressDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, marginTop: theme.spacing.sm },
    resultCard: { marginBottom: theme.spacing.lg },
    resultTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    resultGrid: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md },
    resultItem: { flex: 1, alignItems: 'center' },
    resultValue: { ...theme.typography.statSmall.style, fontSize: 20, fontWeight: '800', color: theme.colors.accentGold },
    resultLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginTop: theme.spacing.xs, textAlign: 'center' },
    interestNote: { ...theme.typography.bodyTiny.style, color: theme.colors.textTertiary, fontStyle: 'italic' },
  }),
);
