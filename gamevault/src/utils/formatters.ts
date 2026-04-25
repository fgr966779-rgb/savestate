/**
 * SaveState — Formatters
 *
 * Centralized formatting utilities for currency, dates, numbers,
 * XP, timers, and text. Ukrainian locale (uk-UA) by default.
 */

// ── Currency ────────────────────────────────────────────────────
const currencyCache = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  const key = currency;
  let formatter = currencyCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    currencyCache.set(key, formatter);
  }
  return formatter;
}

export function formatCurrency(amount: number, currency = 'UAH'): string {
  const formatter = getCurrencyFormatter(currency);
  return formatter.format(amount);
}

// ── Date Formatting ─────────────────────────────────────────────
type DateFormat = 'short' | 'medium' | 'long' | 'relative';

export function formatDate(
  date: string | Date,
  format: DateFormat = 'medium',
): string {
  if (format === 'relative') {
    return formatRelativeTime(date);
  }

  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'long', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' },
  }[format];

  return new Intl.DateTimeFormat('uk-UA', options).format(d);
}

// ── Number with Thousands Separator ──────────────────────────────
const numberFormatter = new Intl.NumberFormat('uk-UA');

export function formatNumber(num: number): string {
  return numberFormatter.format(num);
}

// ── Percentage ──────────────────────────────────────────────────
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

// ── XP ──────────────────────────────────────────────────────────
export function formatXP(xp: number): string {
  const sign = xp >= 0 ? '+' : '';
  return `${sign}${Math.round(xp)} XP`;
}

// ── Timer (HH:MM:SS) ────────────────────────────────────────────
export function formatTimer(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

// ── Relative Time ───────────────────────────────────────────────
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 5) return 'щойно';
  if (diffSec < 60) return `${diffSec} сек тому`;
  if (diffMin < 60) {
    const minutes = diffMin;
    if (minutes === 1) return '1 хвилину тому';
    if (minutes < 5) return `${minutes} хвилини тому`;
    return `${minutes} хвилин тому`;
  }
  if (diffHour < 24) {
    const hours = diffHour;
    if (hours === 1) return '1 годину тому';
    if (hours < 5) return `${hours} години тому`;
    return `${hours} годин тому`;
  }
  if (diffDay === 1) return 'вчора';
  if (diffDay < 5) return `${diffDay} дні тому`;
  if (diffDay < 7) return `${diffDay} днів тому`;
  if (diffDay < 14) return 'тиждень тому';
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} тижні тому`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} місяці тому`;
  return `${Math.floor(diffDay / 365)} роки тому`;
}

// ── Text Utilities ──────────────────────────────────────────────
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
