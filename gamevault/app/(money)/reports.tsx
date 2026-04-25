import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

type ReportType = 'monthly' | 'yearly' | 'custom';

const REPORT_TYPES: { key: ReportType; labelKey: string }[] = [
  { key: 'monthly', labelKey: 'money.reports.typeMonthly' },
  { key: 'yearly', labelKey: 'money.reports.typeYearly' },
  { key: 'custom', labelKey: 'money.reports.typeCustom' },
];

const EXPORT_FORMATS = ['CSV', 'PDF'];

export default function ReportsScreen() {
  const theme = useTheme();
  const styles = useReportsStyles(theme);
  const { t } = useLocalized();
  const { transactions, loadTransactions, isLoading } = useSavingsStore();

  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const monthNames = [
      t('money.reports.jan'), t('money.reports.feb'), t('money.reports.mar'),
      t('money.reports.apr'), t('money.reports.may'), t('money.reports.jun'),
      t('money.reports.jul'), t('money.reports.aug'), t('money.reports.sep'),
      t('money.reports.oct'), t('money.reports.nov'), t('money.reports.dec'),
    ];

    const buckets: Record<string, { month: string; monthIdx: number; income: number; expense: number }> = {};

    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = { month: monthNames[d.getMonth()], monthIdx: d.getMonth(), income: 0, expense: 0 };
    }

    transactions.forEach(tx => {
      const txDate = new Date(tx.createdAt);
      const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      if (buckets[key]) {
        if (tx.type === 'deposit' || tx.type === 'bonus') {
          buckets[key].income += tx.amount;
        } else if (tx.type === 'withdrawal') {
          buckets[key].expense += tx.amount;
        }
      }
    });

    return Object.entries(buckets)
      .sort((a, b) => a[1].monthIdx - b[1].monthIdx)
      .map(([, v]) => v);
  }, [transactions, t]);

  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthlyData.reduce((s, m) => s + m.expense, 0);
  const maxVal = Math.max(...monthlyData.map(m => Math.max(m.income, m.expense)), 1);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    setGenerated(true);
    setGenerating(false);
  };

  const handleExport = async (format: string) => {
    Alert.alert(
      t('money.reports.exportTitle'),
      t('money.reports.exportConfirm', { format }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('money.reports.exportButton'), onPress: async () => {
          try { await Sharing.shareAsync(''); } catch { /* cancelled */ }
        }},
      ],
    );
  };

  if (isLoading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.reports.title')} />

      <View style={{ marginTop: theme.spacing.md }}>
        {/* Report type selector */}
        <View style={styles.typeRow}>
          {REPORT_TYPES.map(rt => (
            <Pressable key={rt.key} style={[styles.typeBtn, reportType === rt.key && styles.typeBtnActive]} onPress={() => setReportType(rt.key)}>
              <Text style={[styles.typeText, reportType === rt.key && styles.typeTextActive]}>{t(rt.labelKey)}</Text>
            </Pressable>
          ))}
        </View>

        {/* Custom date range */}
        {reportType === 'custom' && (
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Input label={t('money.reports.from')} placeholder="yyyy-mm-dd" value={startDate} onChangeText={setStartDate} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
              <Input label={t('money.reports.to')} placeholder="yyyy-mm-dd" value={endDate} onChangeText={setEndDate} keyboardType="numeric" />
            </View>
          </View>
        )}

        <Button
          label={generating ? t('money.reports.generating') : t('money.reports.generateReport')}
          fullWidth onPress={handleGenerate} loading={generating}
          disabled={reportType === 'custom' && (!startDate || !endDate)}
          style={{ marginTop: theme.spacing.lg }}
        />

        {/* Generated report */}
        {generated && (
          <>
            <Card style={styles.reportCard}>
              <Text style={styles.reportTitle}>{t('money.reports.periodReport')}</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{t('money.reports.avgIncome')}</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.accentGreen }]}>
                    {formatCurrency(monthlyData.length > 0 ? Math.round(totalIncome / monthlyData.length) : 0)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{t('money.reports.avgExpense')}</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.accentRed }]}>
                    {formatCurrency(monthlyData.length > 0 ? Math.round(totalExpense / monthlyData.length) : 0)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Chart */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t('money.reports.incomeVsExpense')}</Text>
              {monthlyData.map(m => (
                <View key={m.month} style={styles.chartRow}>
                  <Text style={styles.chartLabel}>{m.month}</Text>
                  <View style={styles.chartBars}>
                    <View style={[styles.chartBar, { width: `${(m.income / maxVal) * 100}%`, backgroundColor: theme.colors.accentGreen }]} />
                    <View style={[styles.chartBar, { width: `${(m.expense / maxVal) * 100}%`, backgroundColor: theme.colors.accentRed }]} />
                  </View>
                </View>
              ))}
            </Card>

            {/* Export buttons */}
            <View style={styles.exportRow}>
              {EXPORT_FORMATS.map(fmt => (
                <Button key={fmt} label={t('money.reports.exportFormat', { format: fmt })} variant="secondary" size="sm" onPress={() => handleExport(fmt)} />
              ))}
            </View>
          </>
        )}
      </View>
    </ScreenLayout>
  );
}

const useReportsStyles = createStyles((theme) =>
  StyleSheet.create({
    typeRow: { flexDirection: 'row', gap: theme.spacing.sm, backgroundColor: theme.colors.bgTertiary, borderRadius: theme.radii.md, padding: 4 },
    typeBtn: { flex: 1, paddingVertical: theme.spacing.sm, alignItems: 'center', borderRadius: theme.radii.sm },
    typeBtnActive: { backgroundColor: theme.colors.bgSecondary },
    typeText: { ...theme.typography.labelMedium.style, color: theme.colors.textTertiary },
    typeTextActive: { color: theme.colors.textPrimary },
    dateRow: { flexDirection: 'row', marginTop: theme.spacing.md },
    reportCard: { marginTop: theme.spacing.xl, padding: theme.spacing.lg },
    reportTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary },
    summaryRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    summaryValue: { ...theme.typography.headingSmall.style, marginTop: theme.spacing.xs },
    chartCard: { marginTop: theme.spacing.md, padding: theme.spacing.md },
    chartTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    chartRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
    chartLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary, width: 70 },
    chartBars: { flex: 1, flexDirection: 'row', gap: 2 },
    chartBar: { height: 16, borderRadius: theme.radii.xs },
    exportRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xl, justifyContent: 'center' },
  }),
);
