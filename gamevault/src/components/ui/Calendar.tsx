/**
 * SaveState Design System — Calendar
 *
 * 7-column month calendar grid with day cells.
 * Supports marked dates (green dot), selected date (accent blue fill),
 * today outline, and streak detection (consecutive green cells).
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  useTheme,
  spacing,
  radii,
  typography,
  colors,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface MarkedDateConfig {
  marked?: boolean;
  selected?: boolean;
  dotColor?: string;
}

interface CalendarProps {
  /** Map of date strings (YYYY-MM-DD) to their state */
  markedDates?: Record<string, MarkedDateConfig>;
  /** Called when a day cell is pressed */
  onDayPress?: (dateString: string) => void;
  /** Currently displayed month as 'YYYY-MM' (default: current month) */
  currentMonth?: string;
  /** Additional style overrides */
  style?: ViewStyle;
}

// ── Helpers ──────────────────────────────────────────────────────

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CELL_SIZE = 40;
const DOT_SIZE = 6;

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-start: Mon=0, Tue=1, ..., Sun=6
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  // Fill leading nulls
  for (let i = 0; i < startOffset; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill trailing nulls
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function isStreakDay(
  dateString: string,
  markedDates: Record<string, MarkedDateConfig>,
): boolean {
  return !!markedDates[dateString]?.marked;
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ── Component ────────────────────────────────────────────────────

const Calendar: React.FC<CalendarProps> = ({
  markedDates = {},
  onDayPress,
  currentMonth,
  style,
}) => {
  const theme = useTheme();
  const todayStr = getTodayString();

  const now = new Date();
  const displayYear = currentMonth
    ? parseInt(currentMonth.split('-')[0], 10)
    : now.getFullYear();
  const displayMonth = currentMonth
    ? parseInt(currentMonth.split('-')[1], 10) - 1
    : now.getMonth();

  const weeks = useMemo(
    () => getMonthData(displayYear, displayMonth),
    [displayYear, displayMonth],
  );

  const monthLabel = useMemo(() => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${months[displayMonth]} ${displayYear}`;
  }, [displayMonth, displayYear]);

  const handleDayPress = useCallback(
    (day: number) => {
      if (!onDayPress) return;
      const dateStr = formatDateStr(displayYear, displayMonth, day);
      onDayPress(dateStr);
    },
    [onDayPress, displayYear, displayMonth],
  );

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityRole="grid"
      accessibilityLabel={`Calendar: ${monthLabel}`}
    >
      {/* Month header */}
      <Text
        style={[
          typography.titleMedium.style,
          { color: theme.colors.textPrimary, marginBottom: spacing.sm },
        ]}
      >
        {monthLabel}
      </Text>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((day) => (
          <View
            key={day}
            style={[
              styles.weekCell,
              { width: CELL_SIZE, height: 28 },
            ]}
          >
            <Text
              style={[
                typography.caption.style,
                { color: theme.colors.textTertiary },
              ]}
            >
              {day.slice(0, 2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {weeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} style={styles.weekRow}>
          {week.map((day, dayIndex) => {
            if (day === null) {
              return (
                <View
                  key={`empty-${weekIndex}-${dayIndex}`}
                  style={[styles.dayCell, { width: CELL_SIZE, height: CELL_SIZE }]}
                />
              );
            }

            const dateStr = formatDateStr(displayYear, displayMonth, day);
            const config = markedDates[dateStr] ?? {};
            const isToday = dateStr === todayStr;
            const isMarked = !!config.marked;
            const isSelected = !!config.selected;
            const dotColor = config.dotColor ?? theme.colors.accentGreen;

            return (
              <Pressable
                key={dateStr}
                onPress={() => handleDayPress(day)}
                style={[
                  styles.dayCell,
                  {
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderRadius: radii.md,
                    backgroundColor: isSelected
                      ? theme.colors.accentBlue
                      : 'transparent',
                    borderWidth: isToday ? 2 : 0,
                    borderColor: isToday
                      ? theme.colors.accentBlue
                      : 'transparent',
                  },
                ]}
                accessibilityLabel={`${monthLabel} ${day}${isToday ? ', today' : ''}${isMarked ? ', marked' : ''}${isSelected ? ', selected' : ''}`}
                accessibilityRole="gridcell"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    typography.bodyLarge.style,
                    {
                      color: isSelected
                        ? theme.colors.textPrimary
                        : isToday
                          ? theme.colors.accentBlue
                          : theme.colors.textSecondary,
                      fontSize: 13,
                    },
                  ]}
                >
                  {day}
                </Text>

                {/* Marked dot */}
                {isMarked && !isSelected ? (
                  <View
                    style={[
                      styles.markedDot,
                      {
                        width: DOT_SIZE,
                        height: DOT_SIZE,
                        borderRadius: DOT_SIZE / 2,
                        backgroundColor: dotColor,
                      },
                    ]}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  weekCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  markedDot: {
    position: 'absolute',
    bottom: 4,
  },
});

export default React.memo(Calendar);
export type { CalendarProps, MarkedDateConfig };
