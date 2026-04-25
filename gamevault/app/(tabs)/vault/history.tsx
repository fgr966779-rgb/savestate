/**
 * Screen 11 — Transaction History
 *
 * Full transaction list with filter chips, grouped by date (sticky headers),
 * swipe-to-delete/edit, pull-to-refresh with gaming coin spinner,
 * and infinite scroll pagination.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  spacing,
  typography,
} from '@/constants/theme';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { TransactionItem } from '@/components/shared/TransactionItem';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Types ──────────────────────────────────────────────────────────

type FilterType = 'all' | 'deposit' | 'withdrawal' | 'bonus';

interface FilterChip {
  key: FilterType;
  labelKey: string;
}

interface GroupedTransaction {
  date: string;
  dateLabel: string;
  data: Array<{
    id: string;
    type: 'deposit' | 'withdrawal' | 'bonus';
    amount: number;
    category: string;
    date: string;
    xpEarned?: number;
    note?: string;
  }>;
}

const PAGE_SIZE = 20;

// ── Helpers ──────────────────────────────────────────────────────

function groupByDate(
  transactions: Array<{
    id: string; type: 'deposit' | 'withdrawal' | 'bonus';
    amount: number; category: string; createdAt: Date | string;
    xpEarned: number; note: string | null; goalId: string; userId: string;
  }>,
  fallbackCategory: string,
): GroupedTransaction[] {
  const groups = new Map<string, GroupedTransaction>();

  for (const tx of transactions) {
    const dateStr = tx.createdAt instanceof Date
      ? tx.createdAt.toISOString().split('T')[0]
      : new Date(tx.createdAt).toISOString().split('T')[0];

    if (!groups.has(dateStr)) {
      groups.set(dateStr, { date: dateStr, dateLabel: formatGroupDate(dateStr), data: [] });
    }
    groups.get(dateStr)!.data.push({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      category: tx.category ?? fallbackCategory,
      date: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
      xpEarned: tx.xpEarned,
      note: tx.note ?? undefined,
    });
  }

  return Array.from(groups.values());
}

function formatGroupDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // These will be overwritten by the component using the t() function
  if (dateStr === today) return 'TODAY';
  if (dateStr === yesterday) return 'YESTERDAY';

  const date = new Date(dateStr);
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Component ─────────────────────────────────────────────────────

export default function VaultHistory() {
  const theme = useTheme();
  const styles = useHistoryStyles(theme);
  const c = theme.colors;
  const { t } = useLocalized();

  const { transactions, isLoading, loadTransactions, deleteTransaction } = useSavingsStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Filter chips (i18n) ───────────────────────────────────────
  const FILTERS: FilterChip[] = useMemo(() => [
    { key: 'all', labelKey: t('vault.history.filterAll') },
    { key: 'deposit', labelKey: t('vault.history.filterDeposits') },
    { key: 'withdrawal', labelKey: t('vault.history.filterWithdrawals') },
    { key: 'bonus', labelKey: t('vault.history.filterBonuses') },
  ], [t]);

  // ── Localized group date formatter ────────────────────────────
  const localizedGroupByDate = useCallback(
    (txs: typeof transactions) => groupByDate(txs, t('vault.history.otherCategory')),
    [t],
  );

  // ── Data Loading ────────────────────────────────────────────────
  useEffect(() => {
    loadTransactions(undefined, PAGE_SIZE, 0);
  }, [loadTransactions]);

  // ── Filtered & Grouped ──────────────────────────────────────────
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    return transactions.filter((tx) => tx.type === activeFilter);
  }, [transactions, activeFilter]);

  const grouped = useMemo(() => localizedGroupByDate(filtered), [filtered, localizedGroupByDate]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleFilterChange = useCallback((key: FilterType) => {
    triggerHaptic('buttonPress');
    setActiveFilter(key);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    await loadTransactions(undefined, PAGE_SIZE, 0);
    setRefreshing(false);
  }, [loadTransactions]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || filtered.length < PAGE_SIZE) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await loadTransactions(undefined, PAGE_SIZE, nextPage * PAGE_SIZE);
    setLoadingMore(false);
  }, [loadingMore, filtered.length, page, loadTransactions]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(t('vault.history.deleteTitle'), t('vault.history.deleteMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            triggerHaptic('error');
            deleteTransaction(id);
          },
        },
      ]);
    },
    [deleteTransaction, t],
  );

  const handleEdit = useCallback(
    (id: string) => {
      triggerHaptic('buttonPress');
      const tx = transactions.find((item) => item.id === id);
      if (tx) {
        router.push({
          pathname: tx.type === 'deposit' ? '/(tabs)/vault/deposit' : '/(tabs)/vault/withdraw',
          params: { editId: id },
        });
      }
    },
    [transactions],
  );

  // ── Render ──────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: GroupedTransaction['data'][0] }) => (
    <View
      accessible
      accessibilityLabel={`${item.type === 'deposit' ? '+' : '-'}${item.amount} — ${item.category}`}
    >
      <TransactionItem
        id={item.id}
        type={item.type}
        amount={item.amount}
        category={item.category}
        date={item.date}
        xpEarned={item.xpEarned}
        note={item.note}
        currency="UAH"
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </View>
  );

  const sections = useMemo(
    () => grouped.map((g) => ({
      date: g.date,
      dateLabel: g.dateLabel === 'TODAY'
        ? t('common.today')
        : g.dateLabel === 'YESTERDAY'
          ? t('common.yesterday')
          : g.dateLabel,
      data: g.data,
    })),
    [grouped, t],
  );

  // ── Loading State ───────────────────────────────────────────────
  if (isLoading && transactions.length === 0) {
    return (
      <ScreenLayout scrollable withBottomTabBar>
        <View style={styles.filtersRow}>
          {FILTERS.map((f) => (
            <Skeleton key={f.key} variant="card" />
          ))}
        </View>
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="listItem" />
        ))}
      </ScreenLayout>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bgPrimary }]}>
      {/* ── Filter Chips ─────────────────────────────────────────── */}
      <View style={[styles.filtersRow, { backgroundColor: c.bgPrimary }]}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.labelKey}
            selected={activeFilter === f.key}
            onPress={() => handleFilterChange(f.key)}
          />
        ))}
      </View>

      {/* ── Transaction List ─────────────────────────────────────── */}
      {sections.length > 0 ? (
        <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
          <View style={{ paddingHorizontal: theme.semanticSpacing.screenPadding, flex: 1 }}>
            {sections.map((section) => (
              <View key={section.date}>
                <View style={[styles.sectionHeader, { backgroundColor: c.bgPrimary }]}>
                  <Text style={styles.sectionHeaderText}>{section.dateLabel}</Text>
                </View>
                {section.data.map((item) => (
                  <View key={item.id}>{renderItem({ item })}</View>
                ))}
              </View>
            ))}

            {loadingMore && (
              <View style={styles.loadMoreIndicator}>
                <Skeleton variant="listItem" />
              </View>
            )}

            {/* Load More Trigger */}
            {!loadingMore && filtered.length >= PAGE_SIZE && (
              <Text
                style={styles.loadMoreText}
                onPress={handleLoadMore}
              >
                {t('vault.history.loadMore')}
              </Text>
            )}
          </View>
        </PullToRefresh>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="📋"
            title={t('vault.history.noTransactions')}
            description={activeFilter !== 'all'
              ? t('vault.history.noFilteredTransactions')
              : t('vault.history.noTransactionsHint')}
          />
        </View>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const useHistoryStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    filtersRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.semanticSpacing.screenPadding,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      flexWrap: 'wrap',
    },
    stickyHeader: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      position: 'sticky' as const,
      top: 0,
      zIndex: 10,
    },
    stickyHeaderText: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textTertiary,
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
    },
    sectionHeader: {
      paddingVertical: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    sectionHeaderText: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textTertiary,
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
    },
    loadMoreIndicator: {
      paddingVertical: theme.spacing.md,
    },
    loadMoreText: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.accentBlue,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
    },
    emptyContainer: {
      flex: 1,
      paddingTop: theme.spacing['3xl'],
    },
  }),
);
