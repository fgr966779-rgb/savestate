/**
 * SaveState — Date Helpers
 *
 * Pure date manipulation utilities for start/end of day, week, month,
 * days between, calendar generation, and next occurrence calculation.
 */

// ── Day Boundaries ──────────────────────────────────────────────
export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ── Week Boundaries (Monday = start) ────────────────────────────
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday as first day
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date = new Date()): Date {
  const start = getStartOfWeek(date);
  const d = new Date(start);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ── Month Boundaries ────────────────────────────────────────────
export function getStartOfMonth(date: Date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfMonth(date: Date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ── Day Comparison ──────────────────────────────────────────────
export function getDaysBetween(date1: Date, date2: Date): number {
  const d1 = getStartOfDay(date1);
  const d2 = getStartOfDay(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// ── Date Arithmetic ─────────────────────────────────────────────
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ── Calendar Month Grid ─────────────────────────────────────────
export interface DayCell {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export function formatCalendarMonth(date: Date): DayCell[][] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const totalDays = lastDay.getDate();
  const cells: DayCell[] = [];

  // Fill preceding days from previous month
  const prevMonthLast = new Date(year, month, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const dayNum = prevMonthLast - i;
    const d = new Date(year, month - 1, dayNum);
    cells.push({
      date: d,
      day: dayNum,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const d = new Date(year, month, dayNum);
    cells.push({
      date: d,
      day: dayNum,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    });
  }

  // Fill remaining days to complete last week row
  const remainder = cells.length % 7;
  if (remainder > 0) {
    const fillCount = 7 - remainder;
    for (let i = 1; i <= fillCount; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        date: d,
        day: i,
        isCurrentMonth: false,
        isToday: isSameDay(d, today),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }
  }

  // Split into weeks (rows of 7)
  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

// ── Next Occurrence ─────────────────────────────────────────────
export function getNextOccurrence(dayOfWeek: number): Date {
  const today = new Date();
  const currentDow = today.getDay();

  let daysUntil = dayOfWeek - currentDow;
  if (daysUntil <= 0) {
    daysUntil += 7;
  }

  const next = new Date(today);
  next.setDate(today.getDate() + daysUntil);
  next.setHours(9, 0, 0, 0);
  return next;
}

// ── Ukrainian month / weekday names ─────────────────────────────
export const ukWeekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export const ukMonthNames = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];
