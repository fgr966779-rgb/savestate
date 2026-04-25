import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Chip } from '@/components/ui/Chip';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { calculateForecast } from '@/utils/calculations';

export default function ForecastScreen() {
  const theme = useTheme();
  const styles = useForecastStyles(theme);
  const { t } = useLocalized();
  const currency = useSettingsStore((s) => s.currency);
  const goals = useSavingsStore((s) => s.goals);
  const transactions = useSavingsStore((s) => s.transactions);
  const [extraWeekly, setExtraWeekly] = useState(0);

  const activeGoal = useMemo(() => {
    return goals.find((g) => g.status === 'active') || goals[0];
  }, [goals]);

  const targetAmount = activeGoal?.targetAmount ?? 30000;
  const currentSaved = activeGoal?.currentAmount ?? 0;
  const totalNeeded = Math.max(0, targetAmount - currentSaved);

  const avgWeekly = useMemo(() => {
    const now = new Date();
    const sixWeeksAgo = new Date(now);
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);
    const recentDeposits = transactions.filter((tx) => {
      if (tx.type !== 'deposit' && tx.type !== 'bonus') return false;
      const txDate = new Date(tx.createdAt);
      return txDate >= sixWeeksAgo;
    });
    if (recentDeposits.length === 0) return 0;
    const totalAmount = recentDeposits.reduce((s, tx) => s + tx.amount, 0);
    return Math.round(totalAmount / 6);
  }, [transactions]);

  const avgDaily = avgWeekly / 7;

  const forecast = useMemo(() => {
    return calculateForecast(targetAmount, currentSaved, avgDaily + extraWeekly / 7);
  }, [targetAmount, currentSaved, avgDaily, extraWeekly]);

  const completionDate = useMemo(() => {
    if (forecast.daysRemaining === -1) return t('stats.forecast.estimatedDate', { default: 'Невизначено' });
    const d = new Date();
    d.setDate(d.getDate() + forecast.daysRemaining);
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [forecast, t]);

  const weeksNeeded = forecast.daysRemaining === -1 ? Infinity : Math.ceil(forecast.daysRemaining / 7);

  const daysSaved = useMemo(() => {
    if (extraWeekly <= 0 || avgWeekly <= 0) return 0;
    const totalNeeded = Math.max(0, targetAmount - currentSaved);
    if (totalNeeded <= 0) return 0;
    const weeksWithout = Math.ceil(totalNeeded / avgWeekly);
    const weeksWith = Math.ceil(totalNeeded / (avgWeekly + extraWeekly));
    return (weeksWithout - weeksWith) * 7;
  }, [targetAmount, currentSaved, avgWeekly, extraWeekly]);

  const progressPercent = targetAmount > 0 ? Math.round((currentSaved / targetAmount) * 100) : 0;

  const confidence = useMemo(() => {
    if (avgWeekly <= 0) return 0;
    const weeksToGoal = totalNeeded / avgWeekly;
    if (weeksToGoal <= 4) return 90;
    if (weeksToGoal <= 12) return 75;
    if (weeksToGoal <= 26) return 55;
    return 30;
  }, [avgWeekly, totalNeeded]);

  const projectedData = useMemo(() => {
    const points: { week: number; projected: number }[] = [];
    let balance = currentSaved;
    const effective = avgWeekly + extraWeekly;
    const totalWeeks = Math.min(weeksNeeded === Infinity ? 52 : weeksNeeded + 4, 52);
    for (let w = 0; w <= totalWeeks; w++) {
      if (w > 0) balance = Math.min(balance + effective, targetAmount * 1.1);
      points.push({ week: w, projected: Math.round(balance) });
    }
    return points;
  }, [currentSaved, avgWeekly, extraWeekly, targetAmount, weeksNeeded]);

  const maxProjected = Math.max(...projectedData.map((d) => d.projected), 1);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('stats.forecast.title', { default: 'Прогноз' })} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Target Card */}
        <Card variant="glowing" style={styles.targetCard}>
          <Text style={styles.targetLabel}>{t('stats.forecast.goalCompletion', { default: 'Прогнозована дата завершення' })}</Text>
          <Text style={styles.targetDate}>{completionDate}</Text>
          <View style={styles.targetSubRow}>
            <Text style={styles.targetSub}>{weeksNeeded === Infinity ? '∞' : formatWeeks(weeksNeeded)}</Text>
            <Text style={styles.targetSub}>{t('stats.forecast.remaining', { default: 'залишилось' })} {formatCurrency(totalNeeded, currency)}</Text>
          </View>
        </Card>

        {/* Area Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>{t('stats.forecast.projectedSavings', { default: 'Проєктований прогрес' })}</Text>
          <View style={styles.areaChart}>
            {projectedData.map((point, i) => {
              const height = maxProjected > 0 ? (point.projected / maxProjected) * 100 : 0;
              return (
                <View key={i} style={styles.areaBarWrapper}>
                  <View style={[styles.areaBar, { height: `${Math.max(height, 2)}%` }]} />
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: theme.colors.accentBlue }]} />
              <Text style={styles.legendText}>{t('stats.forecast.atCurrentRate', { default: 'Проєктоване' })}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: theme.colors.accentGreen + '40', borderStyle: 'dashed' }]} />
              <Text style={styles.legendText}>{t('stats.forecast.withGoal', { default: 'Ціль' })}: {formatCurrency(targetAmount, currency)}</Text>
            </View>
          </View>
        </Card>

        {/* Confidence */}
        <Card style={styles.confidenceCard}>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{t('stats.forecast.confidence', { default: 'Рівень впевненості' })}</Text>
            <Chip
              label={confidence >= 70 ? '✅' : confidence >= 40 ? '⚠️' : '❌'}
              selected={false}
            />
          </View>
          <LinearProgress progress={confidence} color={confidence >= 70 ? theme.colors.accentGreen : theme.colors.accentOrange} height={8} />
        </Card>

        {/* Extra Savings Slider */}
        <Card style={styles.sliderCard}>
          <Text style={styles.sliderTitle}>{t('stats.forecast.saveMore', { default: 'Якіщо економити більше?' })}</Text>
          <Slider
            value={extraWeekly}
            onValueChange={setExtraWeekly}
            min={0}
            max={2000}
            step={100}
            label={`+${formatCurrency(extraWeekly, currency)}/${t('quests.weekly.title', { default: 'тиждень' })}`}
          />
          {extraWeekly > 0 && daysSaved > 0 && (
            <Text style={styles.sliderResult}>
              {t('stats.forecast.daysSaved', { default: 'Економія' })} {formatCurrency(extraWeekly, currency)}/{t('quests.weekly.title', { default: 'тиждень' })} {t('stats.forecast.accelerate', { default: 'пришвидшить мету на' })} {daysSaved} {t('home.dashboard.daysLeft', { default: 'днів' })}
            </Text>
          )}
        </Card>
      </ScreenLayout>
    </>
  );
}

function formatWeeks(w: number): string {
  if (w >= 52) return `${Math.round(w / 52)} міс.`;
  return `${w} тижнів`;
}

const useForecastStyles = createStyles((theme) =>
  StyleSheet.create({
    targetCard: { marginBottom: theme.spacing.lg, alignItems: 'center' },
    targetLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    targetDate: { ...theme.typography.headingSmall.style, color: theme.colors.accentGreen, marginTop: theme.spacing.sm },
    targetSubRow: { flexDirection: 'row', gap: theme.spacing.lg, marginTop: theme.spacing.sm },
    targetSub: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary },
    chartCard: { marginBottom: theme.spacing.lg },
    chartTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    areaChart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 1 },
    areaBarWrapper: { flex: 1, justifyContent: 'flex-end' },
    areaBar: { borderRadius: 2, backgroundColor: theme.colors.accentBlue + '40' },
    chartLegend: { flexDirection: 'row', gap: theme.spacing.lg, marginTop: theme.spacing.sm },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    legendLine: { width: 20, height: 3, borderRadius: 2 },
    legendText: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    confidenceCard: { marginBottom: theme.spacing.lg },
    confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
    confidenceLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    sliderCard: { marginBottom: theme.spacing.lg },
    sliderTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    sliderResult: { ...theme.typography.bodyMedium.style, color: theme.colors.accentGreen, marginTop: theme.spacing.sm, textAlign: 'center' },
  }),
);
