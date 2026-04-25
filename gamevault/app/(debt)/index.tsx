import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LinearProgress } from '@/components/ui/LinearProgress';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useLocalized } from '@/hooks/useLocalized';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { formatCurrency } from '@/utils/formatters';

interface DebtItem {
  id: string;
  name: string;
  amount: number;
  paid: number;
  dueDate: string;
  direction: 'owed' | 'owing';
  category: string;
}

type DebtTab = 'owing' | 'owed' | 'all';

export default function DebtScreen() {
  const theme = useTheme();
  const styles = useDebtStyles(theme);
  const router = useRouter();
  const { t } = useLocalized();
  const { currency } = useSettingsStore();

  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [activeTab, setActiveTab] = useState<DebtTab>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalOwing = debts.filter(d => d.direction === 'owing').reduce((s, d) => s + (d.amount - d.paid), 0);
  const totalOwed = debts.filter(d => d.direction === 'owed').reduce((s, d) => s + (d.amount - d.paid), 0);
  const netBalance = totalOwed - totalOwing;

  const filteredDebts = debts.filter(d => {
    if (activeTab === 'owing') return d.direction === 'owing';
    if (activeTab === 'owed') return d.direction === 'owed';
    return true;
  });

  const handleRetry = useCallback(() => { setError(null); }, []);

  const handleDelete = useCallback(async (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  }, []);

  if (error) return <ScreenLayout><ErrorState message={error} onRetry={handleRetry} retryLabel={t('common.retry')} /></ScreenLayout>;

  const tabs: { key: DebtTab; label: string }[] = [
    { key: 'owing', label: t('debt.main.owing', 'I owe') },
    { key: 'owed', label: t('debt.main.owed', 'Owed to me') },
    { key: 'all', label: t('common.all') },
  ];

  return (
    <ScreenLayout loading={loading} withBottomTabBar>
      <HeaderBar title={t('debt.main.title')} />

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('debt.main.owing', 'I owe')}</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.accentRed }]}>{formatCurrency(totalOwing, currency)}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('debt.main.owed', 'Owed to me')}</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.accentGreen }]}>{formatCurrency(totalOwed, currency)}</Text>
        </Card>
      </View>
      <Card style={styles.netCard}>
        <Text style={styles.summaryLabel}>{t('debt.main.remaining')}</Text>
        <Text style={[styles.netValue, { color: netBalance >= 0 ? theme.colors.accentGreen : theme.colors.accentRed }]}>
          {netBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netBalance), currency)}
        </Text>
      </Card>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map(tab => (
          <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Debt list */}
      {filteredDebts.length === 0 ? (
        <EmptyState icon="💰" title={t('debt.main.noDebts')} description={t('debt.main.debtFree')} />
      ) : (
        <View style={styles.debtList}>
          {filteredDebts.map(item => {
            const remaining = item.amount - item.paid;
            const progress = item.amount > 0 ? (item.paid / item.amount) * 100 : 0;
            return (
              <Card key={item.id} style={styles.debtCard} onPress={() => router.push('/(debt)/payment?id=' + item.id)}>
                <View style={styles.debtHeader}>
                  <Text style={styles.debtName}>{item.name}</Text>
                  <Badge variant="status" text={item.category} status={item.direction === 'owing' ? 'error' : 'success'} />
                </View>
                <Text style={styles.debtAmount}>{formatCurrency(remaining, currency)}</Text>
                <Text style={styles.debtDue}>{t('common.date')}: {item.dueDate}</Text>
                <LinearProgress progress={progress} color={item.direction === 'owing' ? theme.colors.accentOrange : theme.colors.accentGreen} showLabel style={{ marginTop: 8 }} />
              </Card>
            );
          })}
        </View>
      )}

      {/* FAB */}
      <Pressable style={[styles.fab, { backgroundColor: theme.colors.accentBlue }]} onPress={() => router.push('/(debt)/add')}>
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>
    </ScreenLayout>
  );
}

const useDebtStyles = createStyles((theme) =>
  StyleSheet.create({
    summaryRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md },
    summaryCard: { flex: 1, padding: theme.spacing.md },
    summaryLabel: { ...theme.typography.caption.style, color: theme.colors.textSecondary },
    summaryValue: { ...theme.typography.headingSmall.style, marginTop: theme.spacing.xs },
    netCard: { marginTop: theme.spacing.sm, alignItems: 'center', padding: theme.spacing.md },
    netValue: { ...theme.typography.headingLarge.style, marginTop: theme.spacing.xs },
    tabsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.lg, backgroundColor: theme.colors.bgTertiary, borderRadius: theme.radii.md, padding: 4 },
    tab: { flex: 1, paddingVertical: theme.spacing.sm, alignItems: 'center', borderRadius: theme.radii.sm },
    tabActive: { backgroundColor: theme.colors.bgSecondary },
    tabText: { ...theme.typography.labelMedium.style, color: theme.colors.textTertiary },
    tabTextActive: { color: theme.colors.textPrimary },
    debtList: { marginTop: theme.spacing.md, gap: theme.spacing.md },
    debtCard: { padding: theme.spacing.md },
    debtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    debtName: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    debtAmount: { ...theme.typography.headingSmall.style, color: theme.colors.accentGold, marginTop: theme.spacing.xs },
    debtDue: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', ...theme.shadows.elevation3 },
    fabIcon: { fontSize: 28, color: '#FFFFFF', fontWeight: '700' },
  }),
);
