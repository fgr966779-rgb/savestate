import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transport: '🚌',
  entertainment: '🎮',
  bills: '🏠',
  health: '💊',
  education: '📚',
  shopping: '🛍️',
  other: '📌',
  default: '📊',
};

export default function BudgetScreen() {
  const theme = useTheme();
  const styles = useBudgetStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore();

  const {
    goals,
    transactions,
    isLoading,
    loadGoals,
    loadTransactions,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useSavingsStore();

  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        await loadGoals();
        await loadTransactions();
      } catch (e: any) {
        setError(e?.message ?? t('common.error'));
      }
    })();
  }, [loadGoals, loadTransactions, t]);

  // Compute spent per goal from withdrawal transactions
  const spentByGoal = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === 'withdrawal') {
        map[tx.goalId] = (map[tx.goalId] ?? 0) + tx.amount;
      }
    }
    return map;
  }, [transactions]);

  const totalBudget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSpent = goals.reduce((s, g) => s + (spentByGoal[g.id] ?? 0), 0);

  const fmt = (val: number) => formatCurrency(val, currency);

  const handleEditGoal = useCallback((goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setEditTitle(goal.title);
      setEditAmount(goal.targetAmount);
      setEditingId(goalId);
    }
  }, [goals]);

  const handleNewBudget = useCallback(() => {
    setEditTitle('');
    setEditAmount(0);
    setEditingId('new');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    try {
      if (editingId === 'new') {
        if (editTitle.trim() && editAmount > 0) {
          await createGoal({ title: editTitle.trim(), targetAmount: editAmount });
        }
      } else {
        await updateGoal(editingId, {
          ...(editTitle.trim() ? { title: editTitle.trim() } : {}),
          ...(editAmount > 0 ? { targetAmount: editAmount } : {}),
        });
      }
      setEditingId(null);
      setEditTitle('');
      setEditAmount(0);
    } catch (e: any) {
      setError(e?.message ?? t('common.error'));
    }
  }, [editingId, editTitle, editAmount, createGoal, updateGoal, t]);

  const handleDeleteGoal = useCallback(async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      if (editingId === goalId) {
        setEditingId(null);
      }
    } catch (e: any) {
      setError(e?.message ?? t('common.error'));
    }
  }, [deleteGoal, editingId]);

  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout loading={isLoading} withBottomTabBar>
      <HeaderBar title={t('money.budget.title')} rightActions={[{ icon: '＋', onPress: handleNewBudget }]} />

      {/* Monthly overview */}
      <Card style={styles.overviewCard}>
        <Text style={styles.overviewLabel}>{t('money.budget.monthlyBudget')}</Text>
        <Text style={styles.overviewBudget}>{fmt(totalBudget)}</Text>
        <LinearProgress progress={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} color={totalSpent > totalBudget ? theme.colors.accentRed : theme.colors.accentBlue} showLabel style={{ marginTop: theme.spacing.sm }} />
        <View style={styles.overviewRow}>
          <Text style={styles.overviewSpent}>{t('money.budget.spent')}: {fmt(totalSpent)}</Text>
          <Text style={styles.overviewRemain}>{t('money.budget.remaining')}: {fmt(Math.max(0, totalBudget - totalSpent))}</Text>
        </View>
      </Card>

      {/* Category budgets (goals as budget categories) */}
      {goals.length === 0 ? (
        <EmptyState icon="📊" title={t('common.noData')} description={t('money.budget.setBudget')} />
      ) : (
        <View style={styles.budgetList}>
          {goals.map((g) => {
            const spent = spentByGoal[g.id] ?? 0;
            const pct = g.targetAmount > 0 ? (spent / g.targetAmount) * 100 : 0;
            const isOver = spent > g.targetAmount;
            const remaining = g.targetAmount - spent;
            const icon = CATEGORY_ICONS[g.title.toLowerCase()] ?? CATEGORY_ICONS.default;

            return (
              <Card key={g.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetNameRow}>
                    <Text style={styles.budgetIcon}>{g.icon ?? icon}</Text>
                    <Text style={styles.budgetName}>{g.title}</Text>
                    {isOver && (
                      <Text style={styles.overBadge}>{t('money.budget.overBudget')}!</Text>
                    )}
                  </View>
                  <Text style={styles.budgetAmount}>{fmt(spent)} / {fmt(g.targetAmount)}</Text>
                </View>
                <LinearProgress progress={Math.min(pct, 100)} color={isOver ? theme.colors.accentRed : theme.colors.accentBlue} height={6} style={{ marginTop: theme.spacing.sm }} />
                <Text style={[styles.budgetRemaining, { color: remaining >= 0 ? theme.colors.accentGreen : theme.colors.accentRed }]}>
                  {remaining >= 0
                    ? `${t('money.budget.remaining')}: ${fmt(remaining)}`
                    : `${t('money.budget.overBudget')}: ${fmt(Math.abs(remaining))}`}
                </Text>
                <View style={styles.budgetActions}>
                  <Button label={t('common.edit')} variant="ghost" size="sm" onPress={() => handleEditGoal(g.id)} />
                  <Button label={t('common.delete')} variant="ghost" size="sm" onPress={() => handleDeleteGoal(g.id)} />
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* Edit / New budget card */}
      {editingId && (
        <Card style={styles.editCard}>
          <Text style={styles.editTitle}>
            {editingId === 'new' ? t('money.budget.setBudget') : t('common.edit')}
          </Text>
          <Input label={t('money.expense.category')} placeholder="Назва" value={editTitle} onChangeText={setEditTitle} />
          <AmountInput label={t('money.budget.monthlyBudget')} value={editAmount} onChangeAmount={setEditAmount} />
          <View style={styles.editButtons}>
            <Button label={t('common.cancel')} variant="secondary" onPress={() => { setEditingId(null); setEditTitle(''); setEditAmount(0); }} size="sm" />
            <Button label={t('common.save')} onPress={handleSaveEdit} size="sm" />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useBudgetStyles = createStyles((theme) =>
  StyleSheet.create({
    overviewCard: { marginTop: theme.spacing.md, padding: theme.spacing.lg },
    overviewLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    overviewBudget: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.xs },
    overviewRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.sm },
    overviewSpent: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
    overviewRemain: { ...theme.typography.bodySmall.style, color: theme.colors.accentGreen },
    budgetList: { marginTop: theme.spacing.md, gap: theme.spacing.md },
    budgetCard: { padding: theme.spacing.md },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    budgetNameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    budgetIcon: { fontSize: 20, marginRight: theme.spacing.sm },
    budgetName: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    overBadge: { ...theme.typography.caption.style, color: theme.colors.accentRed, fontWeight: '700', marginLeft: theme.spacing.sm },
    budgetAmount: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
    budgetRemaining: { ...theme.typography.caption.style, marginTop: 4 },
    budgetActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    editCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    editTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    editButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
