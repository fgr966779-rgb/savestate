import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// ── MMKV Storage Adapter ───────────────────────────────────────
const mmkv = new MMKV();
const mmkvStorage = {
  getItem: (name: string) => mmkv.getString(name) ?? null,
  setItem: (name: string, value: string) => mmkv.set(name, value),
  removeItem: (name: string) => mmkv.delete(name),
};

// ── Types ──────────────────────────────────────────────────────
type ThemeMode = 'dark' | 'light';
type LanguageCode = 'uk' | 'en';
type SelectedGoal = 'ps5' | 'monitor';

export interface RecurringPlanConfig {
  goalId: string | null;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  selectedDay: number;
  time: string;
  enabled: boolean;
}

interface NotificationPreferences {
  quests: boolean;
  achievements: boolean;
  reminders: boolean;
  social: boolean;
  streak: boolean;
}

interface SettingsState {
  theme: ThemeMode;
  language: LanguageCode;
  notifications: NotificationPreferences;
  currency: string;
  hapticEnabled: boolean;
  biometricLock: boolean;
  isOnboarded: boolean;
  selectedGoals: SelectedGoal[];
  recurringPlan: RecurringPlanConfig | null;
  connectedBanks: string[];

  updateTheme: (theme: ThemeMode) => void;
  updateLanguage: (lang: LanguageCode) => void;
  updateNotifications: (updates: Partial<NotificationPreferences>) => void;
  updateCurrency: (currency: string) => void;
  toggleHaptic: () => void;
  toggleBiometricLock: () => void;
  setOnboarded: () => void;
  setSelectedGoals: (goals: SelectedGoal[]) => void;
  setRecurringPlan: (plan: RecurringPlanConfig | null) => void;
  setConnectedBanks: (banks: string[]) => void;
  resetSettings: () => void;
}

// ── Default Values ─────────────────────────────────────────────
const DEFAULT_STATE = {
  theme: 'dark' as ThemeMode,
  language: 'uk' as LanguageCode,
  notifications: {
    quests: true,
    achievements: true,
    reminders: true,
    social: false,
    streak: true,
  } satisfies NotificationPreferences,
  currency: 'UAH',
  hapticEnabled: true,
  biometricLock: false,
  isOnboarded: false,
  selectedGoals: [] as SelectedGoal[],
  recurringPlan: null as RecurringPlanConfig | null,
  connectedBanks: [] as string[],
};

// ── Store ──────────────────────────────────────────────────────
export const useSettingsStore = create<SettingsState>()(
  immer(
    persist(
      (set) => ({
        ...DEFAULT_STATE,

        updateTheme(theme: ThemeMode) {
          set((state) => {
            state.theme = theme;
          });
        },

        updateLanguage(lang: LanguageCode) {
          set((state) => {
            state.language = lang;
          });
        },

        updateNotifications(updates: Partial<NotificationPreferences>) {
          set((state) => {
            Object.assign(state.notifications, updates);
          });
        },

        updateCurrency(currency: string) {
          set((state) => {
            state.currency = currency;
          });
        },

        toggleHaptic() {
          set((state) => {
            state.hapticEnabled = !state.hapticEnabled;
          });
        },

        toggleBiometricLock() {
          set((state) => {
            state.biometricLock = !state.biometricLock;
          });
        },

        setOnboarded() {
          set((state) => {
            state.isOnboarded = true;
          });
        },

        setSelectedGoals(goals: SelectedGoal[]) {
          set((state) => {
            state.selectedGoals = goals;
          });
        },

        setRecurringPlan(plan: RecurringPlanConfig | null) {
          set((state) => {
            state.recurringPlan = plan;
          });
        },

        setConnectedBanks(banks: string[]) {
          set((state) => {
            state.connectedBanks = banks;
          });
        },

        resetSettings() {
          set(() => ({
            ...DEFAULT_STATE,
            notifications: { ...DEFAULT_STATE.notifications },
            selectedGoals: [...DEFAULT_STATE.selectedGoals],
          }));
        },
      }),
      {
        name: 'SaveState-settings',
        storage: createJSONStorage(() => mmkvStorage),
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          notifications: state.notifications,
          currency: state.currency,
          hapticEnabled: state.hapticEnabled,
          biometricLock: state.biometricLock,
          isOnboarded: state.isOnboarded,
          selectedGoals: state.selectedGoals,
          recurringPlan: state.recurringPlan,
          connectedBanks: state.connectedBanks,
        }),
      },
    ),
  ),
);
