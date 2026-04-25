import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { database } from '@/db';
import type Quest from '@/db/models/Quest';
import type Achievement from '@/db/models/Achievement';
import type Streak from '@/db/models/Streak';
import { getLevelForXP } from '@/constants/levels';
import { dailyQuests, weeklyQuests } from '@/constants/quests';
import { achievements as achievementDefs } from '@/constants/achievements';
import type { QuestTemplate } from '@/constants/quests';

// ── Types ──────────────────────────────────────────────────────
interface QuestData {
  id: string; userId: string; questTemplateId: string;
  type: 'daily' | 'weekly' | 'story';
  status: 'active' | 'completed' | 'expired';
  progress: number; target: number; xpReward: number; coinReward: number;
  expiresAt: Date | null; completedAt: Date | null;
}
interface AchievementData {
  id: string; userId: string; achievementId: string;
  unlocked: boolean; unlockedAt: Date | null;
}
interface XPResult { newTotal: number; leveledUp: boolean; newLevel: number; levelTitle: string; }
interface LevelUpResult { leveledUp: boolean; newLevel: number; title: string; }
interface AchievementCheckResult { achievementId: string; justUnlocked: boolean; }
interface BonusReward { type: 'xp' | 'coins' | 'streak_freeze'; amount: number; description: string; }

interface QuestState {
  quests: QuestData[]; achievements: AchievementData[];
  currentStreak: number; longestStreak: number;
  lastDepositDate: string | null; freezeCount: number; isLoading: boolean;

  loadQuests: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  loadStreak: () => Promise<void>;
  addXP: (amount: number) => XPResult;
  checkLevelUp: () => LevelUpResult;
  checkAchievements: () => AchievementCheckResult[];
  completeQuest: (questId: string) => Promise<void>;
  advanceQuest: (questId: string, amount: number) => Promise<void>;
  generateDailyQuests: () => QuestData[];
  generateWeeklyQuests: () => QuestData[];
  updateStreak: () => Promise<{ streakUpdated: boolean; newStreak: number }>;
  useStreakFreeze: () => boolean;
  spinBonusWheel: () => { reward: BonusReward };
}

function getToday(): string { return new Date().toISOString().split('T')[0]; }

function endOfDay(daysFromNow: number): Date {
  const d = new Date(); d.setDate(d.getDate() + daysFromNow);
  d.setHours(23, 59, 59, 999); return d;
}

function mapQuest(q: Quest): QuestData {
  return {
    id: q.id, userId: q.userId, questTemplateId: q.questTemplateId,
    type: q.type, status: q.status, progress: q.progress, target: q.target,
    xpReward: q.xpReward, coinReward: q.coinReward,
    expiresAt: q.expiresAt, completedAt: q.completedAt,
  };
}

function generateQuestBatch(
  templates: readonly QuestTemplate[],
  type: 'daily' | 'weekly',
  existing: QuestData[],
  expiresAt: Date,
): QuestData[] {
  const ids = new Set(existing.filter((q) => q.type === type && q.status !== 'expired').map((q) => q.questTemplateId));
  return templates.filter((t) => !ids.has(t.id)).map((t: QuestTemplate) => ({
    id: crypto.randomUUID(), userId: 'local_user', questTemplateId: t.id,
    type, status: 'active' as const, progress: 0, target: t.target,
    xpReward: t.xpReward, coinReward: t.coinReward, expiresAt, completedAt: null,
  }));
}

export const useQuestStore = create<QuestState>()(
  immer((set, get) => ({
    quests: [], achievements: [], currentStreak: 0, longestStreak: 0,
    lastDepositDate: null, freezeCount: 0, isLoading: false,

    loadQuests: async () => {
      set((s) => { s.isLoading = true; });
      try {
        const records = await database.get<Quest>('quests').query().fetch();
        set((s) => { s.quests = records.map(mapQuest); s.isLoading = false; });
      } catch { set((s) => { s.isLoading = false; }); }
    },

    loadAchievements: async () => {
      try {
        const records = await database.get<Achievement>('achievements').query().fetch();
        set((s) => {
          s.achievements = records.map((a) => ({
            id: a.id, userId: a.userId, achievementId: a.achievementId,
            unlocked: a.unlocked, unlockedAt: a.unlockedAt,
          }));
        });
      } catch { /* noop */ }
    },

    loadStreak: async () => {
      try {
        const records = await database.get<Streak>('streaks').query().fetch();
        if (records.length > 0) {
          const s = records[0];
          set((st) => {
            st.currentStreak = s.currentStreak; st.longestStreak = s.longestStreak;
            st.lastDepositDate = s.lastDepositDate?.toISOString() ?? null;
            st.freezeCount = s.freezeCount;
          });
        }
      } catch { /* noop */ }
    },

    addXP: (amount) => {
      const streakBonus = get().currentStreak * 5;
      const totalXP = amount + streakBonus;
      const authStore = require('./useAuthStore').useAuthStore;
      const user = authStore.getState().user;
      if (!user) return { newTotal: totalXP, leveledUp: false, newLevel: 1, levelTitle: 'Новачок' };
      const oldLevel = getLevelForXP(user.totalXp);
      const newTotal = user.totalXp + totalXP;
      const newLevelDef = getLevelForXP(newTotal);
      const leveledUp = newLevelDef.level > oldLevel.level;
      authStore.setState((prev: any) => { if (prev.user) { prev.user.totalXp = newTotal; prev.user.level = newLevelDef.level; } });
      return { newTotal, leveledUp, newLevel: newLevelDef.level, levelTitle: newLevelDef.title };
    },

    checkLevelUp: () => {
      const user = require('./useAuthStore').useAuthStore.getState().user;
      if (!user) return { leveledUp: false, newLevel: 1, title: 'Новачок' };
      const l = getLevelForXP(user.totalXp);
      return { leveledUp: false, newLevel: l.level, title: l.title };
    },

    checkAchievements: () => {
      const { achievements: achs, currentStreak } = get();
      const user = require('./useAuthStore').useAuthStore.getState().user;
      const savings = require('./useSavingsStore').useSavingsStore.getState();
      const unlocked = new Set(achs.filter((a) => a.unlocked).map((a) => a.achievementId));
      const ctx: Record<string, number> = {
        total_savings: savings.getTotalBalance(), level: user?.level ?? 1,
        total_transactions: savings.transactions.length, streak: currentStreak,
      };
      const results: AchievementCheckResult[] = [];
      for (const def of achievementDefs) {
        if (unlocked.has(def.id)) continue;
        const v = def.conditionValue;
        let ok = false;
        if (def.condition === 'total_savings') ok = v !== undefined && ctx.total_savings >= v;
        else if (def.condition === 'total_transactions') ok = v !== undefined && ctx.total_transactions >= v;
        else if (def.condition.startsWith('level_')) ok = ctx.level >= (v ?? parseInt(def.condition.split('_')[1]));
        else if (def.condition.startsWith('streak_')) ok = ctx.streak >= (v ?? parseInt(def.condition.split('_')[1]));
        else if (def.condition === 'first_deposit') ok = ctx.total_transactions > 0;
        else if (def.condition === 'goals_created') ok = savings.goals.length >= (v ?? 1);
        if (ok) results.push({ achievementId: def.id, justUnlocked: true });
      }
      return results;
    },

    completeQuest: async (questId) => {
      try {
        const col = database.get<Quest>('quests');
        const q = await col.find(questId);
        await database.write(async () => { await q.update((u) => { u.progress = u.target; u.status = 'completed'; }); });
        set((s) => { const i = s.quests.findIndex((q) => q.id === questId); if (i !== -1) { s.quests[i].status = 'completed'; s.quests[i].progress = s.quests[i].target; s.quests[i].completedAt = new Date(); } });
        get().addXP(q.xpReward);
      } catch { /* noop */ }
    },

    advanceQuest: async (questId, amount) => {
      try {
        const col = database.get<Quest>('quests');
        const q = await col.find(questId);
        await q.advanceProgress(amount);
        set((s) => { const i = s.quests.findIndex((q) => q.id === questId); if (i !== -1) { s.quests[i].progress = Math.min(s.quests[i].progress + amount, s.quests[i].target); if (s.quests[i].progress >= s.quests[i].target) { s.quests[i].status = 'completed'; s.quests[i].completedAt = new Date(); } } });
      } catch { /* noop */ }
    },

    generateDailyQuests: () => {
      const today = getToday();
      const existing = get().quests.filter((q) => q.type === 'daily' && q.status !== 'expired' && q.expiresAt?.toISOString().split('T')[0] === today);
      if (existing.length >= dailyQuests.length) return existing;
      const generated = generateQuestBatch(dailyQuests, 'daily', existing, endOfDay(1));
      set((s) => { s.quests.push(...generated); });
      return [...existing, ...generated];
    },

    generateWeeklyQuests: () => {
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); weekStart.setHours(0, 0, 0, 0);
      const existing = get().quests.filter((q) => q.type === 'weekly' && q.status !== 'expired' && q.expiresAt && q.expiresAt > weekStart);
      if (existing.length >= weeklyQuests.length) return existing;
      const generated = generateQuestBatch(weeklyQuests, 'weekly', existing, endOfDay(7));
      set((s) => { s.quests.push(...generated); });
      return [...existing, ...generated];
    },

    updateStreak: async () => {
      const { lastDepositDate, currentStreak, longestStreak } = get();
      const today = getToday();
      if (lastDepositDate === today) return { streakUpdated: false, newStreak: currentStreak };
      const yday = new Date(); yday.setDate(yday.getDate() - 1);
      const newStreak = lastDepositDate === yday.toISOString().split('T')[0] ? currentStreak + 1 : 1;
      set((s) => { s.currentStreak = newStreak; s.longestStreak = Math.max(newStreak, longestStreak); s.lastDepositDate = today; });
      return { streakUpdated: true, newStreak };
    },

    useStreakFreeze: () => {
      if (get().freezeCount <= 0) return false;
      set((s) => { s.freezeCount -= 1; });
      return true;
    },

    spinBonusWheel: () => {
      const roll = Math.random();
      let reward: BonusReward;
      if (roll < 0.4) {
        const amt = Math.floor(Math.random() * 50) + 20;
        reward = { type: 'xp', amount: amt, description: `+${amt} XP` };
      } else if (roll < 0.75) {
        const amt = Math.floor(Math.random() * 30) + 10;
        reward = { type: 'coins', amount: amt, description: `+${amt} монет` };
      } else if (roll < 0.92) {
        reward = { type: 'xp', amount: 100, description: '+100 XP (Джекпот!)' };
      } else {
        reward = { type: 'streak_freeze', amount: 1, description: 'Заморозка серії!' };
      }
      if (reward.type === 'streak_freeze') set((s) => { s.freezeCount += 1; });
      else if (reward.type === 'xp') get().addXP(reward.amount);
      return { reward };
    },
  })),
);
