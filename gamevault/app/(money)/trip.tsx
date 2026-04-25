import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

const TRIP_DAYS = 10;

const CATEGORY_META: Record<string, { icon: string; key: string }> = {
  'Транспорт': { icon: '✈️', key: 'transport' },
  'Проживання': { icon: '🏨', key: 'accommodation' },
  'Їжа': { icon: '🍽️', key: 'food' },
  'Розваги': { icon: '🎭', key: 'activities' },
  'Покупки': { icon: '🛍️', key: 'shopping' },
};

export default function TripScreen() {
  const theme = useTheme();
  const styles = useTripStyles(theme);
  const { t } = useLocalized();
  const { goals, transactions, loadGoals, loadTransactions, createTransaction, isLoading } = useSavingsStore();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState(0);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
    loadTransactions();
  }, [loadGoals, loadTransactions]);

  const tripGoal = useMemo(() => goals.find(g => g.status === 'active'), [goals]);
  const tripBudget = tripGoal?.targetAmount ?? 0;
  const tripSaved = tripGoal?.currentAmount ?? 0;

  // Derive category budgets from goal target (equal split across known categories)
  const knownCategories = useMemo(() => {
    const cats = [...new Set(transactions.map(tx => tx.category).filter(Boolean) as string[])];
    const defaultCats = ['Транспорт', 'Проживання', 'Їжа', 'Розваги', 'Покупки'];
    return defaultCats.filter(c => !cats.includes(c)).concat(cats);
  }, [transactions]);

  const categoryBudgets = useMemo(() => {
    const perCategory = tripBudget > 0 ? Math.floor(tripBudget / Math.max(knownCategories.length, 1)) : 0;
    return knownCategories.map(name => {
      const spent = transactions
        .filter(tx => tx.category === name && tx.type === 'withdrawal')
        .reduce((s, tx) => s + tx.amount, 0);
      const meta = CATEGORY_META[name] ?? { icon: '📌', key: name.toLowerCase() };
      return {
        key: meta.key,
        name,
        icon: meta.icon,
        budget: perCategory,
        spent,
      };
    });
  }, [transactions, knownCategories, tripBudget]);

  const expenses = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'withdrawal')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(tx => ({
        id: tx.id,
        name: tx.note ?? tx.category ?? t('money.trip.expense'),
        amount: tx.amount,
        category: tx.category ?? t('money.trip.other'),
      }));
  }, [transactions, t]);

  const totalSpent = categoryBudgets.reduce((s, c) => s + c.spent, 0);
  const remaining = Math.max(0, tripBudget - totalSpent);
  const dailyLimit = remaining > 0 ? Math.floor(remaining / (TRIP_DAYS - 3)) : 0;

  const handleAddExpense = async () => {
    if (!newName.trim() || newAmount <= 0) return;
    const activeGoal = tripGoal;
    if (!activeGoal) return;
    try {
      await createTransaction({
        goalId: activeGoal.id,
        type: 'withdrawal',
        amount: newAmount,
        category: newCategory || null,
        note: newName,
      });
      setShowAddExpense(false);
      setNewName('');
      setNewAmount(0);
      setNewCategory('');
    } catch {
      setError(t('common.error'));
    }
  };

  if (isLoading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.trip.title')} rightActions={[{ icon: '＋', onPress: () => setShowAddExpense(!showAddExpense) }]} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        {/* Trip overview */}
        <Card style={styles.overviewCard}>
          <Text style={styles.overviewLabel}>{t('money.trip.budget')}</Text>
          <Text style={styles.overviewBudget}>{formatCurrency(tripBudget)}</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewItemLabel}>{t('money.trip.expenses')}</Text>
              <Text style={[styles.overviewItemValue, { color: theme.colors.accentRed }]}>{formatCurrency(totalSpent)}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewItemLabel}>{t('money.trip.remaining')}</Text>
              <Text style={[styles.overviewItemValue, { color: theme.colors.accentGreen }]}>{formatCurrency(remaining)}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewItemLabel}>{t('money.trip.dailyLimit')}</Text>
              <Text style={[styles.overviewItemValue, { color: theme.colors.accentBlue }]}>{formatCurrency(dailyLimit)}</Text>
            </View>
          </View>
          <LinearProgress progress={tripBudget > 0 ? (totalSpent / tripBudget) * 100 : 0} color={totalSpent > tripBudget * 0.8 ? theme.colors.accentRed : theme.colors.accentBlue} height={8} showLabel style={{ marginTop: theme.spacing.md }} />
        </Card>

        {/* Category budgets */}
        <Text style={styles.sectionTitle}>{t('money.trip.categoryBudgets')}</Text>
        <View style={styles.categoryList}>
          {categoryBudgets.map(cat => {
            const pct = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
            const isOver = cat.spent > cat.budget;
            return (
              <Card key={cat.key} style={styles.categoryCard}>
                <View style={styles.categoryRow}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <LinearProgress progress={Math.min(pct, 100)} color={isOver ? theme.colors.accentRed : theme.colors.accentBlue} height={4} style={{ marginTop: 4 }} />
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categorySpent}>{formatCurrency(cat.spent)}</Text>
                    <Text style={styles.categoryBudget}>/ {formatCurrency(cat.budget)}</Text>
                  </View>
                </View>
                {isOver && <Badge variant="status" text={t('money.trip.overBudget')} status="error" style={{ marginTop: 4, alignSelf: 'flex-start' }} />}
              </Card>
            );
          })}
        </View>

        {/* Recent expenses */}
        <Text style={styles.sectionTitle}>{t('money.trip.expenses')}</Text>
        {expenses.length === 0 ? (
          <EmptyState icon="✈️" title={t('money.trip.noExpenses')} description={t('money.trip.noExpensesDesc')} />
        ) : (
          <View style={styles.expenseList}>
            {expenses.map(exp => (
              <View key={exp.id} style={styles.expenseRow}>
                <Text style={styles.expenseName}>{exp.name}</Text>
                <Text style={styles.expenseCategory}>{exp.category}</Text>
                <Text style={styles.expenseAmount}>{formatCurrency(exp.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Add expense */}
        {showAddExpense && (
          <Card style={styles.addCard}>
            <Text style={styles.addTitle}>{t('money.trip.newExpense')}</Text>
            <Input label={t('money.trip.expenseName')} placeholder={t('money.trip.expenseNamePlaceholder')} value={newName} onChangeText={setNewName} />
            <AmountInput label={t('common.amount')} value={newAmount} onChangeAmount={setNewAmount} />
            <Input label={t('money.trip.expenseCategory')} placeholder={t('money.trip.expenseCategoryPlaceholder')} value={newCategory} onChangeText={setNewCategory} />
            <View style={styles.addButtons}>
              <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowAddExpense(false)} />
              <Button label={t('common.add')} size="sm" onPress={handleAddExpense} disabled={!newName.trim() || newAmount <= 0} />
            </View>
          </Card>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const useTripStyles = createStyles((theme) =>
  StyleSheet.create({
    overviewCard: { padding: theme.spacing.lg, alignItems: 'center' },
    overviewLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    overviewBudget: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.xs },
    overviewRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: theme.spacing.md },
    overviewItem: { flex: 1, alignItems: 'center' },
    overviewItemLabel: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    overviewItemValue: { ...theme.typography.bodyMedium.style, fontWeight: '700', marginTop: 2 },
    sectionTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary, marginTop: theme.spacing.xl },
    categoryList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    categoryCard: { padding: theme.spacing.md },
    categoryRow: { flexDirection: 'row', alignItems: 'center' },
    categoryIcon: { fontSize: 24, marginRight: theme.spacing.sm },
    categoryInfo: { flex: 1 },
    categoryName: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    categoryRight: { alignItems: 'flex-end' },
    categorySpent: { ...theme.typography.bodySmall.style, color: theme.colors.textPrimary, fontWeight: '600' },
    categoryBudget: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    expenseList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    expenseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSubtle },
    expenseName: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary, flex: 1 },
    expenseCategory: { ...theme.typography.caption.style, color: theme.colors.textTertiary, width: 90 },
    expenseAmount: { ...theme.typography.bodyMedium.style, color: theme.colors.accentRed, fontWeight: '600' },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
