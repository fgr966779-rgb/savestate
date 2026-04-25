/**
 * SaveState — Validators
 *
 * Zod-based validation schemas for all form inputs:
 * deposits, withdrawals, nicknames, email, passwords, goals,
 * recurring plans, and debts.
 */

import { z } from 'zod';

// ── Category enum derived from existing categories ──────────────
const depositCategories = [
  'salary',
  'freelance',
  'gift',
  'sale',
  'refund',
  'bonus',
  'dividend',
  'cashback',
  'investment_income',
  'other_income',
] as const;

const withdrawalReasons = ['emergency', 'planned', 'other'] as const;

const planFrequencies = ['daily', 'weekly', 'biweekly', 'monthly'] as const;

// ── Deposit Schema ──────────────────────────────────────────────
export const depositSchema = z
  .object({
    amount: z
      .number({ invalid_type_error: 'Введіть суму' })
      .min(1, 'Мінімальна сума — 1 ₴')
      .max(1_000_000, 'Максимальна сума — 1 000 000 ₴'),
    category: z.enum(depositCategories, {
      required_error: 'Оберіть категорію',
    }),
    note: z
      .string()
      .max(200, 'Нотатка не може перевищувати 200 символів')
      .optional(),
  })
  .strict();

export type DepositInput = z.infer<typeof depositSchema>;

// ── Dynamic deposit schema with goal target ─────────────────────
export function createDepositSchema(goalTarget: number) {
  return depositSchema.extend({
    amount: z
      .number({ invalid_type_error: 'Введіть суму' })
      .min(1, 'Мінімальна сума — 1 ₴')
      .max(goalTarget, `Максимальна сума — ${goalTarget} ₴`),
  });
}

// ── Withdrawal Schema ───────────────────────────────────────────
export const withdrawalSchema = z
  .object({
    amount: z
      .number({ invalid_type_error: 'Введіть суму' })
      .min(1, 'Мінімальна сума — 1 ₴'),
    reason: z.enum(withdrawalReasons, {
      required_error: 'Оберіть причину',
    }),
  })
  .strict();

export type WithdrawalInput = z.infer<typeof withdrawalSchema>;

export function createWithdrawalSchema(balance: number) {
  return withdrawalSchema.extend({
    amount: z
      .number({ invalid_type_error: 'Введіть суму' })
      .min(1, 'Мінімальна сума — 1 ₴')
      .max(balance, `Недостатньо коштів. Баланс — ${balance} ₴`),
  });
}

// ── Nickname Schema ─────────────────────────────────────────────
export const nicknameSchema = z
  .string()
  .min(3, 'Нікнейм має містити мінімум 3 символи')
  .max(20, 'Нікнейм має містити максимум 20 символів')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Дозволені лише латинські літери, цифри та підкреслення',
  );

// ── Email Schema ────────────────────────────────────────────────
export const emailSchema = z
  .string()
  .min(1, 'Email обов\'язковий')
  .email('Введіть коректну email адресу');

// ── Password Schema ─────────────────────────────────────────────
export const passwordSchema = z
  .string()
  .min(8, 'Пароль має містити мінімум 8 символів')
  .regex(
    /(?=.*[A-Z])/,
    'Пароль має містити мінімум одну велику літеру',
  )
  .regex(
    /(?=.*\d)/,
    'Пароль має містити мінімум одну цифру',
  );

// ── Goal Amount Schema ──────────────────────────────────────────
export const goalAmountSchema = z
  .number({ invalid_type_error: 'Введіть суму цілі' })
  .min(100, 'Мінімальна ціль — 100 ₴')
  .max(1_000_000, 'Максимальна ціль — 1 000 000 ₴');

// ── Recurring Plan Schema ───────────────────────────────────────
export const recurringPlanSchema = z
  .object({
    frequency: z.enum(planFrequencies, {
      required_error: 'Оберіть частоту',
    }),
    amount: z
      .number({ invalid_type_error: 'Введіть суму' })
      .min(1, 'Мінімальна сума — 1 ₴')
      .max(1_000_000, 'Максимальна сума — 1 000 000 ₴'),
    dayOfWeek: z
      .number()
      .int()
      .min(0, 'День тижня: 0 (неділя) — 6 (субота)')
      .max(6, 'День тижня: 0 (неділя) — 6 (субота)')
      .optional(),
    time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'Час має бути у форматі HH:MM (напр. 09:30)',
      )
      .default('09:00'),
  })
  .strict();

export type RecurringPlanInput = z.infer<typeof recurringPlanSchema>;

// ── Debt Schema ─────────────────────────────────────────────────
export const debtSchema = z
  .object({
    creditor: z
      .string()
      .min(1, 'Вкажіть кредитора')
      .max(100, 'Ім\'я кредитора занадто довге'),
    amount: z
      .number({ invalid_type_error: 'Введіть суму боргу' })
      .min(1, 'Сума має бути більшою за 0')
      .max(1_000_000, 'Максимальна сума — 1 000 000 ₴'),
    dueDate: z
      .string()
      .datetime({ message: 'Некоректна дата' })
      .optional(),
    note: z
      .string()
      .max(500, 'Нотатка не може перевищувати 500 символів')
      .optional(),
  })
  .strict();

export type DebtInput = z.infer<typeof debtSchema>;

// ── Validation Helper ───────────────────────────────────────────
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data);
}
