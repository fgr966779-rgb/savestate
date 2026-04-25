import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Share } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

const MONTHS_UK = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
const CURRENT_MONTH = new Date().getMonth();
const CURRENT_YEAR = new Date().getFullYear();

export default function ReportScreen() {
  const theme = useTheme();
  const styles = useReportStyles(theme);
  const { t } = useLocalized();
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useSavingsStore((s) => s.transactions);
  const quests = useQuestStore((s) => s.quests);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);

  const monthData = useMemo(() => {
    const startOfMonth = new Date(CURRENT_YEAR, selectedMonth, 1);
    const endOfMonth = new Date(CURRENT_YEAR, selectedMonth + 1, 0, 23, 59, 59, 999);

    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return txDate >= startOfMonth && txDate <= endOfMonth;
    });

    const deposited = filtered
      .filter((tx) => tx.type === 'deposit' || tx.type === 'bonus')
      .reduce((s, tx) => s + tx.amount, 0);
    const withdrawn = filtered
      .filter((tx) => tx.type === 'withdrawal')
      .reduce((s, tx) => s + tx.amount, 0);
    const net = deposited - withdrawn;
    const transactionCount = filtered.length;

    // Quest completion rate for selected month
    const monthQuests = quests.filter((q) => {
      if (!q.completedAt) return false;
      const cd = new Date(q.completedAt);
      return cd >= startOfMonth && cd <= endOfMonth;
    });
    const totalMonthQuests = quests.filter((q) => {
      if (!q.expiresAt) return false;
      const ed = new Date(q.expiresAt);
      return ed >= startOfMonth && ed <= endOfMonth;
    });
    const questRate = totalMonthQuests.length > 0
      ? Math.round((monthQuests.length / totalMonthQuests.length) * 100)
      : 0;

    // Top categories
    const catMap = new Map<string, number>();
    for (const tx of filtered) {
      const cat = tx.category || t('common.noData', { default: 'Інше' });
      catMap.set(cat, (catMap.get(cat) ?? 0) + tx.amount);
    }
    const topCategories = Array.from(catMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return { deposited, withdrawn, net, topCategories, questRate, transactionCount };
  }, [transactions, quests, selectedMonth, t]);

  const isNetPositive = monthData.net >= 0;

  const handleExportPDF = async () => {
    try {
      await Share.share({
        message: `${t('stats.report.title', { default: 'Звіт' })} ${MONTHS_UK[selectedMonth]} ${CURRENT_YEAR}:\n${t('vault.deposit.title', { default: 'Поповнено' })}: ${formatCurrency(monthData.deposited, currency)}\n${t('vault.withdraw.title', { default: 'Виведено' })}: ${formatCurrency(monthData.withdrawn, currency)}\n${t('money.summary.net', { default: 'Чисте' })}: ${formatCurrency(monthData.net, currency)}`,
      });
    } catch {}
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('stats.report.title', { default: 'Звіт' })} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Month Selector */}
        <View style={styles.monthRow}>
          {MONTHS_UK.map((m, i) => (
            <Chip key={i} label={m.slice(0, 3)} selected={selectedMonth === i} onPress={() => setSelectedMonth(i)} />
          ))}
        </View>

        {/* Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{MONTHS_UK[selectedMonth]} {CURRENT_YEAR}</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('vault.deposit.title', { default: 'Поповнено' })}</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.accentGreen }]}>+{formatCurrency(monthData.deposited, currency)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('vault.withdraw.title', { default: 'Виведено' })}</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.accentRed }]}>-{formatCurrency(monthData.withdrawn, currency)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('money.summary.net', { default: 'Чисте' })}</Text>
              <Text style={[styles.summaryValue, { color: isNetPositive ? theme.colors.accentGreen : theme.colors.accentRed }]}>
                {isNetPositive ? '+' : ''}{formatCurrency(monthData.net, currency)}
              </Text>
            </View>
          </View>
          <Text style={styles.txCount}>{monthData.transactionCount} {t('vault.history.allTransactions', { default: 'транзакцій' })}</Text>
        </Card>

        {/* Top Categories */}
        <Card style={styles.catCard}>
          <Text style={styles.cardTitle}>{t('stats.patterns.topCategories', { default: 'Топ категорії' })}</Text>
          {monthData.topCategories.length === 0 ? (
            <Text style={styles.emptyText}>{t('common.noData', { default: 'Немає даних' })}</Text>
          ) : (
            monthData.topCategories.map((cat, i) => (
              <View key={cat.name} style={styles.catRow}>
                <View style={styles.catHeader}>
                  <Text style={styles.catRank}>#{i + 1}</Text>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catAmount}>{formatCurrency(cat.amount, currency)}</Text>
                </View>
                <LinearProgress
                  progress={monthData.deposited > 0 ? (cat.amount / monthData.deposited) * 100 : 0}
                  color={i === 0 ? theme.colors.accentBlue : i === 1 ? theme.colors.accentGold : theme.colors.accentPurple}
                  height={6}
                />
              </View>
            ))
          )}
        </Card>

        {/* Quest Completion */}
        <Card style={styles.questCard}>
          <Text style={styles.cardTitle}>{t('quests.hub.completed', { default: 'Виконання квестів' })}</Text>
          <View style={styles.questRow}>
            <Text style={styles.questPercent}>{monthData.questRate}%</Text>
            <View style={styles.questBar}>
              <LinearProgress progress={monthData.questRate} color={theme.colors.accentGold} height={10} />
            </View>
          </View>
          <Text style={styles.questDesc}>{monthData.questRate}% {t('quests.daily.title', { default: 'щоденних квестів виконано цього місяця' })}</Text>
        </Card>

        {/* Export */}
        <Button label={`📄 ${t('stats.export.exportData', { default: 'Експортувати PDF' })}`} variant="secondary" size="lg" fullWidth onPress={handleExportPDF} />
      </ScreenLayout>
    </>
  );
}

const useReportStyles = createStyles((theme) =>
  StyleSheet.create({
    monthRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.lg },
    summaryCard: { marginBottom: theme.spacing.lg },
    summaryTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
    summaryItem: { alignItems: 'center' },
    summaryLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
    summaryValue: { ...theme.typography.code.style, fontWeight: '700', fontSize: 16, marginTop: theme.spacing.xs },
    txCount: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, textAlign: 'center' },
    catCard: { marginBottom: theme.spacing.lg },
    cardTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    catRow: { marginBottom: theme.spacing.md },
    catHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs },
    catRank: { ...theme.typography.code.style, color: theme.colors.textTertiary, width: 24 },
    catName: { flex: 1, ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    catAmount: { ...theme.typography.code.style, color: theme.colors.textSecondary, fontWeight: '700' },
    questCard: { marginBottom: theme.spacing.lg },
    questRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    questPercent: { ...theme.typography.statSmall.style, fontSize: 28, fontWeight: '800', color: theme.colors.accentGold, width: 80, textAlign: 'center' },
    questBar: { flex: 1 },
    questDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, marginTop: theme.spacing.sm },
    emptyText: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary, textAlign: 'center', paddingVertical: theme.spacing.md },
  }),
);
