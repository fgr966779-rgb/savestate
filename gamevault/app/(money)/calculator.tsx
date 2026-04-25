import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Badge } from '@/components/ui/Badge';
import ErrorState from '@/components/ui/ErrorState';

export default function CalculatorScreen() {
  const theme = useTheme();
  const styles = useCalcStyles(theme);
  const router = useRouter();

  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    const P = loanAmount;
    const annualRate = parseFloat(interestRate);
    const N = parseInt(termMonths, 10);
    if (P <= 0 || isNaN(annualRate) || annualRate <= 0 || isNaN(N) || N <= 0) return null;
    const monthlyRate = annualRate / 100 / 12;
    const monthly = P * (monthlyRate * Math.pow(1 + monthlyRate, N)) / (Math.pow(1 + monthlyRate, N) - 1);
    const totalPaid = monthly * N;
    const totalInterest = totalPaid - P;
    const schedule = Array.from({ length: Math.min(N, 6) }, (_, i) => {
      const interest = P * monthlyRate;
      const principal = monthly - interest;
      return { month: i + 1, payment: monthly, principal, interest, balance: Math.max(0, P - principal * (i + 1)) };
    });
    return { monthly, totalPaid, totalInterest, schedule, totalMonths: N };
  }, [loanAmount, interestRate, termMonths]);

  const formatCurrency = (val: number) => `${val.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴`;

  const handleCalculate = () => {
    if (!result) return;
    setShowResult(true);
  };

  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout>
      <HeaderBar title="Калькулятор кредиту" leftAction={{ icon: '←', onPress: () => router.back() }} />

      <View style={{ marginTop: theme.spacing.md }}>
        <AmountInput label="Сума кредиту" value={loanAmount} onChangeAmount={setLoanAmount} />
        <View style={{ marginTop: theme.spacing.lg }}>
          <Input label="Річна відсоткова ставка (%)" placeholder="напр. 12.5" value={interestRate} onChangeText={setInterestRate} keyboardType="decimal-pad" />
        </View>
        <View style={{ marginTop: theme.spacing.lg }}>
          <Input label="Термін (місяців)" placeholder="напр. 36" value={termMonths} onChangeText={setTermMonths} keyboardType="numeric" />
        </View>

        <Button label="Розрахувати" fullWidth onPress={handleCalculate} disabled={!result} style={{ marginTop: theme.spacing.xl }} />

        {showResult && result && (
          <>
            {/* Results */}
            <Card style={styles.resultCard}>
              <Text style={styles.resultTitle}>Результат розрахунку</Text>
              <View style={styles.resultRow}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Щомісячний платіж</Text>
                  <Text style={[styles.resultValue, { color: theme.colors.accentGold }]}>{formatCurrency(result.monthly)}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Загальна сума</Text>
                  <Text style={[styles.resultValue, { color: theme.colors.accentBlue }]}>{formatCurrency(result.totalPaid)}</Text>
                </View>
              </View>
              <View style={styles.interestRow}>
                <Text style={styles.resultLabel}>Переплата (відсотки)</Text>
                <Text style={[styles.resultValue, { color: theme.colors.accentRed }]}>{formatCurrency(result.totalInterest)}</Text>
              </View>
              <Badge variant="status" text={`${result.totalMonths} міс.`} status="info" style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-start' }} />
            </Card>

            {/* Amortization preview */}
            <Card style={styles.scheduleCard}>
              <Text style={styles.scheduleTitle}>Графік платежів (перші 6)</Text>
              <View style={styles.scheduleHeader}>
                <Text style={[styles.scheduleCell, { flex: 0.5 }]}>Міс.</Text>
                <Text style={[styles.scheduleCell, { flex: 1 }]}>Платіж</Text>
                <Text style={[styles.scheduleCell, { flex: 1 }]}>Основний</Text>
                <Text style={[styles.scheduleCell, { flex: 1 }]}>Відсотки</Text>
              </View>
              {result.schedule.map(row => (
                <View key={row.month} style={styles.scheduleRow}>
                  <Text style={[styles.scheduleCellText, { flex: 0.5 }]}>{row.month}</Text>
                  <Text style={[styles.scheduleCellText, { flex: 1 }]}>{formatCurrency(row.payment)}</Text>
                  <Text style={[styles.scheduleCellText, { flex: 1, color: theme.colors.accentGreen }]}>{formatCurrency(row.principal)}</Text>
                  <Text style={[styles.scheduleCellText, { flex: 1, color: theme.colors.accentOrange }]}>{formatCurrency(row.interest)}</Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </View>
    </ScreenLayout>
  );
}

const useCalcStyles = createStyles((theme) =>
  StyleSheet.create({
    resultCard: { marginTop: theme.spacing.xl, padding: theme.spacing.lg },
    resultTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md, gap: theme.spacing.md },
    resultItem: { flex: 1 },
    resultLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    resultValue: { ...theme.typography.headingSmall.style, marginTop: theme.spacing.xs },
    interestRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.borderSubtle },
    scheduleCard: { marginTop: theme.spacing.md, padding: theme.spacing.md },
    scheduleTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    scheduleHeader: { flexDirection: 'row', paddingBottom: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderDefault },
    scheduleCell: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    scheduleRow: { flexDirection: 'row', paddingVertical: 4 },
    scheduleCellText: { ...theme.typography.caption.style, color: theme.colors.textSecondary },
  }),
);
