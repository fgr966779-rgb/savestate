import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function DreamsScreen() {
  const theme = useTheme();
  const styles = useDreamsStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore.getState();

  const { goals, loadGoals, createGoal, deleteGoal } = useSavingsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState(0);
  const [newDeadline, setNewDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGoals().then(() => setLoading(false)).catch((e: any) => { setError(e?.message || 'Error'); setLoading(false); });
  }, []);

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);

  const handleAdd = async () => {
    if (!newName.trim() || newTarget <= 0) return;
    setSaving(true);
    try {
      await createGoal({ title: newName, targetAmount: newTarget });
      setShowAdd(false);
      setNewName('');
      setNewTarget(0);
      setNewDeadline('');
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteGoal(id); } catch (e: any) { setError(e?.message || 'Error'); }
  };

  if (loading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.dreams.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }]} />

      {/* Overview */}
      <Card style={styles.overviewCard}>
        <Text style={styles.overviewLabel}>{t('money.dreams.myDreams')}</Text>
        <Text style={styles.overviewAmount}>{formatCurrency(totalCurrent, currency)}</Text>
        <Text style={styles.overviewTarget}>/ {formatCurrency(totalTarget, currency)}</Text>
        <LinearProgress progress={totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0} color={theme.colors.accentPurple} height={8} showLabel style={{ marginTop: theme.spacing.sm }} />
      </Card>

      {/* Dreams list */}
      {goals.length === 0 ? (
        <EmptyState icon="🌟" title={t('common.noData')} description={t('money.dreams.addDream')} ctaLabel={t('money.dreams.addDream')} onCta={() => setShowAdd(true)} />
      ) : (
        <View style={styles.dreamList}>
          {goals.map(goal => {
            const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            const isComplete = pct >= 100;
            return (
              <Card key={goal.id} style={styles.dreamCard}>
                <View style={styles.dreamHeader}>
                  <View style={styles.dreamInfo}>
                    <Text style={styles.dreamIcon}>{goal.icon || '🌟'}</Text>
                    <View>
                      <Text style={styles.dreamName}>{goal.title}</Text>
                      <Text style={styles.dreamDeadline}>{goal.status || ''}</Text>
                    </View>
                  </View>
                  {isComplete && <Badge variant="achievement" text="✓" />}
                </View>
                <View style={styles.dreamAmounts}>
                  <Text style={[styles.dreamCurrent, { color: theme.colors.accentGold }]}>{formatCurrency(goal.currentAmount, currency)}</Text>
                  <Text style={styles.dreamTargetText}>/ {formatCurrency(goal.targetAmount, currency)}</Text>
                </View>
                <LinearProgress progress={Math.min(pct, 100)} color={isComplete ? theme.colors.accentGreen : theme.colors.accentPurple} height={6} showLabel />
                <View style={styles.dreamActions}>
                  {!isComplete && (
                    <Text style={styles.dreamProgress}>{pct}%</Text>
                  )}
                  <Button label={t('common.delete')} variant="ghost" size="sm" onPress={() => handleDelete(goal.id)} />
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* Add dream */}
      {showAdd && (
        <Card style={styles.addCard}>
          <Text style={styles.addTitle}>{t('money.dreams.addDream')}</Text>
          <Input label={t('common.name')} placeholder={t('money.dreams.title')} value={newName} onChangeText={setNewName} />
          <AmountInput label={t('common.amount')} value={newTarget} onChangeAmount={setNewTarget} />
          <Input label="deadline" placeholder="YYYY-MM-DD" keyboardType="numeric" value={newDeadline} onChangeText={setNewDeadline} />
          <View style={styles.addButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowAdd(false)} />
            <Button label={t('common.add')} size="sm" onPress={handleAdd} loading={saving} disabled={!newName.trim() || newTarget <= 0} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useDreamsStyles = createStyles((theme) =>
  StyleSheet.create({
    overviewCard: { marginTop: theme.spacing.md, alignItems: 'center', padding: theme.spacing.lg },
    overviewLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    overviewAmount: { ...theme.typography.headingLarge.style, color: theme.colors.accentPurple, marginTop: theme.spacing.xs },
    overviewTarget: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary, marginTop: 2 },
    dreamList: { marginTop: theme.spacing.md, gap: theme.spacing.md },
    dreamCard: { padding: theme.spacing.md },
    dreamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dreamInfo: { flexDirection: 'row', alignItems: 'center' },
    dreamIcon: { fontSize: 28, marginRight: theme.spacing.sm },
    dreamName: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    dreamDeadline: { ...theme.typography.caption.style, color: theme.colors.textTertiary, marginTop: 2 },
    dreamAmounts: { flexDirection: 'row', alignItems: 'baseline', marginTop: theme.spacing.sm, gap: 4 },
    dreamCurrent: { ...theme.typography.headingSmall.style, fontWeight: '700' },
    dreamTargetText: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary },
    dreamActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.sm },
    dreamProgress: { ...theme.typography.caption.style, color: theme.colors.accentPurple, fontWeight: '600' },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
