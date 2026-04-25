import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Toggle } from '@/components/ui/Toggle';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { formatRelativeTime } from '@/utils/formatters';

interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
}

const CATEGORIES: ExpenseCategory[] = [
  { id: 'food', name: 'Їжа', icon: '🍔' },
  { id: 'transport', name: 'Транспорт', icon: '🚌' },
  { id: 'shopping', name: 'Покупки', icon: '🛍️' },
  { id: 'entertainment', name: 'Розваги', icon: '🎮' },
  { id: 'health', name: 'Здоров\'я', icon: '💊' },
  { id: 'bills', name: 'Комуналка', icon: '🏠' },
  { id: 'education', name: 'Освіта', icon: '📚' },
  { id: 'other', name: 'Інше', icon: '📌' },
];

export default function ExpenseScreen() {
  const theme = useTheme();
  const styles = useExpenseStyles(theme);
  const router = useRouter();
  const { t } = useLocalized();
  const { currency } = useSettingsStore();

  const {
    goals,
    transactions,
    isLoading,
    loadGoals,
    loadTransactions,
    getActiveGoal,
    createTransaction,
  } = useSavingsStore();

  const [amount, setAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await loadGoals();
        await loadTransactions(undefined, 10);
      } catch (e: any) {
        setError(e?.message ?? t('common.error'));
      }
    })();
  }, [loadGoals, loadTransactions, t]);

  const recentExpenses = transactions
    .filter((tx) => tx.type === 'withdrawal')
    .slice(0, 5);

  const fmt = (val: number) => formatCurrency(val, currency);

  const handleSave = useCallback(async () => {
    if (amount <= 0 || !selectedCategory) return;
    setSaving(true);
    try {
      const activeGoal = getActiveGoal();
      if (!activeGoal) {
        setError(t('common.error'));
        setSaving(false);
        return;
      }
      await createTransaction({
        goalId: activeGoal.id,
        type: 'withdrawal',
        amount,
        category: selectedCategory,
        note: note || undefined,
      });
      router.back();
    } catch (e: any) {
      setError(e?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }, [amount, selectedCategory, note, getActiveGoal, createTransaction, router, t]);

  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout>
      <HeaderBar title={t('money.expense.addExpense')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        <AmountInput label={t('money.expense.amount')} value={amount} onChangeAmount={setAmount} />

        <Text style={styles.sectionLabel}>{t('money.expense.category')}</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <Pressable key={cat.id} style={[styles.catItem, selectedCategory === cat.id && styles.catItemActive]} onPress={() => setSelectedCategory(cat.id)}>
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catName, selectedCategory === cat.id && styles.catNameActive]}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: theme.spacing.lg }}>
          <Input label={t('money.expense.date')} placeholder="рррр-мм-дд" value={date} onChangeText={setDate} keyboardType="numeric" />
        </View>
        <View style={{ marginTop: theme.spacing.lg }}>
          <Input label={t('money.expense.note')} placeholder="Коментар до витрати" value={note} onChangeText={setNote} />
        </View>

        <View style={styles.recurringRow}>
          <View style={styles.recurringInfo}>
            <Text style={styles.recurringTitle}>{t('money.income.recurring')}</Text>
            <Text style={styles.recurringDesc}>Щомісячне списання</Text>
          </View>
          <Toggle value={recurring} onValueChange={setRecurring} />
        </View>

        <Button label={t('common.save')} fullWidth onPress={handleSave} loading={saving} disabled={amount <= 0 || !selectedCategory} style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing['2xl'] }} />

        {/* Recent expenses */}
        {recentExpenses.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>{t('money.expense.recent')}</Text>
            <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing['2xl'] }}>
              {recentExpenses.map((tx) => (
                <Card key={tx.id} style={{ padding: theme.spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, marginRight: theme.spacing.sm }}>💸</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary }}>
                        {tx.note ?? tx.category ?? tx.type}
                      </Text>
                      <Text style={{ ...theme.typography.caption.style, color: theme.colors.textTertiary }}>
                        {tx.createdAt instanceof Date
                          ? formatRelativeTime(tx.createdAt)
                          : formatRelativeTime(new Date(tx.createdAt))}
                      </Text>
                    </View>
                    <Text style={{ ...theme.typography.bodyLarge.style, fontWeight: '600', color: theme.colors.accentRed }}>
                      -{fmt(tx.amount)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const useExpenseStyles = createStyles((theme) =>
  StyleSheet.create({
    sectionLabel: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary, marginTop: theme.spacing.lg },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    catItem: { width: '22%', alignItems: 'center', padding: theme.spacing.sm, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.borderSubtle },
    catItemActive: { borderColor: theme.colors.accentBlue, backgroundColor: `${theme.colors.accentBlue}20` },
    catIcon: { fontSize: 28 },
    catName: { ...theme.typography.caption.style, color: theme.colors.textSecondary, marginTop: 4 },
    catNameActive: { color: theme.colors.accentBlue },
    recurringRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.lg, padding: theme.spacing.md, backgroundColor: theme.colors.bgSecondary, borderRadius: theme.radii.md },
    recurringInfo: { flex: 1 },
    recurringTitle: { ...theme.typography.bodyMedium.style, color: theme.colors.textPrimary },
    recurringDesc: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
  }),
);
