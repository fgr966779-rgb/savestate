/**
 * SaveState — Calculations
 *
 * Pure calculation functions for XP, levels, forecasts,
 * savings rates, streaks, penalties, progress, and compound interest.
 */

import { getLevelForXP, getXPProgress, type LevelDefinition } from '@/constants/levels';

// ── XP Calculation ──────────────────────────────────────────────
// Spec: baseXP = √(amount) × 2, streakBonus = baseXP × (streakDays × 5%)
export function calculateXP(amount: number, streakDays: number): number {
  const baseXP = Math.floor(Math.sqrt(amount) * 2);
  const streakBonus = calculateStreakBonus(baseXP, streakDays);
  return baseXP + streakBonus;
}

// ── Streak Bonus ────────────────────────────────────────────────
// Spec: streakBonus = baseXP × (streakDays × 5%)
export function calculateStreakBonus(baseXP: number, streakDays: number): number {
  return Math.floor(baseXP * streakDays * 0.05);
}

// ── Level Calculation ───────────────────────────────────────────
export function calculateLevel(totalXP: number): {
  level: number;
  title: string;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const info = getXPProgress(totalXP);
  const currentLevel = info.currentLevel;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentLevelXP: info.xpInCurrentLevel,
    nextLevelXP: info.xpNeeded,
    progress: Math.round(info.progress * 100) / 100,
  };
}

// ── Goal Progress ───────────────────────────────────────────────
export function calculateGoalProgress(current: number, target: number): number {
  if (target <= 0) return 100;
  const progress = (current / target) * 100;
  return Math.min(Math.max(Math.round(progress * 100) / 100, 0), 100);
}

// ── Forecast Calculation ────────────────────────────────────────
export function calculateForecast(
  targetAmount: number,
  currentAmount: number,
  averageDaily: number,
): {
  estimatedDate: Date;
  daysRemaining: number;
  weeklyAmount: number;
  monthlyAmount: number;
} {
  const remaining = Math.max(0, targetAmount - currentAmount);

  const daysRemaining =
    averageDaily > 0 ? Math.ceil(remaining / averageDaily) : Infinity;

  const weeklyAmount = Math.round(averageDaily * 7);
  const monthlyAmount = Math.round(averageDaily * 30);

  const estimatedDate = new Date();
  if (daysRemaining !== Infinity) {
    estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);
  }

  return {
    estimatedDate,
    daysRemaining: daysRemaining === Infinity ? -1 : daysRemaining,
    weeklyAmount,
    monthlyAmount,
  };
}

// ── Savings Rate ────────────────────────────────────────────────
export function calculateSavingsRate(
  transactions: Array<{ amount: number; date: string | Date }>,
): { daily: number; weekly: number; monthly: number } {
  if (transactions.length === 0) {
    return { daily: 0, weekly: 0, monthly: 0 };
  }

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;

  const dailyTotal = transactions
    .filter((t) => {
      const txDate = new Date(t.date).getTime();
      return now.getTime() - txDate <= dayMs;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const weeklyTotal = transactions
    .filter((t) => {
      const txDate = new Date(t.date).getTime();
      return now.getTime() - txDate <= weekMs;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyTotal = transactions
    .filter((t) => {
      const txDate = new Date(t.date).getTime();
      return now.getTime() - txDate <= monthMs;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    daily: Math.round(dailyTotal * 100) / 100,
    weekly: Math.round(weeklyTotal * 100) / 100,
    monthly: Math.round(monthlyTotal * 100) / 100,
  };
}

// ── Withdrawal Penalty ──────────────────────────────────────────
// Spec: penalty = -√(amount) × 3
export function calculateWithdrawalPenalty(amount: number): {
  xpPenalty: number;
  daysAdded: number;
} {
  const xpPenalty = Math.floor(Math.sqrt(amount) * 3);
  const daysAdded = Math.min(Math.max(Math.floor(amount / 500), 1), 7);
  return { xpPenalty, daysAdded };
}

// ── Compound Interest ───────────────────────────────────────────
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  periods: number,
): number {
  if (rate <= 0 || periods <= 0) return principal;
  const compoundRate = 1 + rate / 100;
  return Math.round(principal * Math.pow(compoundRate, periods) * 100) / 100;
}
