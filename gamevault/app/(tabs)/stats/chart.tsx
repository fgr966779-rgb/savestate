import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

type TimeRange = 30 | 90 | 365;

export default function ChartScreen() {
  const theme = useTheme();
  const styles = useChartStyles(theme);
  const { t } = useLocalized();
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useSavingsStore((s) => s.transactions);
  const [range, setRange] = useState<TimeRange>(30);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const RANGE_OPTIONS: { key: TimeRange; label: string }[] = useMemo(() => [
    { key: 30, label: t('stats.charts.dailyActivity', { default: '30 дн' }).slice(0, 5) || '30 дн' },
    { key: 90, label: t('stats.charts.weeklyTrend', { default: '90 дн' }).slice(0, 5) || '90 дн' },
    { key: 365, label: t('stats.charts.monthlyComparison', { default: '1 рік' }).slice(0, 4) || '1 рік' },
  ], [t]);

  const chartData = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - range);

    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return txDate >= startDate && txDate <= now;
    });

    if (range <= 30) {
      // Group by day
      const dayMap = new Map<string, number>();
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
        dayMap.set(key, 0);
      }
      for (const tx of filtered) {
        const key = new Date(tx.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
        if (tx.type === 'deposit' || tx.type === 'bonus') {
          dayMap.set(key, (dayMap.get(key) ?? 0) + tx.amount);
        } else if (tx.type === 'withdrawal') {
          dayMap.set(key, (dayMap.get(key) ?? 0) - tx.amount);
        }
      }
      const data: { date: string; value: number }[] = [];
      let cumulative = 0;
      for (const [date, val] of dayMap) {
        cumulative += val;
        data.push({ date, value: Math.max(0, cumulative) });
      }
      return data;
    } else if (range <= 90) {
      // Group by week
      const weekMap = new Map<string, number>();
      for (let i = range; i >= 0; i -= 7) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
        weekMap.set(key, 0);
      }
      for (const tx of filtered) {
        const txDate = new Date(tx.createdAt);
        const dayOffset = Math.floor((now.getTime() - txDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) * 7;
        const refDate = new Date(now);
        refDate.setDate(refDate.getDate() - dayOffset);
        const key = refDate.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
        if (tx.type === 'deposit' || tx.type === 'bonus') {
          weekMap.set(key, (weekMap.get(key) ?? 0) + tx.amount);
        } else if (tx.type === 'withdrawal') {
          weekMap.set(key, (weekMap.get(key) ?? 0) - tx.amount);
        }
      }
      const data: { date: string; value: number }[] = [];
      let cumulative = 0;
      for (const [date, val] of weekMap) {
        cumulative += val;
        data.push({ date, value: Math.max(0, cumulative) });
      }
      return data;
    } else {
      // Group by month
      const monthMap = new Map<string, number>();
      const d = new Date(now);
      for (let i = 11; i >= 0; i--) {
        const md = new Date(d.getFullYear(), d.getMonth() - i, 1);
        const key = md.toLocaleDateString('uk-UA', { month: 'short' });
        monthMap.set(key, 0);
      }
      for (const tx of filtered) {
        const key = new Date(tx.createdAt).toLocaleDateString('uk-UA', { month: 'short' });
        if (tx.type === 'deposit' || tx.type === 'bonus') {
          monthMap.set(key, (monthMap.get(key) ?? 0) + tx.amount);
        } else if (tx.type === 'withdrawal') {
          monthMap.set(key, (monthMap.get(key) ?? 0) - tx.amount);
        }
      }
      const data: { date: string; value: number }[] = [];
      let cumulative = 0;
      for (const [date, val] of monthMap) {
        cumulative += val;
        data.push({ date, value: Math.max(0, cumulative) });
      }
      return data;
    }
  }, [transactions, range]);

  const change = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - range);
    return transactions
      .filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate >= startDate && txDate <= now;
      })
      .reduce((sum, tx) => {
        if (tx.type === 'deposit' || tx.type === 'bonus') return sum + tx.amount;
        if (tx.type === 'withdrawal') return sum - tx.amount;
        return sum;
      }, 0);
  }, [transactions, range]);

  const maxVal = useMemo(() => Math.max(...chartData.map((d) => d.value), 1), [chartData]);
  const minVal = useMemo(() => Math.min(...chartData.map((d) => d.value)), [chartData]);
  const latestValue = chartData[chartData.length - 1]?.value ?? 0;

  const barCount = Math.min(chartData.length, range);
  const step = Math.ceil(chartData.length / barCount);

  const sampledData = useMemo(() => {
    return chartData.filter((_, i) => i % step === 0 || i === chartData.length - 1);
  }, [chartData, step]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('stats.charts.title', { default: 'Прогрес' })} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('vault.main.totalBalance', { default: 'Загальний баланс' })}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(latestValue, currency)}</Text>
          <Text style={[styles.summaryChange, change < 0 && { color: theme.colors.accentRed }]}>
            {change >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(change), currency)} {t('stats.dashboard.period', { default: 'за період' })}
          </Text>
        </Card>

        {/* Time Range */}
        <View style={styles.rangeRow}>
          {RANGE_OPTIONS.map((opt) => (
            <Chip key={opt.key} label={opt.label} selected={range === opt.key} onPress={() => setRange(opt.key)} />
          ))}
        </View>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>{t('stats.charts.savingsTrend', { default: 'Динаміка заощаджень' })}</Text>
          <View style={styles.chartArea}>
            {/* Y axis labels */}
            <View style={styles.yAxis}>
              <Text style={styles.yLabel}>{(maxVal / 1000).toFixed(0)}к</Text>
              <Text style={styles.yLabel}>{((maxVal + minVal) / 2000).toFixed(1)}к</Text>
              <Text style={styles.yLabel}>{(minVal / 1000).toFixed(1)}к</Text>
            </View>
            {/* Bars */}
            <View style={styles.barsContainer}>
              {sampledData.map((point, i) => {
                const height = maxVal > 0 ? (point.value / maxVal) * 100 : 0;
                const isSelected = selectedPoint === i;
                return (
                  <View key={i} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${Math.max(height, 2)}%`,
                          backgroundColor: isSelected ? theme.colors.accentBlue : theme.colors.accentBlue + '60',
                        },
                      ]}
                      onStartShouldSetResponder={() => { setSelectedPoint(i); return true; }}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          {/* Selected Point Detail */}
          {selectedPoint !== null && sampledData[selectedPoint] && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipDate}>{sampledData[selectedPoint].date}</Text>
              <Text style={styles.tooltipValue}>{formatCurrency(sampledData[selectedPoint].value, currency)}</Text>
            </View>
          )}

          {/* X axis */}
          <View style={styles.xAxis}>
            <Text style={styles.xLabel}>{sampledData[0]?.date}</Text>
            <Text style={styles.xLabel}>{sampledData[sampledData.length - 1]?.date}</Text>
          </View>
        </Card>
      </ScreenLayout>
    </>
  );
}

const useChartStyles = createStyles((theme) =>
  StyleSheet.create({
    summaryCard: { marginBottom: theme.spacing.md, alignItems: 'center' },
    summaryLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    summaryValue: { ...theme.typography.statSmall.style, fontSize: 32, fontWeight: '900', color: theme.colors.accentGreen },
    summaryChange: { ...theme.typography.bodyMedium.style, color: theme.colors.accentGreen, marginTop: theme.spacing.xs },
    rangeRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    chartCard: { marginBottom: theme.spacing.lg },
    chartTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    chartArea: { flexDirection: 'row', height: 200 },
    yAxis: { width: 40, justifyContent: 'space-between', paddingVertical: theme.spacing.xs },
    yLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary, fontFamily: theme.fontFamilies.mono, fontSize: 9 },
    barsContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
    barWrapper: { flex: 1, justifyContent: 'flex-end' },
    bar: { borderRadius: 3, minWidth: 2 },
    tooltip: { alignItems: 'center', marginTop: theme.spacing.sm, paddingVertical: theme.spacing.xs },
    tooltipDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    tooltipValue: { ...theme.typography.code.style, color: theme.colors.accentBlue, fontWeight: '700' },
    xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.sm },
    xLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
  }),
);
