import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

interface TransactionTemplate {
  id: string;
  name: string;
  category: string;
  amount: number | null;
  note: string | null;
}

export default function TemplatesScreen() {
  const theme = useTheme();
  const styles = useTemplatesStyles(theme);
  const { t } = useLocalized();
  const { transactions, goals, loadGoals, loadTransactions, createTransaction, isLoading } = useSavingsStore();

  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
    loadTransactions();
  }, [loadGoals, loadTransactions]);

  // Build templates from unique recurring transaction patterns
  const derivedTemplates = useMemo(() => {
    const seen = new Map<string, TransactionTemplate>();
    transactions.forEach(tx => {
      if (!tx.category) return;
      const key = `${tx.category}-${tx.note ?? ''}`;
      if (!seen.has(key)) {
        seen.set(key, {
          id: tx.id,
          name: tx.note ?? tx.category,
          category: tx.category,
          amount: tx.amount,
          note: tx.note,
        });
      }
    });
    return Array.from(seen.values());
  }, [transactions]);

  // Use derived templates from store if local list is empty
  const activeTemplates = useMemo(() => {
    if (templates.length === 0) return derivedTemplates;
    return templates;
  }, [templates, derivedTemplates]);

  const handleUseTemplate = (tmpl: TransactionTemplate) => {
    const activeGoal = goals.find(g => g.status === 'active');
    if (!activeGoal) {
      Alert.alert(t('common.error'), t('money.templates.noActiveGoal'));
      return;
    }
    Alert.alert(t('money.templates.quickAdd'), t('money.templates.confirmCreate', { name: tmpl.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.add'),
        onPress: async () => {
          try {
            await createTransaction({
              goalId: activeGoal.id,
              type: 'withdrawal',
              amount: tmpl.amount ?? 0,
              category: tmpl.category || null,
              note: tmpl.name,
            });
          } catch {
            setError(t('common.error'));
          }
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('common.delete'), t('money.templates.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => setTemplates(prev => prev.filter(t => t.id !== id)) },
    ]);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newTemplate: TransactionTemplate = {
      id: String(Date.now()),
      name: newName,
      category: newCategory,
      amount: newAmount > 0 ? newAmount : null,
      note: newNote || null,
    };
    setTemplates(prev => [...prev, newTemplate]);
    setShowCreate(false);
    setNewName('');
    setNewCategory('');
    setNewAmount(0);
    setNewNote('');
  };

  if (isLoading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.templates.title')} rightActions={[{ icon: '＋', onPress: () => setShowCreate(!showCreate) }]} />

      {activeTemplates.length === 0 ? (
        <EmptyState icon="📋" title={t('money.templates.noTemplates')} description={t('money.templates.noTemplatesDesc')} ctaLabel={t('money.templates.createTemplate')} onCta={() => setShowCreate(true)} />
      ) : (
        <View style={styles.templateList}>
          {activeTemplates.map(tmpl => (
            <Card key={tmpl.id} style={styles.templateCard}>
              <Pressable onPress={() => handleUseTemplate(tmpl)} onLongPress={() => setEditingId(editingId === tmpl.id ? null : tmpl.id)}>
                <View style={styles.templateRow}>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{tmpl.name}</Text>
                    <Text style={styles.templateCategory}>{tmpl.category}</Text>
                    {tmpl.note ? <Text style={styles.templateNote}>{tmpl.note}</Text> : null}
                  </View>
                  <View style={styles.templateRight}>
                    <Text style={styles.templateAmount}>{tmpl.amount ? formatCurrency(tmpl.amount) : '—'}</Text>
                    <Badge variant="status" text={t('money.templates.useTemplate')} status="info" />
                  </View>
                </View>
              </Pressable>
              {editingId === tmpl.id && (
                <View style={styles.editActions}>
                  <Button label={t('money.templates.edit')} variant="secondary" size="sm" onPress={() => setEditingId(null)} />
                  <Button label={t('common.delete')} variant="danger" size="sm" onPress={() => { handleDelete(tmpl.id); setEditingId(null); }} />
                </View>
              )}
            </Card>
          ))}
        </View>
      )}

      {showCreate && (
        <Card style={styles.createCard}>
          <Text style={styles.createTitle}>{t('money.templates.newTemplate')}</Text>
          <Input label={t('money.templates.templateName')} placeholder={t('money.templates.templateNamePlaceholder')} value={newName} onChangeText={setNewName} />
          <Input label={t('money.templates.templateCategory')} placeholder={t('money.templates.templateCategoryPlaceholder')} value={newCategory} onChangeText={setNewCategory} />
          <AmountInput label={t('common.amount')} value={newAmount} onChangeAmount={setNewAmount} />
          <Input label={t('money.templates.templateNote')} placeholder={t('money.templates.templateNotePlaceholder')} value={newNote} onChangeText={setNewNote} />
          <View style={styles.createButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowCreate(false)} />
            <Button label={t('money.templates.createTemplate')} size="sm" onPress={handleCreate} disabled={!newName.trim()} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useTemplatesStyles = createStyles((theme) =>
  StyleSheet.create({
    templateList: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    templateCard: { padding: theme.spacing.md },
    templateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    templateInfo: { flex: 1 },
    templateName: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    templateCategory: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    templateNote: { ...theme.typography.caption.style, color: theme.colors.textSecondary, marginTop: 2 },
    templateRight: { alignItems: 'flex-end', gap: 4 },
    templateAmount: { ...theme.typography.bodyLarge.style, color: theme.colors.accentGold, fontWeight: '600' },
    editActions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm, justifyContent: 'flex-end' },
    createCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    createTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    createButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
