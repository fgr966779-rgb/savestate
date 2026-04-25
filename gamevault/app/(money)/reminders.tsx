import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface Reminder {
  id: string;
  title: string;
  amount: number;
  date: string;
  repeat: string;
  active: boolean;
}

const REPEAT_OPTIONS = ['none', 'weekly', 'monthly', 'quarterly', 'yearly'];

export default function RemindersScreen() {
  const theme = useTheme();
  const styles = useRemindersStyles(theme);
  const { t } = useLocalized();
  const { currency } = useSettingsStore.getState();
  const { transactions, loadTransactions } = useSavingsStore();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState(0);
  const [newDate, setNewDate] = useState('');
  const [newRepeat, setNewRepeat] = useState('monthly');
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions().then(() => setLoading(false)).catch((e: any) => { setError(e?.message || 'Error'); setLoading(false); });
  }, []);

  const activeReminders = useMemo(() => reminders.filter(r => r.active), [reminders]);
  const upcomingActive = useMemo(() => [...activeReminders].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5), [activeReminders]);

  const formatRemCurrency = (val: number) => val > 0 ? formatCurrency(val, currency) : '—';

  const toggleActive = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const reminder: Reminder = {
      id: String(Date.now()),
      title: newTitle,
      amount: newAmount,
      date: newDate || new Date().toISOString().split('T')[0],
      repeat: newRepeat,
      active: true,
    };
    setReminders(prev => [...prev, reminder]);
    setShowAdd(false);
    setNewTitle('');
    setNewAmount(0);
    setNewDate('');
    setNewRepeat('monthly');
  };

  if (loading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.reminders.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }, { icon: showCalendar ? '📋' : '📅', onPress: () => setShowCalendar(!showCalendar) }]} />

      {/* Calendar view */}
      {showCalendar && (
        <Card style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>{t('money.reminders.title')}</Text>
          {upcomingActive.slice(0, 4).map((reminder, i) => (
            <View key={reminder.id} style={styles.calendarRow}>
              <Text style={styles.calendarDay}>{reminder.date}</Text>
              <Text style={styles.calendarEvent}>{reminder.title}</Text>
            </View>
          ))}
          <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowCalendar(false)} style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-end' }} />
        </Card>
      )}

      {/* Upcoming reminders */}
      {upcomingActive.length === 0 ? (
        <EmptyState icon="🔔" title={t('common.noData')} description={t('money.reminders.title')} ctaLabel={t('money.reminders.addReminder')} onCta={() => setShowAdd(true)} />
      ) : (
        <View style={styles.reminderList}>
          {upcomingActive.map(reminder => (
            <Card key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderRow}>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <View style={styles.reminderMeta}>
                    <Text style={styles.reminderDate}>📅 {reminder.date}</Text>
                    <Badge variant="status" text={reminder.repeat} status="info" />
                  </View>
                </View>
                <View style={styles.reminderRight}>
                  <Text style={styles.reminderAmount}>{formatRemCurrency(reminder.amount)}</Text>
                  <Toggle value={reminder.active} onValueChange={() => toggleActive(reminder.id)} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Inactive reminders */}
      {reminders.some(r => !r.active) && (
        <>
          <Text style={styles.inactiveTitle}>{t('money.reminders.active')}</Text>
          <View style={styles.reminderList}>
            {reminders.filter(r => !r.active).map(reminder => (
              <Card key={reminder.id} style={[styles.reminderCard, { opacity: 0.6 }]} onPress={() => toggleActive(reminder.id)}>
                <View style={styles.reminderRow}>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderDate}>📅 {reminder.date}</Text>
                  </View>
                  <Text style={styles.reminderAmount}>{formatRemCurrency(reminder.amount)}</Text>
                </View>
              </Card>
            ))}
          </View>
        </>
      )}

      {/* Add reminder */}
      {showAdd && (
        <Card style={styles.addCard}>
          <Text style={styles.addTitle}>{t('money.reminders.addReminder')}</Text>
          <Input label={t('common.name')} placeholder={t('money.reminders.title')} value={newTitle} onChangeText={setNewTitle} />
          <AmountInput label={t('common.amount')} value={newAmount} onChangeAmount={setNewAmount} />
          <Input label="date" placeholder="YYYY-MM-DD" value={newDate} onChangeText={setNewDate} keyboardType="numeric" />
          <View style={styles.repeatRow}>
            {REPEAT_OPTIONS.map(opt => (
              <Pressable key={opt} style={[styles.repeatBtn, newRepeat === opt && styles.repeatBtnActive]} onPress={() => setNewRepeat(opt)}>
                <Text style={[styles.repeatText, newRepeat === opt && styles.repeatTextActive]}>{opt}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.addButtons}>
            <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowAdd(false)} />
            <Button label={t('common.add')} size="sm" onPress={handleAdd} disabled={!newTitle.trim()} />
          </View>
        </Card>
      )}
    </ScreenLayout>
  );
}

const useRemindersStyles = createStyles((theme) =>
  StyleSheet.create({
    calendarCard: { marginTop: theme.spacing.md, padding: theme.spacing.md },
    calendarTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary },
    calendarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSubtle },
    calendarDay: { ...theme.typography.bodyMedium.style, color: theme.colors.accentBlue },
    calendarEvent: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    reminderList: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    reminderCard: { padding: theme.spacing.md },
    reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reminderInfo: { flex: 1 },
    reminderTitle: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    reminderMeta: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: 4 },
    reminderDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    reminderRight: { alignItems: 'flex-end', gap: theme.spacing.sm },
    reminderAmount: { ...theme.typography.bodyMedium.style, color: theme.colors.accentGold, fontWeight: '600' },
    inactiveTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textTertiary, marginTop: theme.spacing.xl },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    repeatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginTop: theme.spacing.sm },
    repeatBtn: { paddingHorizontal: theme.spacing.sm, paddingVertical: 4, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.borderDefault },
    repeatBtnActive: { borderColor: theme.colors.accentBlue, backgroundColor: `${theme.colors.accentBlue}20` },
    repeatText: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    repeatTextActive: { color: theme.colors.accentBlue },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
