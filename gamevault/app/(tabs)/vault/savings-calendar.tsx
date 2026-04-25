/**
 * Screen 49 — Savings Calendar
 *
 * Monthly heatmap calendar showing daily deposit/withdrawal activity.
 * Color-coded cells, month navigation, summary stats, best day badge,
 * and detail bottom sheet on tap.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BottomSheet } from '@/components/ui/Modal/BottomSheet';
import { Button } from '@/components/ui/Button';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { formatCurrency } from '@/utils/formatters';
import { useLocalized } from '@/hooks/useLocalized';

// ── Types ────────────────────────────────────────────────────────

interface DayData {
  day: number;
  amount: number;
  isWithdrawal: boolean;
  category: string;
  xpEarned: number;
  note: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getDaysFromTransactions(
  transactions: { type: string; amount: number; category: string | null; note: string | null; xpEarned: number; createdAt: Date }[],
  year: number,
  month: number,
  daysInMonth: number,
): DayData[] {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Filter transactions for the selected month/year
  const monthTx = transactions.filter((tx) => {
    const d = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
    return d >= monthStart && d <= monthEnd;
  });

  // Group by day of month
  const dayMap = new Map<number, DayData>();

  for (let d = 1; d <= daysInMonth; d++) {
    dayMap.set(d, {
      day: d,
      amount: 0,
      isWithdrawal: false,
      category: '',
      xpEarned: 0,
      note: null,
    });
  }

  for (const tx of monthTx) {
    const d = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
    const dayOfMonth = d.getDate();
    const existing = dayMap.get(dayOfMonth);

    if (!existing) continue;

    const isWithdrawal = tx.type === 'withdrawal';

    // Merge transactions for same day
    if (isWithdrawal) {
      existing.amount -= tx.amount;
      existing.isWithdrawal = true;
    } else {
      existing.amount += tx.amount;
      existing.isWithdrawal = false;
      existing.xpEarned += Math.floor(Math.sqrt(tx.amount) * 2);
    }

    // Use the latest non-empty category/note
    if (tx.category) existing.category = tx.category;
    if (tx.note) existing.note = tx.note;
  }

  return Array.from(dayMap.values());
}

function getCellColor(amount: number, isWithdrawal: boolean, theme: ReturnType<typeof useTheme>) {
  const c = theme.colors;
  if (isWithdrawal) return hexToRgba(c.accentRed, 0.35);
  if (amount === 0) return c.bgSecondary;
  if (amount < 100) return hexToRgba(c.accentGreen, 0.15);
  if (amount < 500) return hexToRgba(c.accentGreen, 0.3);
  if (amount < 1000) return hexToRgba(c.accentGreen, 0.5);
  return hexToRgba(c.accentGreen, 0.75);
}

function getLegendColors(theme: ReturnType<typeof useTheme>) {
  const c = theme.colors;
  return {
    noActivity: c.bgSecondary,
    low: hexToRgba(c.accentGreen, 0.15),
    medium: hexToRgba(c.accentGreen, 0.3),
    high: hexToRgba(c.accentGreen, 0.5),
    veryHigh: hexToRgba(c.accentGreen, 0.75),
    withdrawal: hexToRgba(c.accentRed, 0.35),
  };
}

// ── Component ────────────────────────────────────────────────────

export default function SavingsCalendar() {
  const theme = useTheme();
  const styles = useCalendarStyles(theme);
  const c = theme.colors;
  const { t } = useLocalized();
  const transactions = useSavingsStore((s) => s.transactions);
  const currency = useSettingsStore((s) => s.currency);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const daysData = useMemo(
    () => getDaysFromTransactions(transactions, year, month, daysInMonth),
    [transactions, year, month, daysInMonth],
  );

  // ── Weekday labels (localized) ─────────────────────────────────
  const weekdayLabels = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].map((i) => t(`common.days.${i}`)),
    [t],
  );

  // ── Summary calculations ───────────────────────────────────────
  const activeDays = daysData.filter((d) => d.amount > 0 && !d.isWithdrawal).length;
  const totalSaved = daysData
    .filter((d) => !d.isWithdrawal)
    .reduce((sum, d) => sum + d.amount, 0);
  const avgPerDay = activeDays > 0 ? Math.round(totalSaved / activeDays) : 0;
  const bestDay = daysData
    .filter((d) => !d.isWithdrawal)
    .reduce((best, d) => (d.amount > (best?.amount ?? 0) ? d : best), null);

  // ── Previous month comparison (dynamic) ────────────────────────
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthLabel = t(`common.months.${prevMonth + 1}`);

  const prevDaysInMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const prevDaysData = useMemo(
    () => getDaysFromTransactions(transactions, prevYear, prevMonth, prevDaysInMonth),
    [transactions, prevYear, prevMonth, prevDaysInMonth],
  );
  const prevTotalSaved = prevDaysData
    .filter((d) => !d.isWithdrawal)
    .reduce((sum, d) => sum + d.amount, 0);
  const monthDelta = prevTotalSaved > 0
    ? Math.round(((totalSaved - prevTotalSaved) / prevTotalSaved) * 100)
    : 0;

  // ── Month navigation ───────────────────────────────────────────
  const goToPrevMonth = useCallback(() => {
    triggerHaptic('buttonPress');
    setMonth((m) => (m === 0 ? 11 : m - 1));
    if (month === 0) setYear((y) => y - 1);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    triggerHaptic('buttonPress');
    setMonth((m) => (m === 11 ? 0 : m + 1));
    if (month === 11) setYear((y) => y + 1);
  }, [month]);

  // ── Day tap handler ────────────────────────────────────────────
  const handleDayPress = useCallback((day: DayData) => {
    triggerHaptic('selection');
    setSelectedDay(day);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    triggerHaptic('buttonPress');
    setSheetVisible(false);
    setSelectedDay(null);
  }, []);

  // ── Legend colors ──────────────────────────────────────────────
  const legendColors = useMemo(() => getLegendColors(theme), [theme]);

  // ── Build calendar grid rows (7 columns) ───────────────────────
  const calendarRows = useMemo(() => {
    const rows: (DayData | null)[][] = [];
    let currentRow: (DayData | null)[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentRow.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      currentRow.push(daysData[d - 1]);
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    // Trailing empty cells
    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(null);
      }
      rows.push(currentRow);
    }

    return rows;
  }, [firstDayOfWeek, daysInMonth, daysData]);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <ScreenLayout scrollable withBottomTabBar>
      {/* ── Month Navigation ────────────────────────────────────── */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.navButton} onPress={goToPrevMonth} activeOpacity={0.7}>
          <Text style={styles.navArrow}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {t(`common.months.${month + 1}`)} {year}
        </Text>
        <TouchableOpacity style={styles.navButton} onPress={goToNextMonth} activeOpacity={0.7}>
          <Text style={styles.navArrow}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* ── Calendar Grid ───────────────────────────────────────── */}
      <Card>
        {/* Weekday headers */}
        <View style={styles.weekdayRow}>
          {weekdayLabels.map((label) => (
            <View key={label} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Day rows */}
        {calendarRows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.dayRow}>
            {row.map((dayData, colIdx) => {
              if (!dayData) {
                return <View key={`empty-${colIdx}`} style={styles.dayCell} />;
              }

              const isToday =
                dayData.day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              const cellBg = getCellColor(dayData.amount, dayData.isWithdrawal, theme);
              const isGoldBorder = dayData.amount >= 1000 && !dayData.isWithdrawal;

              return (
                <TouchableOpacity
                  key={dayData.day}
                  style={[
                    styles.dayCell,
                    { backgroundColor: cellBg },
                    isToday && { borderWidth: 2, borderColor: c.accentBlue },
                    isGoldBorder && { borderWidth: 2, borderColor: c.accentGold },
                  ]}
                  onPress={() => handleDayPress(dayData)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.dayText,
                      dayData.amount === 0 && styles.dayTextEmpty,
                    ]}
                  >
                    {dayData.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Card>

      {/* ── Legend ───────────────────────────────────────────────── */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: legendColors.noActivity }]} />
          <Text style={styles.legendText}>{t('calendar.noActivity')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: legendColors.low }]} />
          <Text style={styles.legendText}>{formatCurrency(0, currency)}{'<'}100</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: legendColors.medium }]} />
          <Text style={styles.legendText}>100-499</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: legendColors.high }]} />
          <Text style={styles.legendText}>500-999</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: legendColors.veryHigh }]} />
          <Text style={styles.legendText}>1000+</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: legendColors.withdrawal }]} />
          <Text style={styles.legendText}>{t('calendar.withdrawal')}</Text>
        </View>
      </View>

      {/* ── Summary Card ─────────────────────────────────────────── */}
      <Card>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('calendar.activeDays')}</Text>
            <Text style={styles.summaryValue}>
              {activeDays}
              <Text style={styles.summarySub}>/{daysInMonth}</Text>
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('common.total')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalSaved, currency)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('calendar.avgPerDay')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(avgPerDay, currency)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              {t('calendar.vsPreviousMonth', { month: prevMonthLabel })}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: monthDelta >= 0 ? c.accentGreen : c.accentRed },
              ]}
            >
              {monthDelta > 0 ? `↑${monthDelta}%` : monthDelta < 0 ? `↓${Math.abs(monthDelta)}%` : '—'}
            </Text>
          </View>
        </View>
      </Card>

      {/* ── Best Day Badge ───────────────────────────────────────── */}
      {bestDay && (
        <View style={styles.bestDayContainer}>
          <Badge
            variant="achievement"
            text={`⭐ ${t('calendar.bestDay')}: ${bestDay.day} ${t(`common.monthsGenitive.${month + 1}`)} — ${formatCurrency(bestDay.amount, currency)}`}
          />
        </View>
      )}

      {/* ── Day Detail Bottom Sheet ─────────────────────────────── */}
      <BottomSheet visible={sheetVisible} onClose={handleCloseSheet} title={t('calendar.dayDetails')}>
        {selectedDay && (
          <View style={styles.sheetContent}>
            {/* Date & weekday */}
            <Text style={styles.sheetDate}>
              {selectedDay.day} {t(`common.monthsGenitive.${month + 1}`)} {year}
            </Text>
            <Text style={styles.sheetWeekday}>
              {t(`common.daysFull.${new Date(year, month, selectedDay.day).getDay()}`)}
            </Text>

            {/* Amount */}
            <View style={styles.sheetAmountRow}>
              <Text style={styles.sheetAmountLabel}>
                {selectedDay.isWithdrawal ? t('calendar.withdrawal') : t('calendar.deposit')}
              </Text>
              <Text
                style={[
                  styles.sheetAmount,
                  selectedDay.isWithdrawal && { color: c.accentRed },
                ]}
              >
                {selectedDay.isWithdrawal ? '−' : '+'}{formatCurrency(Math.abs(selectedDay.amount), currency)}
              </Text>
            </View>

            {/* Category */}
            {selectedDay.category ? (
              <View style={styles.sheetRow}>
                <Text style={styles.sheetRowLabel}>{t('calendar.category')}</Text>
                <Text style={styles.sheetRowValue}>{selectedDay.category}</Text>
              </View>
            ) : null}

            {/* XP */}
            {!selectedDay.isWithdrawal && selectedDay.xpEarned > 0 && (
              <View style={styles.sheetRow}>
                <Text style={styles.sheetRowLabel}>{t('calendar.xpEarned')}</Text>
                <Badge variant="xp" text={`+${selectedDay.xpEarned} XP`} />
              </View>
            )}

            {/* Note */}
            {selectedDay.note && (
              <View style={styles.sheetNote}>
                <Text style={styles.sheetNoteLabel}>📝 {t('calendar.note')}</Text>
                <Text style={styles.sheetNoteText}>{selectedDay.note}</Text>
              </View>
            )}

            {/* Close button */}
            <View style={styles.sheetButton}>
              <Button
                variant="secondary"
                size="md"
                label={t('common.close')}
                onPress={handleCloseSheet}
                fullWidth
              />
            </View>
          </View>
        )}
      </BottomSheet>
    </ScreenLayout>
  );
}

// ── Styles ───────────────────────────────────────────────────────

const useCalendarStyles = createStyles((theme) =>
  StyleSheet.create({
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    navButton: {
      width: 44,
      height: 44,
      borderRadius: theme.semanticRadii.buttonRadius,
      backgroundColor: theme.colors.bgSecondary,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navArrow: {
      fontSize: 18,
      color: theme.colors.textPrimary,
    },
    monthTitle: {
      ...theme.typography.headingSmall.style,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    weekdayRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
    },
    weekdayCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    weekdayText: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.textTertiary,
      fontWeight: '700',
      fontSize: 11,
      textTransform: 'uppercase',
    },
    dayRow: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      margin: 1.5,
      borderRadius: theme.radii.sm,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    dayText: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      fontSize: 13,
    },
    dayTextEmpty: {
      color: theme.colors.textTertiary,
      opacity: 0.5,
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendSwatch: {
      width: 14,
      height: 14,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    legendText: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
      fontSize: 10,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    summaryItem: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    summaryDivider: {
      width: 1,
      backgroundColor: theme.colors.borderSubtle,
    },
    summaryLabel: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.textTertiary,
      fontSize: 11,
      marginBottom: 2,
    },
    summaryValue: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      fontWeight: '800',
      fontSize: 18,
    },
    summarySub: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textTertiary,
      fontSize: 14,
      fontWeight: '400',
    },
    bestDayContainer: {
      paddingTop: theme.spacing.sm,
      alignItems: 'center',
    },
    sheetContent: {
      gap: theme.spacing.md,
    },
    sheetDate: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
      fontWeight: '800',
    },
    sheetWeekday: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    sheetAmountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: theme.radii.md,
    },
    sheetAmountLabel: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textSecondary,
    },
    sheetAmount: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.accentGreen,
      fontWeight: '900',
    },
    sheetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    sheetRowLabel: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
    },
    sheetRowValue: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    sheetNote: {
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: theme.radii.md,
      gap: theme.spacing.xs,
    },
    sheetNoteLabel: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.textTertiary,
      fontWeight: '600',
    },
    sheetNoteText: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textPrimary,
    },
    sheetButton: {
      paddingTop: theme.spacing.md,
    },
  }),
);
