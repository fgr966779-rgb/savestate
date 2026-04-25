/**
 * SaveState Design System — Navigation Configuration
 *
 * All route names, deep link configs, and fully typed navigation params
 * for React Navigation. Covers all 75 screens organized by feature.
 */

import { LinkingOptions } from '@react-navigation/native';

// ═══════════════════════════════════════════════════════════════
// ROUTE NAMES
// ═══════════════════════════════════════════════════════════════

export const Routes = {
  // ── Onboarding (5) ───────────────────────────────────────────
  SPLASH: 'Splash',
  ONBOARDING_WELCOME: 'OnboardingWelcome',
  ONBOARDING_NAME: 'OnboardingName',
  ONBOARDING_CURRENCY: 'OnboardingCurrency',
  ONBOARDING_GOAL: 'OnboardingGoal',
  ONBOARDING_COMPLETE: 'OnboardingComplete',

  // ── Auth (5) ─────────────────────────────────────────────────
  AUTH_LOGIN: 'AuthLogin',
  AUTH_REGISTER: 'AuthRegister',
  AUTH_FORGOT_PASSWORD: 'AuthForgotPassword',
  AUTH_RESET_PASSWORD: 'AuthResetPassword',
  AUTH_BIOMETRICS: 'AuthBiometrics',

  // ── Main Tabs (5) ────────────────────────────────────────────
  TAB_HOME: 'TabHome',
  TAB_TRANSACTIONS: 'TabTransactions',
  TAB_ADD: 'TabAdd',
  TAB_STATS: 'TabStats',
  TAB_PROFILE: 'TabProfile',

  // ── Home Stack (10) ──────────────────────────────────────────
  HOME_DASHBOARD: 'HomeDashboard',
  HOME_LEVEL_UP: 'HomeLevelUp',
  HOME_QUESTS: 'HomeQuests',
  HOME_QUEST_DETAIL: 'HomeQuestDetail',
  HOME_ACHIEVEMENTS: 'HomeAchievements',
  HOME_ACHIEVEMENT_DETAIL: 'HomeAchievementDetail',
  HOME_STREAKS: 'HomeStreaks',
  HOME_NOTIFICATIONS: 'HomeNotifications',
  HOME_NOTIFICATION_DETAIL: 'HomeNotificationDetail',
  HOME_CELEBRATION: 'HomeCelebration',

  // ── Transactions Stack (10) ──────────────────────────────────
  TRANSACTIONS_LIST: 'TransactionsList',
  TRANSACTIONS_ADD: 'TransactionsAdd',
  TRANSACTIONS_EDIT: 'TransactionsEdit',
  TRANSACTIONS_DETAIL: 'TransactionsDetail',
  TRANSACTIONS_SEARCH: 'TransactionsSearch',
  TRANSACTIONS_FILTER: 'TransactionsFilter',
  TRANSACTIONS_SCHEDULED: 'TransactionsScheduled',
  TRANSACTIONS_RECURRING: 'TransactionsRecurring',
  TRANSACTIONS_BULK_DELETE: 'TransactionsBulkDelete',
  TRANSACTIONS_EXPORT: 'TransactionsExport',

  // ── Add Transaction Flow (5) ─────────────────────────────────
  ADD_AMOUNT: 'AddAmount',
  ADD_CATEGORY: 'AddCategory',
  ADD_DESCRIPTION: 'AddDescription',
  ADD_DATE: 'AddDate',
  ADD_CONFIRM: 'AddConfirm',

  // ── Stats / Analytics Stack (10) ─────────────────────────────
  STATS_OVERVIEW: 'StatsOverview',
  STATS_INCOME: 'StatsIncome',
  STATS_EXPENSES: 'StatsExpenses',
  STATS_BY_CATEGORY: 'StatsByCategory',
  STATS_BY_PERIOD: 'StatsByPeriod',
  STATS_TRENDS: 'StatsTrends',
  STATS_BUDGET: 'StatsBudget',
  STATS_BUDGET_EDIT: 'StatsBudgetEdit',
  STATS_FORECAST: 'StatsForecast',
  STATS_REPORTS: 'StatsReports',

  // ── Savings Goals Stack (8) ──────────────────────────────────
  GOALS_LIST: 'GoalsList',
  GOALS_CREATE: 'GoalsCreate',
  GOALS_EDIT: 'GoalsEdit',
  GOALS_DETAIL: 'GoalsDetail',
  GOALS_CONTRIBUTION: 'GoalsContribution',
  GOALS_HISTORY: 'GoalsHistory',
  GOALS_TEMPLATES: 'GoalsTemplates',
  GOALS_CELEBRATION: 'GoalsCelebration',

  // ── Profile / Settings Stack (10) ────────────────────────────
  PROFILE_MAIN: 'ProfileMain',
  PROFILE_EDIT: 'ProfileEdit',
  PROFILE_AVATAR: 'ProfileAvatar',
  PROFILE_SECURITY: 'ProfileSecurity',
  PROFILE_PREFERENCES: 'ProfilePreferences',
  PROFILE_THEME: 'ProfileTheme',
  PROFILE_LANGUAGE: 'ProfileLanguage',
  PROFILE_CURRENCY: 'ProfileCurrency',
  PROFILE_NOTIFICATIONS_SETTINGS: 'ProfileNotificationsSettings',
  PROFILE_DATA_EXPORT: 'ProfileDataExport',

  // ── Social / Leaderboard (5) ─────────────────────────────────
  SOCIAL_LEADERBOARD: 'SocialLeaderboard',
  SOCIAL_FRIENDS: 'SocialFriends',
  SOCIAL_FRIEND_PROFILE: 'SocialFriendProfile',
  SOCIAL_INVITE: 'SocialInvite',
  SOCIAL_CHALLENGES: 'SocialChallenges',

  // ── Support / Misc (5) ───────────────────────────────────────
  SUPPORT_FAQ: 'SupportFAQ',
  SUPPORT_CONTACT: 'SupportContact',
  SUPPORT_ABOUT: 'SupportAbout',
  MODAL_BOTTOM_SHEET: 'ModalBottomSheet',
  MODAL_CONFIRM: 'ModalConfirm',
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];

// ═══════════════════════════════════════════════════════════════
// NAVIGATION PARAM TYPES
// ═══════════════════════════════════════════════════════════════

export interface EmptyParams {}

// ── Onboarding Params ──────────────────────────────────────────
export interface OnboardingWelcomeParams extends EmptyParams {}
export interface OnboardingNameParams extends EmptyParams {}
export interface OnboardingCurrencyParams extends EmptyParams {}
export interface OnboardingGoalParams extends EmptyParams {}
export interface OnboardingCompleteParams extends EmptyParams {}

// ── Auth Params ────────────────────────────────────────────────
export interface AuthLoginParams extends EmptyParams {}
export interface AuthRegisterParams extends EmptyParams {}
export interface AuthForgotPasswordParams extends EmptyParams {}
export interface AuthResetPasswordParams {
  token?: string;
  email?: string;
}
export interface AuthBiometricsParams extends EmptyParams {}

// ── Tab Params ─────────────────────────────────────────────────
export interface TabHomeParams extends EmptyParams {}
export interface TabTransactionsParams extends EmptyParams {}
export interface TabAddParams extends EmptyParams {}
export interface TabStatsParams extends EmptyParams {}
export interface TabProfileParams extends EmptyParams {}

// ── Home Stack Params ──────────────────────────────────────────
export interface HomeDashboardParams extends EmptyParams {}
export interface HomeLevelUpParams {
  fromLevel: number;
  toLevel: number;
  isNewLevel?: boolean;
}
export interface HomeQuestsParams {
  filter?: 'daily' | 'weekly' | 'story';
}
export interface HomeQuestDetailParams {
  questId: string;
}
export interface HomeAchievementsParams {
  filter?: 'savings' | 'streak' | 'level' | 'quest' | 'social' | 'special';
}
export interface HomeAchievementDetailParams {
  achievementId: string;
}
export interface HomeStreaksParams extends EmptyParams {}
export interface HomeNotificationsParams extends EmptyParams {}
export interface HomeNotificationDetailParams {
  notificationId: string;
}
export interface HomeCelebrationParams {
  type: 'level_up' | 'achievement' | 'quest' | 'goal' | 'streak';
  title: string;
  subtitle?: string;
  rewardXP?: number;
  rewardCoins?: number;
  iconName?: string;
}

// ── Transactions Stack Params ──────────────────────────────────
export interface TransactionsListParams {
  initialCategory?: string;
  initialDateRange?: 'today' | 'week' | 'month' | 'year' | 'all';
}
export interface TransactionsAddParams {
  prefillAmount?: number;
  prefillCategory?: string;
  prefillType?: 'income' | 'expense';
}
export interface TransactionsEditParams {
  transactionId: string;
}
export interface TransactionsDetailParams {
  transactionId: string;
}
export interface TransactionsSearchParams extends EmptyParams {}
export interface TransactionsFilterParams {
  initialFilters?: {
    categories?: string[];
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    type?: 'income' | 'expense';
  };
}
export interface TransactionsScheduledParams extends EmptyParams {}
export interface TransactionsRecurringParams extends EmptyParams {}
export interface TransactionsBulkDeleteParams {
  transactionIds: string[];
}
export interface TransactionsExportParams {
  format?: 'csv' | 'pdf' | 'xlsx';
  dateFrom?: string;
  dateTo?: string;
}

// ── Add Transaction Flow Params ────────────────────────────────
export interface AddAmountParams {
  type: 'income' | 'expense';
  initialAmount?: number;
}
export interface AddCategoryParams {
  type: 'income' | 'expense';
  selectedCategoryId?: string;
}
export interface AddDescriptionParams {
  prefillDescription?: string;
}
export interface AddDateParams {
  initialDate?: string;
}
export interface AddConfirmParams {
  amount: number;
  categoryId: string;
  type: 'income' | 'expense';
  description?: string;
  date: string;
}

// ── Stats / Analytics Params ───────────────────────────────────
export interface StatsOverviewParams extends EmptyParams {}
export interface StatsIncomeParams extends EmptyParams {}
export interface StatsExpensesParams extends EmptyParams {}
export interface StatsByCategoryParams {
  type?: 'income' | 'expense';
  period?: 'week' | 'month' | 'year';
}
export interface StatsByPeriodParams extends EmptyParams {}
export interface StatsTrendsParams extends EmptyParams {}
export interface StatsBudgetParams extends EmptyParams {}
export interface StatsBudgetEditParams {
  budgetId?: string;
}
export interface StatsForecastParams extends EmptyParams {}
export interface StatsReportsParams extends EmptyParams {}

// ── Savings Goals Params ───────────────────────────────────────
export interface GoalsListParams extends EmptyParams {}
export interface GoalsCreateParams {
  templateId?: string;
}
export interface GoalsEditParams {
  goalId: string;
}
export interface GoalsDetailParams {
  goalId: string;
}
export interface GoalsContributionParams {
  goalId: string;
  prefillAmount?: number;
}
export interface GoalsHistoryParams {
  goalId: string;
}
export interface GoalsTemplatesParams extends EmptyParams {}
export interface GoalsCelebrationParams {
  goalId: string;
  goalTitle: string;
  targetAmount: number;
}

// ── Profile / Settings Params ──────────────────────────────────
export interface ProfileMainParams extends EmptyParams {}
export interface ProfileEditParams extends EmptyParams {}
export interface ProfileAvatarParams {
  source?: 'camera' | 'gallery';
}
export interface ProfileSecurityParams extends EmptyParams {}
export interface ProfilePreferencesParams extends EmptyParams {}
export interface ProfileThemeParams extends EmptyParams {}
export interface ProfileLanguageParams extends EmptyParams {}
export interface ProfileCurrencyParams extends EmptyParams {}
export interface ProfileNotificationsSettingsParams extends EmptyParams {}
export interface ProfileDataExportParams extends EmptyParams {}

// ── Social / Leaderboard Params ────────────────────────────────
export interface SocialLeaderboardParams {
  period?: 'weekly' | 'monthly' | 'all_time';
}
export interface SocialFriendsParams extends EmptyParams {}
export interface SocialFriendProfileParams {
  userId: string;
}
export interface SocialInviteParams extends EmptyParams {}
export interface SocialChallengesParams extends EmptyParams {}

// ── Support / Misc Params ──────────────────────────────────────
export interface SupportFAQParams {
  initialQuestionId?: string;
}
export interface SupportContactParams {
  subject?: string;
}
export interface SupportAboutParams extends EmptyParams {}
export interface ModalBottomSheetParams {
  title?: string;
  contentComponent?: string;
  height?: 'small' | 'medium' | 'large' | 'full';
  snapPoints?: number[];
}
export interface ModalConfirmParams {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'default';
  onConfirm?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSOLIDATED ROUTE PARAMS MAP
// ═══════════════════════════════════════════════════════════════

export type RouteParams = {
  // Onboarding
  [Routes.SPLASH]: EmptyParams;
  [Routes.ONBOARDING_WELCOME]: OnboardingWelcomeParams;
  [Routes.ONBOARDING_NAME]: OnboardingNameParams;
  [Routes.ONBOARDING_CURRENCY]: OnboardingCurrencyParams;
  [Routes.ONBOARDING_GOAL]: OnboardingGoalParams;
  [Routes.ONBOARDING_COMPLETE]: OnboardingCompleteParams;

  // Auth
  [Routes.AUTH_LOGIN]: AuthLoginParams;
  [Routes.AUTH_REGISTER]: AuthRegisterParams;
  [Routes.AUTH_FORGOT_PASSWORD]: AuthForgotPasswordParams;
  [Routes.AUTH_RESET_PASSWORD]: AuthResetPasswordParams;
  [Routes.AUTH_BIOMETRICS]: AuthBiometricsParams;

  // Tabs
  [Routes.TAB_HOME]: TabHomeParams;
  [Routes.TAB_TRANSACTIONS]: TabTransactionsParams;
  [Routes.TAB_ADD]: TabAddParams;
  [Routes.TAB_STATS]: TabStatsParams;
  [Routes.TAB_PROFILE]: TabProfileParams;

  // Home Stack
  [Routes.HOME_DASHBOARD]: HomeDashboardParams;
  [Routes.HOME_LEVEL_UP]: HomeLevelUpParams;
  [Routes.HOME_QUESTS]: HomeQuestsParams;
  [Routes.HOME_QUEST_DETAIL]: HomeQuestDetailParams;
  [Routes.HOME_ACHIEVEMENTS]: HomeAchievementsParams;
  [Routes.HOME_ACHIEVEMENT_DETAIL]: HomeAchievementDetailParams;
  [Routes.HOME_STREAKS]: HomeStreaksParams;
  [Routes.HOME_NOTIFICATIONS]: HomeNotificationsParams;
  [Routes.HOME_NOTIFICATION_DETAIL]: HomeNotificationDetailParams;
  [Routes.HOME_CELEBRATION]: HomeCelebrationParams;

  // Transactions Stack
  [Routes.TRANSACTIONS_LIST]: TransactionsListParams;
  [Routes.TRANSACTIONS_ADD]: TransactionsAddParams;
  [Routes.TRANSACTIONS_EDIT]: TransactionsEditParams;
  [Routes.TRANSACTIONS_DETAIL]: TransactionsDetailParams;
  [Routes.TRANSACTIONS_SEARCH]: TransactionsSearchParams;
  [Routes.TRANSACTIONS_FILTER]: TransactionsFilterParams;
  [Routes.TRANSACTIONS_SCHEDULED]: TransactionsScheduledParams;
  [Routes.TRANSACTIONS_RECURRING]: TransactionsRecurringParams;
  [Routes.TRANSACTIONS_BULK_DELETE]: TransactionsBulkDeleteParams;
  [Routes.TRANSACTIONS_EXPORT]: TransactionsExportParams;

  // Add Flow
  [Routes.ADD_AMOUNT]: AddAmountParams;
  [Routes.ADD_CATEGORY]: AddCategoryParams;
  [Routes.ADD_DESCRIPTION]: AddDescriptionParams;
  [Routes.ADD_DATE]: AddDateParams;
  [Routes.ADD_CONFIRM]: AddConfirmParams;

  // Stats
  [Routes.STATS_OVERVIEW]: StatsOverviewParams;
  [Routes.STATS_INCOME]: StatsIncomeParams;
  [Routes.STATS_EXPENSES]: StatsExpensesParams;
  [Routes.STATS_BY_CATEGORY]: StatsByCategoryParams;
  [Routes.STATS_BY_PERIOD]: StatsByPeriodParams;
  [Routes.STATS_TRENDS]: StatsTrendsParams;
  [Routes.STATS_BUDGET]: StatsBudgetParams;
  [Routes.STATS_BUDGET_EDIT]: StatsBudgetEditParams;
  [Routes.STATS_FORECAST]: StatsForecastParams;
  [Routes.STATS_REPORTS]: StatsReportsParams;

  // Goals
  [Routes.GOALS_LIST]: GoalsListParams;
  [Routes.GOALS_CREATE]: GoalsCreateParams;
  [Routes.GOALS_EDIT]: GoalsEditParams;
  [Routes.GOALS_DETAIL]: GoalsDetailParams;
  [Routes.GOALS_CONTRIBUTION]: GoalsContributionParams;
  [Routes.GOALS_HISTORY]: GoalsHistoryParams;
  [Routes.GOALS_TEMPLATES]: GoalsTemplatesParams;
  [Routes.GOALS_CELEBRATION]: GoalsCelebrationParams;

  // Profile
  [Routes.PROFILE_MAIN]: ProfileMainParams;
  [Routes.PROFILE_EDIT]: ProfileEditParams;
  [Routes.PROFILE_AVATAR]: ProfileAvatarParams;
  [Routes.PROFILE_SECURITY]: ProfileSecurityParams;
  [Routes.PROFILE_PREFERENCES]: ProfilePreferencesParams;
  [Routes.PROFILE_THEME]: ProfileThemeParams;
  [Routes.PROFILE_LANGUAGE]: ProfileLanguageParams;
  [Routes.PROFILE_CURRENCY]: ProfileCurrencyParams;
  [Routes.PROFILE_NOTIFICATIONS_SETTINGS]: ProfileNotificationsSettingsParams;
  [Routes.PROFILE_DATA_EXPORT]: ProfileDataExportParams;

  // Social
  [Routes.SOCIAL_LEADERBOARD]: SocialLeaderboardParams;
  [Routes.SOCIAL_FRIENDS]: SocialFriendsParams;
  [Routes.SOCIAL_FRIEND_PROFILE]: SocialFriendProfileParams;
  [Routes.SOCIAL_INVITE]: SocialInviteParams;
  [Routes.SOCIAL_CHALLENGES]: SocialChallengesParams;

  // Support
  [Routes.SUPPORT_FAQ]: SupportFAQParams;
  [Routes.SUPPORT_CONTACT]: SupportContactParams;
  [Routes.SUPPORT_ABOUT]: SupportAboutParams;
  [Routes.MODAL_BOTTOM_SHEET]: ModalBottomSheetParams;
  [Routes.MODAL_CONFIRM]: ModalConfirmParams;
};

// ═══════════════════════════════════════════════════════════════
// TAB NAVIGATOR CONFIG
// ═══════════════════════════════════════════════════════════════

export interface TabNavigatorConfig {
  name: RouteName;
  label: string;
  iconName: string;
  iconFocused: string;
}

export const tabConfig: ReadonlyArray<TabNavigatorConfig> = [
  {
    name: Routes.TAB_HOME,
    label: 'Головна',
    iconName: 'home',
    iconFocused: 'home',
  },
  {
    name: Routes.TAB_TRANSACTIONS,
    label: 'Транзакції',
    iconName: 'receipt',
    iconFocused: 'receipt',
  },
  {
    name: Routes.TAB_ADD,
    label: 'Додати',
    iconName: 'plus-circle',
    iconFocused: 'plus-circle',
  },
  {
    name: Routes.TAB_STATS,
    label: 'Статистика',
    iconName: 'bar-chart-3',
    iconFocused: 'bar-chart-3',
  },
  {
    name: Routes.TAB_PROFILE,
    label: 'Профіль',
    iconName: 'user',
    iconFocused: 'user',
  },
];

// ═══════════════════════════════════════════════════════════════
// STACK GROUPS (for navigator structure)
// ═══════════════════════════════════════════════════════════════

export const StackGroups = {
  ONBOARDING: 'OnboardingStack' as const,
  AUTH: 'AuthStack' as const,
  HOME: 'HomeStack' as const,
  TRANSACTIONS: 'TransactionsStack' as const,
  ADD_FLOW: 'AddFlowStack' as const,
  STATS: 'StatsStack' as const,
  GOALS: 'GoalsStack' as const,
  PROFILE: 'ProfileStack' as const,
  SOCIAL: 'SocialStack' as const,
  SUPPORT: 'SupportStack' as const,
  MODAL: 'ModalStack' as const,
} as const;

export type StackGroupKey = keyof typeof StackGroups;

// ═══════════════════════════════════════════════════════════════
// DEEP LINK CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const DeepLinkPrefixes = {
  /** Primary app scheme */
  APP: 'SaveState://',
  /** Universal link prefix */
  HTTPS: 'https://SaveState.app',
} as const;

/**
 * Full deep linking configuration for React Navigation.
 *
 * @example
 * ```ts
 * import { linking } from '@/constants/navigation';
 * <NavigationContainer linking={linking}>
 *   ...
 * </NavigationContainer>
 * ```
 */
export const linking: LinkingOptions<RouteParams> = {
  prefixes: [DeepLinkPrefixes.APP, DeepLinkPrefixes.HTTPS],
  config: {
    screens: {
      // Onboarding
      [Routes.SPLASH]: '',
      [Routes.ONBOARDING_WELCOME]: 'onboarding',
      [Routes.ONBOARDING_NAME]: 'onboarding/name',
      [Routes.ONBOARDING_CURRENCY]: 'onboarding/currency',
      [Routes.ONBOARDING_GOAL]: 'onboarding/goal',
      [Routes.ONBOARDING_COMPLETE]: 'onboarding/complete',

      // Auth
      [Routes.AUTH_LOGIN]: 'auth/login',
      [Routes.AUTH_REGISTER]: 'auth/register',
      [Routes.AUTH_FORGOT_PASSWORD]: 'auth/forgot-password',
      [Routes.AUTH_RESET_PASSWORD]: 'auth/reset-password',
      [Routes.AUTH_BIOMETRICS]: 'auth/biometrics',

      // Main tabs
      [Routes.TAB_HOME]: 'home',
      [Routes.TAB_TRANSACTIONS]: 'transactions',
      [Routes.TAB_ADD]: 'add',
      [Routes.TAB_STATS]: 'stats',
      [Routes.TAB_PROFILE]: 'profile',

      // Home stack
      [Routes.HOME_DASHBOARD]: 'home/dashboard',
      [Routes.HOME_LEVEL_UP]: 'home/level-up',
      [Routes.HOME_QUESTS]: 'home/quests',
      [Routes.HOME_QUEST_DETAIL]: 'home/quests/:questId',
      [Routes.HOME_ACHIEVEMENTS]: 'home/achievements',
      [Routes.HOME_ACHIEVEMENT_DETAIL]: 'home/achievements/:achievementId',
      [Routes.HOME_STREAKS]: 'home/streaks',
      [Routes.HOME_NOTIFICATIONS]: 'home/notifications',
      [Routes.HOME_NOTIFICATION_DETAIL]: 'home/notifications/:notificationId',
      [Routes.HOME_CELEBRATION]: 'home/celebration',

      // Transactions
      [Routes.TRANSACTIONS_LIST]: 'transactions/list',
      [Routes.TRANSACTIONS_ADD]: 'transactions/add',
      [Routes.TRANSACTIONS_EDIT]: 'transactions/edit/:transactionId',
      [Routes.TRANSACTIONS_DETAIL]: 'transactions/:transactionId',
      [Routes.TRANSACTIONS_SEARCH]: 'transactions/search',
      [Routes.TRANSACTIONS_FILTER]: 'transactions/filter',
      [Routes.TRANSACTIONS_SCHEDULED]: 'transactions/scheduled',
      [Routes.TRANSACTIONS_RECURRING]: 'transactions/recurring',
      [Routes.TRANSACTIONS_EXPORT]: 'transactions/export',

      // Stats
      [Routes.STATS_OVERVIEW]: 'stats/overview',
      [Routes.STATS_INCOME]: 'stats/income',
      [Routes.STATS_EXPENSES]: 'stats/expenses',
      [Routes.STATS_BY_CATEGORY]: 'stats/categories',
      [Routes.STATS_BUDGET]: 'stats/budget',
      [Routes.STATS_TRENDS]: 'stats/trends',
      [Routes.STATS_FORECAST]: 'stats/forecast',
      [Routes.STATS_REPORTS]: 'stats/reports',

      // Goals
      [Routes.GOALS_LIST]: 'goals',
      [Routes.GOALS_CREATE]: 'goals/create',
      [Routes.GOALS_EDIT]: 'goals/edit/:goalId',
      [Routes.GOALS_DETAIL]: 'goals/:goalId',
      [Routes.GOALS_CONTRIBUTION]: 'goals/:goalId/contribute',
      [Routes.GOALS_HISTORY]: 'goals/:goalId/history',
      [Routes.GOALS_TEMPLATES]: 'goals/templates',

      // Profile
      [Routes.PROFILE_MAIN]: 'profile',
      [Routes.PROFILE_EDIT]: 'profile/edit',
      [Routes.PROFILE_SECURITY]: 'profile/security',
      [Routes.PROFILE_PREFERENCES]: 'profile/preferences',
      [Routes.PROFILE_THEME]: 'profile/theme',
      [Routes.PROFILE_LANGUAGE]: 'profile/language',
      [Routes.PROFILE_DATA_EXPORT]: 'profile/export',

      // Social
      [Routes.SOCIAL_LEADERBOARD]: 'social/leaderboard',
      [Routes.SOCIAL_FRIENDS]: 'social/friends',
      [Routes.SOCIAL_FRIEND_PROFILE]: 'social/friends/:userId',
      [Routes.SOCIAL_INVITE]: 'social/invite',
      [Routes.SOCIAL_CHALLENGES]: 'social/challenges',

      // Support
      [Routes.SUPPORT_FAQ]: 'support/faq',
      [Routes.SUPPORT_CONTACT]: 'support/contact',
      [Routes.SUPPORT_ABOUT]: 'support/about',
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// SCREEN COUNT (for verification)
// ═══════════════════════════════════════════════════════════════

/** Total number of defined route screens (computed dynamically) */
export const TOTAL_SCREEN_COUNT = Object.keys(Routes).length;

// ═══════════════════════════════════════════════════════════════
// ROUTE GROUP HELPER
// ═══════════════════════════════════════════════════════════════

export interface RouteGroupDefinition {
  group: StackGroupKey;
  routes: RouteName[];
  isStack: boolean;
}

export const routeGroups: ReadonlyArray<RouteGroupDefinition> = [
  {
    group: 'ONBOARDING',
    routes: [
      Routes.SPLASH,
      Routes.ONBOARDING_WELCOME,
      Routes.ONBOARDING_NAME,
      Routes.ONBOARDING_CURRENCY,
      Routes.ONBOARDING_GOAL,
      Routes.ONBOARDING_COMPLETE,
    ],
    isStack: true,
  },
  {
    group: 'AUTH',
    routes: [
      Routes.AUTH_LOGIN,
      Routes.AUTH_REGISTER,
      Routes.AUTH_FORGOT_PASSWORD,
      Routes.AUTH_RESET_PASSWORD,
      Routes.AUTH_BIOMETRICS,
    ],
    isStack: true,
  },
  {
    group: 'HOME',
    routes: [
      Routes.HOME_DASHBOARD,
      Routes.HOME_LEVEL_UP,
      Routes.HOME_QUESTS,
      Routes.HOME_QUEST_DETAIL,
      Routes.HOME_ACHIEVEMENTS,
      Routes.HOME_ACHIEVEMENT_DETAIL,
      Routes.HOME_STREAKS,
      Routes.HOME_NOTIFICATIONS,
      Routes.HOME_NOTIFICATION_DETAIL,
      Routes.HOME_CELEBRATION,
    ],
    isStack: true,
  },
  {
    group: 'TRANSACTIONS',
    routes: [
      Routes.TRANSACTIONS_LIST,
      Routes.TRANSACTIONS_ADD,
      Routes.TRANSACTIONS_EDIT,
      Routes.TRANSACTIONS_DETAIL,
      Routes.TRANSACTIONS_SEARCH,
      Routes.TRANSACTIONS_FILTER,
      Routes.TRANSACTIONS_SCHEDULED,
      Routes.TRANSACTIONS_RECURRING,
      Routes.TRANSACTIONS_BULK_DELETE,
      Routes.TRANSACTIONS_EXPORT,
    ],
    isStack: true,
  },
  {
    group: 'ADD_FLOW',
    routes: [
      Routes.ADD_AMOUNT,
      Routes.ADD_CATEGORY,
      Routes.ADD_DESCRIPTION,
      Routes.ADD_DATE,
      Routes.ADD_CONFIRM,
    ],
    isStack: true,
  },
  {
    group: 'STATS',
    routes: [
      Routes.STATS_OVERVIEW,
      Routes.STATS_INCOME,
      Routes.STATS_EXPENSES,
      Routes.STATS_BY_CATEGORY,
      Routes.STATS_BY_PERIOD,
      Routes.STATS_TRENDS,
      Routes.STATS_BUDGET,
      Routes.STATS_BUDGET_EDIT,
      Routes.STATS_FORECAST,
      Routes.STATS_REPORTS,
    ],
    isStack: true,
  },
  {
    group: 'GOALS',
    routes: [
      Routes.GOALS_LIST,
      Routes.GOALS_CREATE,
      Routes.GOALS_EDIT,
      Routes.GOALS_DETAIL,
      Routes.GOALS_CONTRIBUTION,
      Routes.GOALS_HISTORY,
      Routes.GOALS_TEMPLATES,
      Routes.GOALS_CELEBRATION,
    ],
    isStack: true,
  },
  {
    group: 'PROFILE',
    routes: [
      Routes.PROFILE_MAIN,
      Routes.PROFILE_EDIT,
      Routes.PROFILE_AVATAR,
      Routes.PROFILE_SECURITY,
      Routes.PROFILE_PREFERENCES,
      Routes.PROFILE_THEME,
      Routes.PROFILE_LANGUAGE,
      Routes.PROFILE_CURRENCY,
      Routes.PROFILE_NOTIFICATIONS_SETTINGS,
      Routes.PROFILE_DATA_EXPORT,
    ],
    isStack: true,
  },
  {
    group: 'SOCIAL',
    routes: [
      Routes.SOCIAL_LEADERBOARD,
      Routes.SOCIAL_FRIENDS,
      Routes.SOCIAL_FRIEND_PROFILE,
      Routes.SOCIAL_INVITE,
      Routes.SOCIAL_CHALLENGES,
    ],
    isStack: true,
  },
  {
    group: 'SUPPORT',
    routes: [
      Routes.SUPPORT_FAQ,
      Routes.SUPPORT_CONTACT,
      Routes.SUPPORT_ABOUT,
    ],
    isStack: true,
  },
  {
    group: 'MODAL',
    routes: [
      Routes.MODAL_BOTTOM_SHEET,
      Routes.MODAL_CONFIRM,
    ],
    isStack: false,
  },
];

// ═══════════════════════════════════════════════════════════════
// UTILITY: Get group for route
// ═══════════════════════════════════════════════════════════════

export function getRouteGroup(routeName: RouteName): RouteGroupDefinition | undefined {
  return routeGroups.find((g) => g.routes.includes(routeName));
}

export function getRoutesByGroup(group: StackGroupKey): RouteName[] {
  const def = routeGroups.find((g) => g.group === group);
  return def?.routes ?? [];
}
