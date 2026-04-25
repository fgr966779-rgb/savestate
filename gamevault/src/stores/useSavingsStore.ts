import { Q } from '@nozbe/watermelondb';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { database } from '@/db';
import type Goal from '@/db/models/Goal';
import type Transaction from '@/db/models/Transaction';

// ── Types ──────────────────────────────────────────────────────
interface GoalData {
  id: string; userId: string; title: string;
  targetAmount: number; currentAmount: number;
  icon: string | null; color: string | null;
  strategy: string | null; status: 'active' | 'completed' | 'paused';
  createdAt: Date;
}

interface TransactionData {
  id: string; userId: string; goalId: string;
  type: 'deposit' | 'withdrawal' | 'bonus';
  amount: number; category: string | null;
  note: string | null; xpEarned: number; createdAt: Date;
}

interface CreateGoalInput {
  title: string; targetAmount: number;
  icon?: string | null; color?: string | null; strategy?: string | null;
}

interface CreateTransactionInput {
  goalId: string; type: 'deposit' | 'withdrawal' | 'bonus';
  amount: number; category?: string | null; note?: string | null;
}

interface SavingsState {
  goals: GoalData[];
  transactions: TransactionData[];
  isLoading: boolean;
  activeGoalId: string | null;

  loadGoals: () => Promise<void>;
  createGoal: (goal: CreateGoalInput) => Promise<void>;
  updateGoal: (id: string, updates: Partial<GoalData>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  loadTransactions: (goalId?: string, limit?: number, offset?: number) => Promise<void>;
  createTransaction: (tx: CreateTransactionInput) => Promise<{ amount: number; xpEarned: number }>;
  deleteTransaction: (id: string) => Promise<void>;
  getActiveGoal: () => GoalData | undefined;
  getTotalBalance: () => number;
  getGoalProgress: (goalId: string) => number;
}

// ── Mappers ────────────────────────────────────────────────────
function mapGoal(g: Goal): GoalData {
  return { id: g.id, userId: g.userId, title: g.title, targetAmount: g.targetAmount, currentAmount: g.currentAmount, icon: g.icon, color: g.color, strategy: g.strategy, status: g.status, createdAt: g.createdAt };
}

function mapTransaction(t: Transaction): TransactionData {
  return { id: t.id, userId: t.userId, goalId: t.goalId, type: t.type, amount: t.amount, category: t.category, note: t.note, xpEarned: t.xpEarned, createdAt: t.createdAt };
}

// ── Store ──────────────────────────────────────────────────────
export const useSavingsStore = create<SavingsState>()(
  immer((set, get) => ({
    goals: [], transactions: [], isLoading: false, activeGoalId: null,

    loadGoals: async () => {
      set((s) => { s.isLoading = true; });
      try {
        const records = await database.get<Goal>('goals').query().order('created_at', Q.desc).fetch();
        const goals = records.map(mapGoal);
        set((s) => { s.goals = goals; s.activeGoalId = goals.find((g) => g.status === 'active')?.id ?? null; s.isLoading = false; });
      } catch { set((s) => { s.isLoading = false; }); }
    },

    createGoal: async (input) => {
      const col = database.get<Goal>('goals');
      await database.write(async () => {
        const created = await col.create((g) => {
          g._raw = { id: crypto.randomUUID(), user_id: 'local_user', title: input.title, target_amount: input.targetAmount, current_amount: 0, icon: input.icon ?? null, color: input.color ?? null, strategy: input.strategy ?? null, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), synced_at: null };
        });
        set((s) => { s.goals.unshift(mapGoal(created)); if (!s.activeGoalId) s.activeGoalId = created.id; });
      });
    },

    updateGoal: async (id, updates) => {
      try {
        const goal = await database.get<Goal>('goals').find(id);
        await database.write(async () => {
          await goal.update((g) => {
            if (updates.title !== undefined) g.title = updates.title;
            if (updates.targetAmount !== undefined) g.targetAmount = updates.targetAmount;
            if (updates.icon !== undefined) g.icon = updates.icon;
            if (updates.color !== undefined) g.color = updates.color;
            if (updates.strategy !== undefined) g.strategy = updates.strategy;
            if (updates.status !== undefined) g.status = updates.status;
          });
        });
        set((s) => { const i = s.goals.findIndex((g) => g.id === id); if (i !== -1) s.goals[i] = { ...s.goals[i], ...updates }; });
      } catch { /* noop */ }
    },

    deleteGoal: async (id) => {
      try {
        const goal = await database.get<Goal>('goals').find(id);
        await database.write(async () => { await goal.markAsDeleted(); });
        set((s) => {
          s.goals = s.goals.filter((g) => g.id !== id);
          if (s.activeGoalId === id) s.activeGoalId = s.goals.find((g) => g.status === 'active')?.id ?? null;
        });
      } catch { /* noop */ }
    },

    loadTransactions: async (goalId, limit = 50, offset = 0) => {
      set((s) => { s.isLoading = true; });
      try {
        let query = database.get<Transaction>('transactions').query().order('created_at', Q.desc);
        if (goalId) query = query.where(Q.where('goal_id', goalId));
        const records = await query.fetch();
        set((s) => { s.transactions = records.slice(offset, offset + limit).map(mapTransaction); s.isLoading = false; });
      } catch { set((s) => { s.isLoading = false; }); }
    },

    createTransaction: async (txInput) => {
      // Spec: XP = √(amount) × 2 for deposits, penalty = √(amount) × 3 for withdrawals
      let xpEarned = 0;
      if (txInput.type === 'deposit') {
        xpEarned = Math.floor(Math.sqrt(txInput.amount) * 2);
      } else if (txInput.type === 'bonus') {
        xpEarned = Math.floor(Math.sqrt(txInput.amount) * 1);
      }
      // Withdrawals get negative XP (handled by quest store)
      const txCol = database.get<Transaction>('transactions');
      const goalCol = database.get<Goal>('goals');

      await database.write(async () => {
        const created = await txCol.create((tx) => {
          tx._raw = { id: crypto.randomUUID(), user_id: 'local_user', goal_id: txInput.goalId, type: txInput.type, amount: txInput.amount, category: txInput.category ?? null, note: txInput.note ?? null, xp_earned: xpEarned, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), synced_at: null };
        });
        set((s) => { s.transactions.unshift(mapTransaction(created)); });

        if (txInput.type === 'deposit') {
          await goalCol.find(txInput.goalId).then((g) => g.deposit(txInput.amount));
          const idx = get().goals.findIndex((g) => g.id === txInput.goalId);
          if (idx !== -1) set((s) => {
            s.goals[idx].currentAmount += txInput.amount;
            if (s.goals[idx].currentAmount >= s.goals[idx].targetAmount) s.goals[idx].status = 'completed';
          });
        } else if (txInput.type === 'withdrawal') {
          await goalCol.find(txInput.goalId).then((g) => g.withdraw(txInput.amount));
          const idx = get().goals.findIndex((g) => g.id === txInput.goalId);
          if (idx !== -1) set((s) => {
            s.goals[idx].currentAmount -= txInput.amount;
            if (s.goals[idx].status === 'completed') s.goals[idx].status = 'active';
          });
        }
      });
      return { amount: txInput.amount, xpEarned };
    },

    deleteTransaction: async (id) => {
      try {
        const tx = await database.get<Transaction>('transactions').find(id);
        if (!tx) return;
        const goalIdx = get().goals.findIndex((g) => g.id === tx.goalId);
        // Reverse the goal balance when deleting a transaction
        await database.write(async () => {
          if (tx.type === 'deposit') {
            await database.get<Goal>('goals').find(tx.goalId).then((g) => g.withdraw(tx.amount));
            if (goalIdx !== -1) set((s) => { s.goals[goalIdx].currentAmount -= tx.amount; if (s.goals[goalIdx].currentAmount < 0) s.goals[goalIdx].currentAmount = 0; });
          } else if (tx.type === 'withdrawal') {
            await database.get<Goal>('goals').find(tx.goalId).then((g) => g.deposit(tx.amount));
            if (goalIdx !== -1) set((s) => { s.goals[goalIdx].currentAmount += tx.amount; if (s.goals[goalIdx].currentAmount >= s.goals[goalIdx].targetAmount) s.goals[goalIdx].status = 'completed'; });
          }
          await tx.markAsDeleted();
        });
        set((s) => { s.transactions = s.transactions.filter((t) => t.id !== id); });
      } catch { /* noop */ }
    },

    getActiveGoal: () => {
      const { goals, activeGoalId } = get();
      if (activeGoalId) return goals.find((g) => g.id === activeGoalId);
      return goals.find((g) => g.status === 'active');
    },

    getTotalBalance: () => get().goals.reduce((sum, g) => sum + g.currentAmount, 0),

    getGoalProgress: (goalId) => {
      const goal = get().goals.find((g) => g.id === goalId);
      if (!goal || goal.targetAmount <= 0) return 0;
      return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 10000) / 100, 100);
    },
  })),
);
