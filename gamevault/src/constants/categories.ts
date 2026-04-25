/**
 * SaveState Design System — Transaction Categories
 *
 * Pre-defined income and expense categories with Ukrainian names,
 * Lucide icon references, and brand colors.
 */

// ── Transaction Type ───────────────────────────────────────────
export type TransactionType = 'income' | 'expense';

// ── Category Definition ────────────────────────────────────────
export interface TransactionCategory {
  /** Unique identifier (snake_case) */
  id: string;
  /** English name */
  name: string;
  /** Ukrainian name */
  nameUk: string;
  /** Lucide icon name */
  icon: string;
  /** Brand color (hex) */
  color: string;
  /** Whether this is income or expense */
  type: TransactionType;
  /** Sort order (lower = shown first) */
  order: number;
  /** Whether this is a system / default category */
  isDefault: boolean;
}

// ── All Categories ─────────────────────────────────────────────
export const categories: ReadonlyArray<TransactionCategory> = [
  // ══ Income Categories ════════════════════════════════════════
  {
    id: 'salary',
    name: 'Salary',
    nameUk: 'Зарплата',
    icon: 'briefcase',
    color: '#00FF88',
    type: 'income',
    order: 1,
    isDefault: true,
  },
  {
    id: 'freelance',
    name: 'Freelance',
    nameUk: 'Фріланс',
    icon: 'laptop',
    color: '#00AAFF',
    type: 'income',
    order: 2,
    isDefault: true,
  },
  {
    id: 'gift',
    name: 'Gift',
    nameUk: 'Подарунок',
    icon: 'gift',
    color: '#9D4EDD',
    type: 'income',
    order: 3,
    isDefault: true,
  },
  {
    id: 'sale',
    name: 'Sale',
    nameUk: 'Продаж',
    icon: 'tag',
    color: '#FFD700',
    type: 'income',
    order: 4,
    isDefault: true,
  },
  {
    id: 'refund',
    name: 'Refund',
    nameUk: 'Повернення',
    icon: 'rotate-ccw',
    color: '#FF6B00',
    type: 'income',
    order: 5,
    isDefault: true,
  },
  {
    id: 'bonus',
    name: 'Bonus',
    nameUk: 'Бонус',
    icon: 'star',
    color: '#FFD700',
    type: 'income',
    order: 6,
    isDefault: true,
  },
  {
    id: 'dividend',
    name: 'Dividend',
    nameUk: 'Дивіденди',
    icon: 'trending-up',
    color: '#00AAFF',
    type: 'income',
    order: 7,
    isDefault: true,
  },
  {
    id: 'cashback',
    name: 'Cashback',
    nameUk: 'Кешбек',
    icon: 'badge-percent',
    color: '#00FF88',
    type: 'income',
    order: 8,
    isDefault: true,
  },
  {
    id: 'investment_income',
    name: 'Investment Income',
    nameUk: 'Інвестиційний дохід',
    icon: 'bar-chart-3',
    color: '#9D4EDD',
    type: 'income',
    order: 9,
    isDefault: true,
  },
  {
    id: 'other_income',
    name: 'Other Income',
    nameUk: 'Інший дохід',
    icon: 'circle-plus',
    color: '#A0A0C0',
    type: 'income',
    order: 10,
    isDefault: true,
  },

  // ══ Expense Categories ═══════════════════════════════════════
  {
    id: 'food',
    name: 'Food',
    nameUk: 'Їжа',
    icon: 'utensils',
    color: '#FF6B00',
    type: 'expense',
    order: 1,
    isDefault: true,
  },
  {
    id: 'transport',
    name: 'Transport',
    nameUk: 'Транспорт',
    icon: 'car',
    color: '#00AAFF',
    type: 'expense',
    order: 2,
    isDefault: true,
  },
  {
    id: 'housing',
    name: 'Housing',
    nameUk: 'Житло',
    icon: 'home',
    color: '#0070D1',
    type: 'expense',
    order: 3,
    isDefault: true,
  },
  {
    id: 'utilities',
    name: 'Utilities',
    nameUk: 'Комунальні',
    icon: 'zap',
    color: '#FFD700',
    type: 'expense',
    order: 4,
    isDefault: true,
  },
  {
    id: 'health',
    name: 'Health',
    nameUk: 'Здоров\'я',
    icon: 'heart-pulse',
    color: '#FF3B3B',
    type: 'expense',
    order: 5,
    isDefault: true,
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    nameUk: 'Розваги',
    icon: 'gamepad-2',
    color: '#9D4EDD',
    type: 'expense',
    order: 6,
    isDefault: true,
  },
  {
    id: 'shopping',
    name: 'Shopping',
    nameUk: 'Покупки',
    icon: 'shopping-bag',
    color: '#FF6B00',
    type: 'expense',
    order: 7,
    isDefault: true,
  },
  {
    id: 'education',
    name: 'Education',
    nameUk: 'Освіта',
    icon: 'graduation-cap',
    color: '#00AAFF',
    type: 'expense',
    order: 8,
    isDefault: true,
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    nameUk: 'Підписки',
    icon: 'repeat',
    color: '#0070D1',
    type: 'expense',
    order: 9,
    isDefault: true,
  },
  {
    id: 'savings',
    name: 'Savings',
    nameUk: 'Заощадження',
    icon: 'piggy-bank',
    color: '#00FF88',
    type: 'expense',
    order: 10,
    isDefault: true,
  },
  {
    id: 'emergency',
    name: 'Emergency',
    nameUk: 'Непередбачуване',
    icon: 'alert-triangle',
    color: '#FF3B3B',
    type: 'expense',
    order: 11,
    isDefault: true,
  },
  {
    id: 'planned',
    name: 'Planned',
    nameUk: 'Заплановане',
    icon: 'calendar',
    color: '#A0A0C0',
    type: 'expense',
    order: 12,
    isDefault: true,
  },
  {
    id: 'clothing',
    name: 'Clothing',
    nameUk: 'Одяг',
    icon: 'shirt',
    color: '#9D4EDD',
    type: 'expense',
    order: 13,
    isDefault: true,
  },
  {
    id: 'gifts_given',
    name: 'Gifts Given',
    nameUk: 'Подарунки',
    icon: 'gift',
    color: '#FF6B00',
    type: 'expense',
    order: 14,
    isDefault: true,
  },
  {
    id: 'debt',
    name: 'Debt',
    nameUk: 'Борги',
    icon: 'credit-card',
    color: '#FF3B3B',
    type: 'expense',
    order: 15,
    isDefault: true,
  },
  {
    id: 'travel',
    name: 'Travel',
    nameUk: 'Подорожі',
    icon: 'plane',
    color: '#00AAFF',
    type: 'expense',
    order: 16,
    isDefault: true,
  },
  {
    id: 'pets',
    name: 'Pets',
    nameUk: 'Тварини',
    icon: 'paw-print',
    color: '#FFD700',
    type: 'expense',
    order: 17,
    isDefault: true,
  },
  {
    id: 'other_expense',
    name: 'Other Expense',
    nameUk: 'Інші витрати',
    icon: 'circle-minus',
    color: '#A0A0C0',
    type: 'expense',
    order: 18,
    isDefault: true,
  },
];

// ── Utility: Get category by ID ────────────────────────────────
export function getCategoryById(id: string): TransactionCategory | undefined {
  return categories.find((c) => c.id === id);
}

// ── Utility: Get categories by type ────────────────────────────
export function getCategoriesByType(
  type: TransactionType,
): ReadonlyArray<TransactionCategory> {
  return categories.filter((c) => c.type === type);
}

// ── Utility: Get income categories ─────────────────────────────
export function getIncomeCategories(): ReadonlyArray<TransactionCategory> {
  return getCategoriesByType('income');
}

// ── Utility: Get expense categories ────────────────────────────
export function getExpenseCategories(): ReadonlyArray<TransactionCategory> {
  return getCategoriesByType('expense');
}

// ── Category type labels ───────────────────────────────────────
export const transactionTypeLabels: Record<TransactionType, string> = {
  income: 'Дохід',
  expense: 'Витрата',
};
