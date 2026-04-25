/**
 * SaveState Design System — Achievement Definitions
 *
 * 35 achievement definitions covering savings milestones, streaks,
 * level-ups, quest completions, and special feats.
 */

// ── Achievement Rarity ─────────────────────────────────────────
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

// ── Achievement Definition ─────────────────────────────────────
export interface Achievement {
  /** Unique identifier */
  id: string;
  /** Ukrainian title */
  title: string;
  /** Ukrainian description */
  description: string;
  /** Condition key (used by backend to check unlock) */
  condition: string;
  /** Condition value / threshold */
  conditionValue?: number;
  /** Lucide icon name */
  iconName: string;
  /** Rarity tier */
  rarity: AchievementRarity;
  /** Bonus XP awarded when unlocked */
  xpBonus: number;
  /** Bonus coins awarded when unlocked */
  coinBonus: number;
  /** Category grouping */
  category: 'savings' | 'streak' | 'level' | 'quest' | 'social' | 'special';
  /** Whether this is a hidden achievement (not shown until unlocked) */
  hidden: boolean;
}

// ── Rarity Config ──────────────────────────────────────────────
export const rarityConfig: Record<AchievementRarity, { label: string; labelUk: string; color: string; bgColor: string; glowColor: string }> = {
  common: {
    label: 'Common',
    labelUk: 'Звичайний',
    color: '#A0A0C0',
    bgColor: 'rgba(160,160,192,0.1)',
    glowColor: 'rgba(160,160,192,0.3)',
  },
  rare: {
    label: 'Rare',
    labelUk: 'Рідкісний',
    color: '#00AAFF',
    bgColor: 'rgba(0,170,255,0.1)',
    glowColor: 'rgba(0,170,255,0.3)',
  },
  epic: {
    label: 'Epic',
    labelUk: 'Епічний',
    color: '#9D4EDD',
    bgColor: 'rgba(157,78,221,0.1)',
    glowColor: 'rgba(157,78,221,0.3)',
  },
  legendary: {
    label: 'Legendary',
    labelUk: 'Легендарний',
    color: '#FFD700',
    bgColor: 'rgba(255,215,0,0.1)',
    glowColor: 'rgba(255,215,0,0.3)',
  },
};

// ── All Achievements (35) ──────────────────────────────────────
export const achievements: ReadonlyArray<Achievement> = [
  // ══ Savings (12) ═════════════════════════════════════════════
  {
    id: 'ach_first_deposit',
    title: 'Перший крок',
    description: 'Зробіть своє перше поповнення',
    condition: 'first_deposit',
    iconName: 'footprints',
    rarity: 'common',
    xpBonus: 25,
    coinBonus: 10,
    category: 'savings',
    hidden: false,
  },
  {
    id: 'ach_deposit_1000',
    title: 'Перша тисяча',
    description: 'Збережіть 1 000 ₴',
    condition: 'total_savings',
    conditionValue: 1000,
    iconName: 'banknote',
    rarity: 'common',
    xpBonus: 50,
    coinBonus: 25,
    category: 'savings',
    hidden: false,
  },
  {
    id: 'ach_deposit_10000',
    title: 'Накопичувач',
    description: 'Збережіть 10 000 ₴',
    condition: 'total_savings',
    conditionValue: 10000,
    iconName: 'piggy-bank',
    rarity: 'rare',
    xpBonus: 150,
    coinBonus: 75,
    category: 'savings',
    hidden: false,
  },
  {
    id: 'ach_deposit_50000',
    title: 'Золотий скарб',
    description: 'Збережіть 50 000 ₴',
    condition: 'total_savings',
    conditionValue: 50000,
    iconName: 'gem',
    rarity: 'epic',
    xpBonus: 400,
    coinBonus: 200,
    category: 'savings',
    hidden: false,
  },
  {
    id: 'ach_deposit_100000',
    title: 'Століття заощаджень',
    description: 'Збережіть 100 000 ₴',
    condition: 'total_savings',
    conditionValue: 100000,
    iconName: 'crown',
    rarity: 'legendary',
    xpBonus: 1000,
    coinBonus: 500,
    category: 'savings',
    hidden: false,
  },
  {
    id: 'ach_deposit_500000',
    title: 'Мільйонер',
    description: 'Збережіть 500 000 ₴',
    condition: 'total_savings',
    conditionValue: 500000,
    iconName: 'rocket',
    rarity: 'legendary',
    xpBonus: 2500,
    coinBonus: 1500,
    category: 'savings',
    hidden: true,
  },
  {
    id: 'ach_transactions_10',
    title: 'Діловий',
    description: 'Зробіть 10 транзакцій',
    condition: 'total_transactions',
    conditionValue: 10,
    iconName: 'receipt',
    rarity: 'common',
    xpBonus: 30,
    coinBonus: 15,
    category: 'savings',
    hidden: false,
  },
  {
    id: 'ach_transactions_100',
    title: 'Бухгалтер',
    description: 'Зробіть 100 транзакцій',
    condition: 'total_transactions',
    conditionValue: 100,
    iconName: 'calculator',
    rarity: 'rare',
    xpBonus: 150,
    coinBonus: 75,
    category: 'savings',
    hidden: false,
  },
  {
    id: 'ach_transactions_1000',
    title: 'Фінансовий оракул',
    description: 'Зробіть 1 000 транзакцій',
    condition: 'total_transactions',
    conditionValue: 1000,
    iconName: 'brain',
    rarity: 'epic',
    xpBonus: 400,
    coinBonus: 200,
    category: 'savings',
    hidden: true,
  },
  {
    id: 'ach_goal_created',
    title: 'Мрійник',
    description: 'Створіть першу ціль заощаджень',
    condition: 'goals_created',
    conditionValue: 1,
    iconName: 'target',
    rarity: 'common',
    xpBonus: 35,
    coinBonus: 15,
    category: 'savings',
    hidden: false,
  },
  {
    id: 'ach_goal_completed',
    title: 'Цілеспрямований',
    description: 'Завершіть свою першу ціль',
    condition: 'goals_completed',
    conditionValue: 1,
    iconName: 'check-circle-2',
    rarity: 'rare',
    xpBonus: 200,
    coinBonus: 100,
    category: 'savings',
    hidden: false,
  },
  {
    id: 'ach_goal_completed_5',
    title: 'Майстер цілей',
    description: 'Завершіть 5 цілей заощаджень',
    condition: 'goals_completed',
    conditionValue: 5,
    iconName: 'bullseye',
    rarity: 'epic',
    xpBonus: 500,
    coinBonus: 250,
    category: 'savings',
    hidden: true,
  },

  // ══ Streaks (7) ══════════════════════════════════════════════
  {
    id: 'ach_streak_3',
    title: 'Три дні поспіль',
    description: 'Ведіть записи 3 дні поспіль',
    condition: 'streak_3',
    iconName: 'flame',
    rarity: 'common',
    xpBonus: 40,
    coinBonus: 20,
    category: 'streak',
    hidden: false,
  },
  {
    id: 'ach_streak_7',
    title: 'Тиждень вогню',
    description: 'Ведіть записи 7 днів поспіль',
    condition: 'streak_7',
    iconName: 'flame',
    rarity: 'rare',
    xpBonus: 100,
    coinBonus: 50,
    category: 'streak',
    hidden: false,
  },
  {
    id: 'ach_streak_14',
    title: 'Два тижні дисципліни',
    description: 'Ведіть записи 14 днів поспіль',
    condition: 'streak_14',
    iconName: 'flame',
    rarity: 'rare',
    xpBonus: 180,
    coinBonus: 90,
    category: 'streak',
    hidden: false,
  },
  {
    id: 'ach_streak_30',
    title: 'Місячний чемпіон',
    description: 'Ведіть записи 30 днів поспіль',
    condition: 'streak_30',
    iconName: 'flame',
    rarity: 'epic',
    xpBonus: 350,
    coinBonus: 175,
    category: 'streak',
    hidden: false,
  },
  {
    id: 'ach_streak_60',
    title: 'Два місяці сили',
    description: 'Ведіть записи 60 днів поспіль',
    condition: 'streak_60',
    iconName: 'flame',
    rarity: 'epic',
    xpBonus: 500,
    coinBonus: 250,
    category: 'streak',
    hidden: true,
  },
  {
    id: 'ach_streak_90',
    title: 'Неорганічний вогонь',
    description: 'Ведіть записи 90 днів поспіль',
    condition: 'streak_90',
    iconName: 'flame',
    rarity: 'legendary',
    xpBonus: 1000,
    coinBonus: 500,
    category: 'streak',
    hidden: true,
  },
  {
    id: 'ach_streak_365',
    title: 'Рік незламності',
    description: 'Ведіть записи 365 днів поспіль',
    condition: 'streak_365',
    iconName: 'sun',
    rarity: 'legendary',
    xpBonus: 3000,
    coinBonus: 2000,
    category: 'streak',
    hidden: true,
  },

  // ══ Levels (5) ═══════════════════════════════════════════════
  {
    id: 'ach_level_5',
    title: 'Восьмирід',
    description: 'Досягніть 5 рівня',
    condition: 'level_5',
    iconName: 'arrow-up-circle',
    rarity: 'common',
    xpBonus: 60,
    coinBonus: 30,
    category: 'level',
    hidden: false,
  },
  {
    id: 'ach_level_10',
    title: 'Десятка',
    description: 'Досягніть 10 рівня',
    condition: 'level_10',
    iconName: 'star',
    rarity: 'rare',
    xpBonus: 150,
    coinBonus: 75,
    category: 'level',
    hidden: false,
  },
  {
    id: 'ach_level_25',
    title: 'Чверть шляху',
    description: 'Досягніть 25 рівня',
    condition: 'level_25',
    iconName: 'trending-up',
    rarity: 'epic',
    xpBonus: 400,
    coinBonus: 200,
    category: 'level',
    hidden: false,
  },
  {
    id: 'ach_level_40',
    title: 'Майже на вершині',
    description: 'Досягніть 40 рівня',
    condition: 'level_40',
    iconName: 'zap',
    rarity: 'legendary',
    xpBonus: 800,
    coinBonus: 400,
    category: 'level',
    hidden: true,
  },
  {
    id: 'ach_level_50',
    title: 'Абсолютний максимум',
    description: 'Досягніть 50 рівня',
    condition: 'level_50',
    iconName: 'sun',
    rarity: 'legendary',
    xpBonus: 2000,
    coinBonus: 1000,
    category: 'level',
    hidden: true,
  },

  // ══ Quests (5) ═══════════════════════════════════════════════
  {
    id: 'ach_quest_10',
    title: 'Квестовий новачок',
    description: 'Виконайте 10 квестів',
    condition: 'quest_10',
    iconName: 'scroll',
    rarity: 'common',
    xpBonus: 50,
    coinBonus: 25,
    category: 'quest',
    hidden: false,
  },
  {
    id: 'ach_quest_25',
    title: 'Квестовий ветеран',
    description: 'Виконайте 25 квестів',
    condition: 'quest_25',
    iconName: 'scroll-text',
    rarity: 'rare',
    xpBonus: 150,
    coinBonus: 75,
    category: 'quest',
    hidden: false,
  },
  {
    id: 'ach_quest_50',
    title: 'Квестовий майстер',
    description: 'Виконайте 50 квестів',
    condition: 'quest_50',
    iconName: 'trophy',
    rarity: 'epic',
    xpBonus: 400,
    coinBonus: 200,
    category: 'quest',
    hidden: false,
  },
  {
    id: 'ach_quest_100',
    title: 'Квестовий легенда',
    description: 'Виконайте 100 квестів',
    condition: 'quest_100',
    iconName: 'crown',
    rarity: 'legendary',
    xpBonus: 1000,
    coinBonus: 500,
    category: 'quest',
    hidden: true,
  },
  {
    id: 'ach_story_chapter_1',
    title: 'Перша глава',
    description: 'Завершіть усі квести Розділу 1',
    condition: 'story_chapter_1',
    iconName: 'book-open',
    rarity: 'common',
    xpBonus: 100,
    coinBonus: 50,
    category: 'quest',
    hidden: false,
  },
  {
    id: 'ach_story_complete',
    title: 'Повна історія',
    description: 'Завершіть усі сюжетні квести',
    condition: 'story_complete',
    iconName: 'book-check',
    rarity: 'legendary',
    xpBonus: 2000,
    coinBonus: 1000,
    category: 'quest',
    hidden: true,
  },

  // ══ Social / Special (6) ═════════════════════════════════════
  {
    id: 'ach_invite_friend',
    title: 'Амбасадор',
    description: 'Запросіть друга в SaveState',
    condition: 'invite_friend',
    iconName: 'user-plus',
    rarity: 'common',
    xpBonus: 50,
    coinBonus: 25,
    category: 'social',
    hidden: false,
  },
  {
    id: 'ach_rate_app',
    title: 'Критик',
    description: 'Оцініть додаток',
    condition: 'rate_app',
    iconName: 'star',
    rarity: 'common',
    xpBonus: 30,
    coinBonus: 50,
    category: 'social',
    hidden: false,
  },
  {
    id: 'ach_night_owl',
    title: 'Нічний сова',
    description: 'Зробіть транзакцію між 00:00 та 04:00',
    condition: 'night_transaction',
    iconName: 'moon',
    rarity: 'rare',
    xpBonus: 80,
    coinBonus: 40,
    category: 'special',
    hidden: true,
  },
  {
    id: 'ach_early_bird',
    title: 'Рання пташка',
    description: 'Відкрийте додаток до 06:00 5 днів поспіль',
    condition: 'early_bird_5',
    iconName: 'sunrise',
    rarity: 'rare',
    xpBonus: 100,
    coinBonus: 50,
    category: 'special',
    hidden: true,
  },
  {
    id: 'ach_perfect_week',
    title: 'Ідеальний тиждень',
    description: 'Виконайте всі квести за 7 днів',
    condition: 'perfect_week',
    iconName: 'calendar-check',
    rarity: 'epic',
    xpBonus: 300,
    coinBonus: 150,
    category: 'special',
    hidden: false,
  },
  {
    id: 'ach_zero_spend_day',
    title: 'День скнари',
    description: 'Проживіть день без жодної витрати',
    condition: 'zero_spend_day',
    iconName: 'ban',
    rarity: 'rare',
    xpBonus: 80,
    coinBonus: 40,
    category: 'special',
    hidden: false,
  },
];

// ── Utility: Get achievement by ID ─────────────────────────────
export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}

// ── Utility: Get achievements by category ──────────────────────
export function getAchievementsByCategory(
  category: Achievement['category'],
): ReadonlyArray<Achievement> {
  return achievements.filter((a) => a.category === category);
}

// ── Utility: Get achievements by rarity ────────────────────────
export function getAchievementsByRarity(
  rarity: AchievementRarity,
): ReadonlyArray<Achievement> {
  return achievements.filter((a) => a.rarity === rarity);
}

// ── Achievement Category Labels (Ukrainian) ────────────────────
export const achievementCategoryLabels: Record<Achievement['category'], string> = {
  savings: 'Заощадження',
  streak: 'Серії',
  level: 'Рівні',
  quest: 'Квести',
  social: 'Соціальні',
  special: 'Особливі',
};
