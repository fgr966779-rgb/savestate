import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LinearProgress } from '@/components/ui/LinearProgress';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Їжа': '🍔',
  'Транспорт': '🚌',
  'Покупки': '🛍️',
  'Розваги': '🎮',
  'Здоров\'я': '💊',
  'Комуналка': '🏠',
  'Освіта': '📚',
  'Інше': '📌',
};

const CATEGORY_COLORS = [
  '#FF6B00', '#00AAFF', '#9D4EDD', '#00FF88',
  '#FF3B3B', '#FFD700', '#0070D1', '#A0A0C0',
  '#FF69B4', '#20B2AA', '#FF8C00', '#7B68EE',
];

export default function CategoriesScreen() {
  const theme = useTheme();
  const styles = useCategoriesStyles(theme);
  const { t } = useLocalized();
  const { transactions, loadTransactions, isLoading } = useSavingsStore();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [newColor, setNewColor] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Derive categories from unique categories in withdrawal transactions
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    transactions.forEach(tx => {
      if (tx.type === 'withdrawal' && tx.category) {
        catMap.set(tx.category, (catMap.get(tx.category) ?? 0) + tx.amount);
      }
    });

    return Array.from(catMap.entries()).map(([name, spent], index) => ({
      id: `cat-${index}`,
      name,
      icon: CATEGORY_ICONS[name] ?? '📌',
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      spent,
    }));
  }, [transactions]);

  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);

  if (isLoading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.categories.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }]} />

      {/* Total */}
      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>{t('money.categories.monthlySpending')}</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalSpent)}</Text>
        <Text style={styles.totalCategories}>{t('money.categories.countCategories', { count: categories.length })}</Text>
      </Card>

      {/* Categories list */}
      {categories.length === 0 ? (
        <EmptyState icon="🏷️" title={t('money.categories.noCategories')} description={t('money.categories.noCategoriesDesc')} />
      ) : (
        <View style={styles.categoryList}>
          {categories.map(cat => {
            const pct = totalSpent > 0 ? (cat.spent / totalSpent) * 100 : 0;
            return (
              <Card key={cat.id} style={styles.categoryCard} onPress={() => setEditingId(editingId === cat.id ? null : cat.id)}>
                <View style={styles.categoryRow}>
                  <View style={[styles.iconWrap, { backgroundColor: `${cat.color}20` }]}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <LinearProgress progress={pct} color={cat.color} height={4} style={{ marginTop: 4 }} />
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>{formatCurrency(cat.spent)}</Text>
                    <Text style={styles.categoryPct}>{pct.toFixed(1)}%</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* Edit form */}
      {editingId && (
        <Card style={styles.editCard}>
          <Text style={styles.editTitle}>{t('money.categories.editCategory')}</Text>
          <Input label={t('money.categories.name')} placeholder={t('money.categories.namePlaceholder')} />
          <Input label={t('money.categories.color')} placeholder="#FF6B00" keyboardType="default" />
          <View style={styles.editButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setEditingId(null)} />
            <Button label={t('common.save')} size="sm" onPress={() => setEditingId(null)} />
          </View>
        </Card>
      )}

      {/* Add form */}
      {showAdd && (
        <Card style={styles.editCard}>
          <Text style={styles.editTitle}>{t('money.categories.addCategory')}</Text>
          <Input label={t('money.categories.name')} placeholder={t('money.categories.namePlaceholder')} value={newName} onChangeText={setNewName} />
          <Input label={t('money.categories.icon')} placeholder="📌" value={newIcon} onChangeText={setNewIcon} />
          <Input label={t('money.categories.color')} placeholder="#00AAFF" value={newColor} onChangeText={setNewColor} />
          <View style={styles.editButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowAdd(false)} />
            <Button label={t('common.add')} size="sm" onPress={() => setShowAdd(false)} disabled={!newName.trim()} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useCategoriesStyles = createStyles((theme) =>
  StyleSheet.create({
    totalCard: { marginTop: theme.spacing.md, alignItems: 'center', padding: theme.spacing.lg },
    totalLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    totalAmount: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.xs },
    totalCategories: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: theme.spacing.xs },
    categoryList: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    categoryCard: { padding: theme.spacing.md },
    categoryRow: { flexDirection: 'row', alignItems: 'center' },
    iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
    catIcon: { fontSize: 20 },
    categoryInfo: { flex: 1 },
    categoryName: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    categoryRight: { alignItems: 'flex-end', gap: 2 },
    categoryAmount: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary, fontWeight: '600' },
    categoryPct: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    editCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    editTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    editButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
