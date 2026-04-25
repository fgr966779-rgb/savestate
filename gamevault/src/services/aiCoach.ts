/**
 * SaveState — AI Coach Service
 *
 * Calls the Supabase Edge Function `ai-coach` to get personalised
 * saving tips based on user goals and recent transactions.
 * Rate-limited to 10 calls per day tracked locally.
 */

import * as SecureStore from 'expo-secure-store';
import client from './supabase';

// ── Rate Limiting ───────────────────────────────────────────────
const RATE_LIMIT_KEY = 'SaveState_ai_calls';
const MAX_CALLS_PER_DAY = 10;

interface RateLimitState {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getRateLimitState(): Promise<RateLimitState> {
  try {
    const raw = await SecureStore.getItemAsync(RATE_LIMIT_KEY);
    if (raw) return JSON.parse(raw) as RateLimitState;
  } catch {
    // fresh state on any error
  }
  return { date: '', count: 0 };
}

async function checkAndIncrementRateLimit(): Promise<boolean> {
  try {
    const state = await getRateLimitState();
    const today = getTodayKey();

    if (state.date !== today) {
      const newState: RateLimitState = { date: today, count: 1 };
      await SecureStore.setItemAsync(RATE_LIMIT_KEY, JSON.stringify(newState));
      return true;
    }

    if (state.count >= MAX_CALLS_PER_DAY) {
      return false;
    }

    state.count += 1;
    await SecureStore.setItemAsync(RATE_LIMIT_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// ── Types matching Edge Function contract ───────────────────────
export interface GoalProgress {
  goalId: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  strategy: string;
}

export interface RecentTransaction {
  amount: number;
  type: string;
  category: string | null;
  createdAt: string;
}

interface EdgeFunctionAdvice {
  title: string;
  description: string;
  priority: string;
}

interface EdgeFunctionResponse {
  advice: EdgeFunctionAdvice[];
}

export interface AICoachAdvice {
  tips: Array<{ title: string; description: string; priority: string }>;
}

// ── Get Advice ──────────────────────────────────────────────────
export async function getAdvice(
  userId: string,
  goalProgress: GoalProgress[],
  recentTransactions: RecentTransaction[],
): Promise<AICoachAdvice> {
  try {
    const allowed = await checkAndIncrementRateLimit();
    if (!allowed) {
      return {
        tips: [
          {
            title: 'Ліміт порад',
            description: 'Ти вже використав усі поради на сьогодні. Повертайся завтра!',
            priority: 'low',
          },
        ],
      };
    }

    const { data, error } = await client.functions.invoke('ai-coach', {
      body: {
        userId,
        goalProgress,
        recentTransactions,
      },
    });

    if (error) throw error;

    const response = data as EdgeFunctionResponse;
    return {
      tips: response?.advice ?? [],
    };
  } catch (error) {
    console.error('[AICoach] getAdvice failed:', error);
    return {
      tips: [
        {
          title: 'Помилка',
          description: 'Наразі поради недоступні. Спробуй пізніше!',
          priority: 'low',
        },
      ],
    };
  }
}
