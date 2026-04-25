/**
 * SaveState — Supabase Database Row Types
 *
 * Type definitions matching the actual Supabase migration schemas.
 * Aligned with: 00001_users → 00006_streaks migrations.
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      transactions: {
        Row: TransactionRow;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      goals: {
        Row: GoalRow;
        Insert: GoalInsert;
        Update: GoalUpdate;
      };
      quests: {
        Row: QuestRow;
        Insert: QuestInsert;
        Update: QuestUpdate;
      };
      achievements: {
        Row: AchievementRow;
        Insert: AchievementInsert;
        Update: AchievementUpdate;
      };
      streaks: {
        Row: StreakRow;
        Insert: StreakInsert;
        Update: StreakUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

// ── Users (00001_users.sql) ─────────────────────────────────────
export interface UserRow {
  id: string;
  email: string;
  nickname: string;
  avatar_id: string | null;
  avatar_color: string | null;
  level: number;
  total_xp: number;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

export type UserInsert = Omit<UserRow, 'id' | 'created_at' | 'updated_at' | 'synced_at'> & {
  id?: string;
};

export type UserUpdate = Partial<Omit<UserInsert, 'id'>>;

// ── Goals (00002_goals.sql) ─────────────────────────────────────
export type GoalStrategy = 'speed_run' | 'daily_grind' | 'quest_mode' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  icon: string | null;
  color: string | null;
  strategy: GoalStrategy;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

export type GoalInsert = Omit<GoalRow, 'id' | 'created_at' | 'updated_at' | 'synced_at'> & {
  id?: string;
};

export type GoalUpdate = Partial<Omit<GoalInsert, 'id' | 'user_id'>>;

// ── Transactions (00003_transactions.sql) ───────────────────────
export type TransactionType = 'deposit' | 'withdrawal' | 'bonus';

export interface TransactionRow {
  id: string;
  user_id: string;
  goal_id: string;
  type: TransactionType;
  amount: number;
  category: string | null;
  note: string | null;
  xp_earned: number;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

export type TransactionInsert = Omit<TransactionRow, 'id' | 'created_at' | 'updated_at' | 'synced_at'> & {
  id?: string;
};

export type TransactionUpdate = Partial<Omit<TransactionInsert, 'id' | 'user_id'>>;

// ── Quests (00004_quests.sql) ───────────────────────────────────
export type QuestType = 'daily' | 'weekly' | 'story';
export type QuestStatus = 'active' | 'completed' | 'expired';

export interface QuestRow {
  id: string;
  user_id: string;
  quest_template_id: string;
  type: QuestType;
  status: QuestStatus;
  progress: number;
  target: number;
  xp_reward: number;
  coin_reward: number;
  expires_at: string | null;
  completed_at: string | null;
  synced_at: string | null;
}

export type QuestInsert = Omit<QuestRow, 'id' | 'created_at' | 'synced_at'> & {
  id?: string;
};

export type QuestUpdate = Partial<Omit<QuestInsert, 'id' | 'user_id'>>;

// ── Achievements (00005_achievements.sql) ───────────────────────
export interface AchievementRow {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked: boolean;
  unlocked_at: string | null;
  synced_at: string | null;
}

export type AchievementInsert = Omit<AchievementRow, 'id' | 'synced_at'> & {
  id?: string;
};

export type AchievementUpdate = Partial<Omit<AchievementInsert, 'id' | 'user_id'>>;

// ── Streaks (00006_streaks.sql) ─────────────────────────────────
export interface StreakRow {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_deposit_date: string | null;
  freeze_count: number;
  synced_at: string | null;
}

export type StreakInsert = Omit<StreakRow, 'id' | 'synced_at'> & {
  id?: string;
};

export type StreakUpdate = Partial<Omit<StreakInsert, 'id' | 'user_id'>>;
