import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { useLocalized } from '@/hooks/useLocalized';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { formatCurrency } from '@/utils/formatters';

type ExportFormat = 'csv' | 'pdf' | 'json';
type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

const FORMATS: { key: ExportFormat; label: string; icon: string; descKey: string }[] = [
  { key: 'csv', label: 'CSV', icon: '📊', descKey: 'stats.export.csvDesc' },
  { key: 'pdf', label: 'PDF', icon: '📄', descKey: 'stats.export.pdfDesc' },
  { key: 'json', label: 'JSON', icon: '{ }', descKey: 'stats.export.jsonDesc' },
];

const DATE_RANGES: { key: DateRange; labelKey: string }[] = [
  { key: 'week', labelKey: 'common.thisWeek' },
  { key: 'month', labelKey: 'common.thisMonth' },
  { key: 'quarter', labelKey: 'stats.export.quarter' },
  { key: 'year', labelKey: 'common.thisYear' },
  { key: 'all', labelKey: 'common.all' },
];

const CATEGORY_KEYS = [
  { key: 'savings', labelKey: 'stats.export.savings' },
  { key: 'expenses', labelKey: 'stats.export.expenses' },
  { key: 'quests', labelKey: 'stats.export.quests' },
  { key: 'goals', labelKey: 'stats.export.goals' },
  { key: 'achievements', labelKey: 'stats.export.achievements' },
] as const;

// ── Helpers ──────────────────────────────────────────────────────
function getDateFilter(range: DateRange): Date | null {
  const now = new Date();
  switch (range) {
    case 'week': { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
    case 'month': { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
    case 'quarter': { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d; }
    case 'year': { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
    default: return null;
  }
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function ExportScreen() {
  const theme = useTheme();
  const styles = useExportStyles(theme);
  const { t } = useLocalized();
  const { transactions, goals, loadTransactions, loadGoals } = useSavingsStore();
  const user = useAuthStore((s) => s.user);
  const { quests, achievements, loadQuests, loadAchievements, currentStreak } = useQuestStore();
  const currency = useSettingsStore((s) => s.currency);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [includeCategories, setIncludeCategories] = useState<Set<string>>(new Set(['savings']));
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadTransactions();
    loadGoals();
    loadQuests();
    loadAchievements();
  }, [loadTransactions, loadGoals, loadQuests, loadAchievements]);

  const filteredTransactions = useMemo(() => {
    const cutoff = getDateFilter(dateRange);
    let filtered = transactions;
    if (cutoff) {
      filtered = filtered.filter((tx) => new Date(tx.createdAt) >= cutoff);
    }
    return filtered;
  }, [transactions, dateRange]);

  const toggleCategory = (cat: string) => {
    setIncludeCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const shareFile = async (fileUri: string, fileName: string) => {
    if (Platform.OS === 'web') {
      // On web, open the file in a new tab
      window.open(fileUri, '_blank');
      return;
    }
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      // Fallback: share text content via React Native Share
      try {
        const content = await FileSystem.readAsStringAsync(fileUri);
        await Share.share({ message: content });
      } catch {
        // Silently handle
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        Alert.alert(t('stats.export.pdf'), t('stats.export.pdfComingSoon'));
        setIsExporting(false);
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const cacheDir = FileSystem.cacheDirectory + 'SaveState_exports/';
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });

      if (format === 'csv') {
        const typeLabels: Record<string, string> = { deposit: t('calendar.deposit', { default: 'Поповнення' }), withdrawal: t('calendar.withdrawal', { default: 'Зняття' }), bonus: 'Бонус' };
        const header = 'Дата,Тип,Категорія,Сума,XP,Примітка';
        const rows = filteredTransactions.map((tx) => {
          const date = new Date(tx.createdAt).toLocaleDateString('uk-UA');
          const typeLabel = typeLabels[tx.type] ?? tx.type;
          const cat = tx.category ?? '';
          const amount = tx.type === 'withdrawal' ? -tx.amount : tx.amount;
          return [escapeCSV(date), escapeCSV(typeLabel), escapeCSV(cat), amount.toString(), tx.xpEarned.toString(), escapeCSV(tx.note ?? '')].join(',');
        });
        const csv = [header, ...rows].join('\n');
        const fileUri = cacheDir + `SaveState_export_${timestamp}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        await shareFile(fileUri, `SaveState_export_${timestamp}.csv`);

      } else if (format === 'json') {
        const exportData = {
          exportedAt: new Date().toISOString(),
          dateRange,
          user: user ? { id: user.id, nickname: user.nickname, level: user.level, totalXp: user.totalXp } : null,
          currentStreak,
          goals: goals.map((g) => ({ id: g.id, title: g.title, targetAmount: g.targetAmount, currentAmount: g.currentAmount, status: g.status, createdAt: g.createdAt })),
          transactions: filteredTransactions.map((tx) => ({ id: tx.id, type: tx.type, amount: tx.amount, category: tx.category, xpEarned: tx.xpEarned, note: tx.note, createdAt: tx.createdAt })),
          quests: quests.map((q) => ({ id: q.id, type: q.type, status: q.status, progress: q.progress, target: q.target, xpReward: q.xpReward })),
          achievements: achievements.filter((a) => a.unlocked).map((a) => ({ id: a.id, achievementId: a.achievementId, unlockedAt: a.unlockedAt })),
        };
        const json = JSON.stringify(exportData, null, 2);
        const fileUri = cacheDir + `SaveState_export_${timestamp}.json`;
        await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
        await shareFile(fileUri, `SaveState_export_${timestamp}.json`);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('stats.export.exportFailed'));
    }
    setIsExporting(false);
  };

  const selectedFormat = FORMATS.find((f) => f.key === format);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('stats.export.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Format Selection */}
        <Text style={styles.sectionTitle}>{t('stats.export.format')}</Text>
        <View style={styles.formatGrid}>
          {FORMATS.map((fmt) => (
            <Card
              key={fmt.key}
              variant={format === fmt.key ? 'outlined' : 'default'}
              selected={format === fmt.key}
              onPress={() => setFormat(fmt.key)}
              style={styles.formatCard}
            >
              <Text style={styles.formatIcon}>{fmt.icon}</Text>
              <Text style={styles.formatLabel}>{fmt.label}</Text>
              <Text style={styles.formatDesc}>{t(fmt.descKey)}</Text>
            </Card>
          ))}
        </View>

        {/* Date Range */}
        <Text style={styles.sectionTitle}>{t('stats.export.dateRange')}</Text>
        <View style={styles.rangeRow}>
          {DATE_RANGES.map((r) => (
            <Chip key={r.key} label={t(r.labelKey)} selected={dateRange === r.key} onPress={() => setDateRange(r.key)} />
          ))}
        </View>

        {/* Category Filters */}
        <Text style={styles.sectionTitle}>{t('stats.export.includeCategories')}</Text>
        <Card style={styles.filterCard}>
          {CATEGORY_KEYS.map((cat) => (
            <View key={cat.key} style={styles.filterRow}>
              <Text style={styles.filterLabel}>{t(cat.labelKey)}</Text>
              <Toggle
                value={includeCategories.has(cat.key)}
                onValueChange={() => toggleCategory(cat.key)}
              />
            </View>
          ))}
        </Card>

        {/* Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('stats.export.summary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('stats.export.format')}:</Text>
            <Text style={styles.summaryValue}>{selectedFormat?.label}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('stats.export.dateRange')}:</Text>
            <Text style={styles.summaryValue}>{DATE_RANGES.find((r) => r.key === dateRange) ? t(DATE_RANGES.find((r) => r.key === dateRange)!.labelKey) : dateRange}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('stats.export.categories')}:</Text>
            <Text style={styles.summaryValue}>{includeCategories.size} {t('stats.export.selected')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('stats.export.transactionCount')}:</Text>
            <Text style={styles.summaryValue}>{filteredTransactions.length}</Text>
          </View>
        </Card>

        {/* Export Button */}
        <Button
          label={isExporting ? t('stats.export.exporting') : `📤 ${t('stats.export.exportData')}`}
          size="lg"
          fullWidth
          loading={isExporting}
          disabled={includeCategories.size === 0}
          onPress={handleExport}
        />
      </ScreenLayout>
    </>
  );
}

const useExportStyles = createStyles((theme) =>
  StyleSheet.create({
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    formatGrid: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    formatCard: { flex: 1, alignItems: 'center', padding: theme.spacing.md },
    formatIcon: { fontSize: 24, marginBottom: theme.spacing.xs },
    formatLabel: { ...theme.typography.labelMedium.style, color: theme.colors.textPrimary, fontWeight: '700' },
    formatDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, textAlign: 'center', marginTop: 2 },
    rangeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
    filterCard: { marginBottom: theme.spacing.lg },
    filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.sm },
    filterLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    summaryCard: { marginBottom: theme.spacing.lg },
    summaryTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.xs },
    summaryLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    summaryValue: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary, fontWeight: '600' },
  }),
);
