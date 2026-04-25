/**
 * Screen 14 — Recurring Plan Setup
 *
 * Schedule automatic deposits with frequency chips, amount slider,
 * time picker, day-of-week picker, 30-day calendar preview with
 * deposit markers, and efficiency calculation.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  triggerImpact,
  spacing,
  typography,
  fontFamilies,
  semanticRadii,
} from '@/constants/theme';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Slider } from '@/components/ui/Slider';
import { Calendar } from '@/components/ui/Calendar';
import { useToast } from '@/components/ui/Toast';
import { useLocalized } from '@/hooks/useLocalized';

// ── Types ──────────────────────────────────────────────────────────

type FrequencyType = 'daily' | 'weekly' | 'biweekly' | 'monthly';

interface FrequencyOption {
  key: FrequencyType;
  labelKey: string;
  days: number;
}

// ── Constants ──────────────────────────────────────────────────────

const FREQUENCY_KEYS: FrequencyOption[] = [
  { key: 'daily', labelKey: 'vault.recurring.daily', days: 1 },
  { key: 'weekly', labelKey: 'vault.recurring.weekly', days: 7 },
  { key: 'biweekly', labelKey: 'vault.recurring.biweekly', days: 14 },
  { key: 'monthly', labelKey: 'vault.recurring.monthly', days: 30 },
];

const QUICK_AMOUNTS = [25, 50, 100, 200, 500];

// ── Helpers ──────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDepositDates(frequency: FrequencyType, dayOfWeek?: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  const startDay = dayOfWeek !== undefined ? dayOfWeek : now.getDay();

  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);

    let shouldMark = false;
    switch (frequency) {
      case 'daily':
        shouldMark = true;
        break;
      case 'weekly':
        shouldMark = d.getDay() === startDay;
        break;
      case 'biweekly':
        shouldMark = i % 14 === 0;
        break;
      case 'monthly':
        shouldMark = d.getDate() === now.getDate();
        break;
    }

    if (shouldMark) {
      dates.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      );
    }
  }
  return dates;
}

// ── Component ─────────────────────────────────────────────────────

export default function VaultRecurring() {
  const theme = useTheme();
  const styles = useRecurringStyles(theme);
  const c = theme.colors;
  const toast = useToast();
  const { t } = useLocalized();

  const { goals, activeGoalId } = useSavingsStore();
  const setRecurringPlan = useSettingsStore((s) => s.setRecurringPlan);
  const activeGoal = goals.find((g) => g.id === activeGoalId);

  const [frequency, setFrequency] = useState<FrequencyType>('weekly');
  const [amount, setAmount] = useState(100);
  const [time, setTime] = useState('19:00');
  const [selectedDay, setSelectedDay] = useState<number>(
    new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
  );
  const [isSaving, setIsSaving] = useState(false);

  // ── Localized frequency options ─────────────────────────────────
  const frequencies = useMemo(
    () => FREQUENCY_KEYS.map((f) => ({ ...f, label: t(f.labelKey) })),
    [t],
  );

  // ── Localized weekday labels ───────────────────────────────────
  const weekdayLabels = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].map((i) => t(`common.days.${i}`)),
    [t],
  );

  const freqOption = FREQUENCY_KEYS.find((f) => f.key === frequency);
  const freqLabel = t(freqOption?.labelKey ?? 'vault.recurring.weekly');
  const depositsPerMonth = freqOption ? Math.round(30 / freqOption.days) : 4;
  const monthlyTotal = amount * depositsPerMonth;

  // Efficiency calculation
  const estimatedMonths = useMemo(() => {
    if (!activeGoal || amount <= 0) return 0;
    const remaining = activeGoal.targetAmount - activeGoal.currentAmount;
    if (remaining <= 0) return 0;
    const monthlyProgress = monthlyTotal;
    if (monthlyProgress <= 0) return 999;
    return Math.ceil(remaining / monthlyProgress);
  }, [activeGoal, amount, depositsPerMonth, monthlyTotal]);

  // Calendar marked dates
  const markedDates = useMemo(() => {
    const depositDates = getDepositDates(frequency, selectedDay);
    const result: Record<string, { marked: boolean; dotColor: string }> = {};
    for (const dateStr of depositDates) {
      result[dateStr] = { marked: true, dotColor: c.accentGreen };
    }
    return result;
  }, [frequency, selectedDay, c.accentGreen]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleFrequency = useCallback((key: FrequencyType) => {
    triggerHaptic('buttonPress');
    setFrequency(key);
  }, []);

  const handleDaySelect = useCallback((day: number) => {
    triggerHaptic('buttonPress');
    setSelectedDay(day);
  }, []);

  const handleTimePress = useCallback(() => {
    triggerHaptic('buttonPress');
    Alert.alert(
      t('vault.recurring.depositTime'),
      t('vault.recurring.selectTimeAlert'),
      [
        { text: '07:00', onPress: () => setTime('07:00') },
        { text: '12:00', onPress: () => setTime('12:00') },
        { text: '15:00', onPress: () => setTime('15:00') },
        { text: '19:00', onPress: () => setTime('19:00') },
        { text: '21:00', onPress: () => setTime('21:00') },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    );
  }, [t]);

  const handleSave = useCallback(async () => {
    if (amount <= 0 || !activeGoalId) return;

    setIsSaving(true);
    triggerHaptic('depositConfirm');
    triggerImpact('medium');

    try {
      // Persist the recurring plan via settings store (MMKV-backed)
      setRecurringPlan({
        goalId: activeGoalId,
        amount,
        frequency,
        selectedDay,
        time,
        enabled: true,
      });

      toast.success(
        t('vault.recurring.planSaved', { frequency: freqLabel, amount: formatCurrency(amount) }),
        '📅',
      );
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setIsSaving(false);
      router.back();
    }
  }, [amount, activeGoalId, frequency, selectedDay, time, freqLabel, setRecurringPlan, toast, t]);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <ScreenLayout scrollable withBottomTabBar>
      <View style={styles.container}>
        {/* ── Title ──────────────────────────────────────────────── */}
        <Text style={styles.screenTitle}>{t('vault.recurring.automaticDeposit')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('vault.recurring.automaticDepositDesc')}
        </Text>

        {/* ── Frequency Chips ────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('vault.recurring.frequency')}</Text>
        <View style={styles.frequencyRow}>
          {frequencies.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              selected={frequency === f.key}
              onPress={() => handleFrequency(f.key)}
            />
          ))}
        </View>

        {/* ── Amount Input + Slider ──────────────────────────────── */}
        <AmountInput
          value={amount}
          onChangeAmount={setAmount}
          currency="₴"
          label={t('vault.recurring.perDeposit')}
        />

        <View style={styles.quickAmountsRow}>
          {QUICK_AMOUNTS.map((val) => (
            <Pressable
              key={val}
              style={[
                styles.quickChip,
                {
                  backgroundColor: amount === val ? c.accentBlue : c.bgTertiary,
                },
              ]}
              onPress={() => {
                triggerHaptic('buttonPress');
                setAmount(val);
              }}
            >
              <Text
                style={[
                  styles.quickChipText,
                  { color: amount === val ? c.textPrimary : c.textSecondary },
                ]}
              >
                ₴{val}
              </Text>
            </Pressable>
          ))}
        </View>

        <Slider
          value={amount}
          onValueChange={setAmount}
          min={10}
          max={2000}
          step={10}
          label={t('vault.recurring.amount')}
        />

        {/* ── Time Picker ────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('vault.recurring.depositTime')}</Text>
        <Pressable
          style={[styles.timePickerCard, { backgroundColor: c.bgSurface }]}
          onPress={handleTimePress}
        >
          <Text style={styles.timePickerEmoji}>⏰</Text>
          <Text style={styles.timePickerTime}>{time}</Text>
          <Text style={styles.timePickerHint}>{t('vault.recurring.changeTime')}</Text>
        </Pressable>

        {/* ── Day of Week Picker (Weekly) ────────────────────────── */}
        {(frequency === 'weekly' || frequency === 'biweekly') && (
          <>
            <Text style={styles.sectionLabel}>{t('vault.recurring.dayOfWeek')}</Text>
            <View style={styles.weekdayRow}>
              {weekdayLabels.map((day, idx) => (
                <Pressable
                  key={day}
                  style={[
                    styles.weekdayChip,
                    {
                      backgroundColor:
                        selectedDay === idx
                          ? c.accentBlue
                          : c.bgTertiary,
                    },
                  ]}
                  onPress={() => handleDaySelect(idx)}
                >
                  <Text
                    style={[
                      styles.weekdayText,
                      {
                        color:
                          selectedDay === idx
                            ? c.textPrimary
                            : c.textSecondary,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* ── Calendar Preview ───────────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('vault.recurring.calendarPreview')}</Text>
        <Card variant="outlined" style={styles.calendarCard}>
          <Calendar
            markedDates={markedDates}
            currentMonth={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
          />
        </Card>

        {/* ── Efficiency Calculation ─────────────────────────────── */}
        <Card variant="glowing" style={styles.efficiencyCard}>
          <Text style={styles.efficiencyTitle}>📈 {t('vault.recurring.forecast')}</Text>
          <View style={styles.efficiencyRow}>
            <Text style={styles.efficiencyLabel}>{t('vault.recurring.depositsPerMonth')}</Text>
            <Text style={styles.efficiencyValue}>{depositsPerMonth}×</Text>
          </View>
          <View style={styles.efficiencyRow}>
            <Text style={styles.efficiencyLabel}>{t('vault.recurring.monthlyTotal')}</Text>
            <Text style={styles.efficiencyValue}>
              ₴{formatCurrency(monthlyTotal)}
            </Text>
          </View>
          {activeGoal && (
            <View style={styles.efficiencyRow}>
              <Text style={styles.efficiencyLabel}>
                {activeGoal.title} →
              </Text>
              <Text style={[styles.efficiencyValue, { color: c.accentGold }]}>
                {estimatedMonths > 12
                  ? t('vault.recurring.years')
                  : t('vault.recurring.monthsShort', { count: estimatedMonths })}
              </Text>
            </View>
          )}
        </Card>

        {/* ── Save Button ────────────────────────────────────────── */}
        <View style={styles.submitSection}>
          <Button
            variant="primary"
            size="lg"
            label={t('vault.recurring.savePlan')}
            onPress={handleSave}
            loading={isSaving}
            fullWidth
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const useRecurringStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    screenTitle: {
      ...theme.typography.headingSmall.style,
      color: theme.colors.textPrimary,
    },
    screenSubtitle: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    sectionLabel: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.sm,
    },
    frequencyRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    quickAmountsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    quickChip: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.semanticRadii.chipRadius,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    quickChipText: {
      ...theme.typography.labelMedium.style,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
      fontSize: 13,
    },
    timePickerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.semanticRadii.cardRadius,
      borderWidth: 1,
      borderColor: theme.colors.borderDefault,
    },
    timePickerEmoji: {
      fontSize: 24,
    },
    timePickerTime: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
    },
    timePickerHint: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.accentBlue,
      marginLeft: 'auto',
    },
    weekdayRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    weekdayChip: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.semanticRadii.chipRadius,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    weekdayText: {
      ...theme.typography.labelMedium.style,
      fontWeight: '700',
      fontSize: 13,
    },
    calendarCard: {
      overflow: 'hidden',
    },
    efficiencyCard: {
      marginTop: theme.spacing.sm,
    },
    efficiencyTitle: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.md,
    },
    efficiencyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    efficiencyLabel: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
    },
    efficiencyValue: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
    },
    submitSection: {
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
  }),
);
