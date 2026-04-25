/**
 * SaveState — Quest Generator
 *
 * Deterministic quest generation based on date seeds and user level.
 * Same inputs always produce identical output — no randomness required.
 */

import type { QuestTemplate, QuestDifficulty } from '@/constants/quests';

// ── Seeded PRNG (Mulberry32) ────────────────────────────────────
function createRNG(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function scaleReward(base: number, level: number): number {
  return Math.round(base * (1 + (level - 1) * 0.1));
}

function pickDifficulty(rng: () => number): QuestDifficulty {
  const r = rng();
  if (r < 0.45) return 'easy';
  if (r < 0.75) return 'medium';
  if (r < 0.93) return 'hard';
  return 'boss';
}

function makeQuest(
  id: string, type: QuestTemplate['type'], title: string, desc: string,
  target: number, xp: number, coin: number, icon: string,
  difficulty: QuestDifficulty, chapter?: number, chapterTitle?: string,
): QuestTemplate {
  return { id, type, title, description: desc, target, xpReward: xp, coinReward: coin, iconName: icon, difficulty, repeatable: false, chapter, chapterTitle };
}

// ── Daily Quests ────────────────────────────────────────────────
export function generateDailyQuests(date: string, userLevel: number): QuestTemplate[] {
  const rng = createRNG(dateHash(`daily_${date}`));
  const saveTarget = Math.max(50, userLevel * 30);
  const pool = [
    { id: 'first_step', t: 'Перший крок', d: 'Зробіть першу транзакцію дня', tgt: 1, xp: 25, c: 10, ic: 'footprints' },
    { id: 'precision', t: 'Точність', d: 'Запишіть 3 транзакції з точними сумами', tgt: 3, xp: 40, c: 20, ic: 'crosshair' },
    { id: 'discipline', t: 'Дисципліна', d: 'Не витрачайте з основного бюджету 6 годин поспіль', tgt: 6, xp: 60, c: 30, ic: 'timer' },
    { id: 'marathoner', t: 'Марафонець', d: `Збережіть понад ${saveTarget} ₴ за один день`, tgt: saveTarget, xp: 50, c: 25, ic: 'running' },
    { id: 'surprise', t: 'Сюрприз', d: 'Виконайте випадковий бонусний квест', tgt: 1, xp: 35, c: 50, ic: 'gift' },
  ];

  return pool.map((q) =>
    makeQuest(`${q.id}_${date}`, 'daily', q.t, q.d, q.tgt, scaleReward(q.xp, userLevel), scaleReward(q.c, userLevel), q.ic, pickDifficulty(rng)),
  );
}

// ── Weekly Quests ───────────────────────────────────────────────
export function generateWeeklyQuests(weekNumber: number, userLevel: number): QuestTemplate[] {
  const rng = createRNG(dateHash(`weekly_${weekNumber}`));
  const saveTarget = Math.max(300, userLevel * 100);
  const pool = [
    { id: 'warrior', t: 'Тижневий воїн', d: 'Виконайте всі щоденні квести протягом 5 днів', tgt: 5, xp: 300, c: 150, ic: 'swords' },
    { id: 'collector', t: 'Збирач', d: 'Додайте транзакції у 4 різні категорії за тиждень', tgt: 4, xp: 200, c: 100, ic: 'backpack' },
    { id: 'strategist', t: 'Стратег', d: 'Досягніть щотижневої мети заощаджень на 80%', tgt: 80, xp: 350, c: 200, ic: 'chess' },
    { id: 'saver', t: 'Економіст', d: `Збережіть ${saveTarget} ₴ за тиждень`, tgt: saveTarget, xp: 250, c: 120, ic: 'piggy-bank' },
    { id: 'explorer', t: 'Дослідник', d: 'Використайте нову категорію транзакцій', tgt: 1, xp: 180, c: 90, ic: 'compass' },
  ];

  const seen = new Set<string>();
  const selected: typeof pool = [];
  const offsets = [Math.floor(rng() * pool.length), Math.floor(rng() * pool.length), Math.floor(rng() * pool.length)];
  for (const off of offsets) {
    const q = pool[off];
    if (!seen.has(q.id)) {
      seen.add(q.id);
      selected.push(q);
    }
  }

  return selected.map((q) =>
    makeQuest(`${q.id}_w${weekNumber}`, 'weekly', q.t, q.d, q.tgt, scaleReward(q.xp, userLevel), scaleReward(q.c, userLevel), q.ic, pickDifficulty(rng)),
  );
}

// ── Story Quests ────────────────────────────────────────────────
const CHAPTERS: Record<number, string> = {
  1: 'Розділ 1: Початок шляху',
  2: 'Розділ 2: Битва за бюджет',
  3: 'Розділ 3: Мистецтво накопичення',
  4: 'Розділ 4: Стратегія фінансової фортеці',
  5: 'Розділ 5: Шлях до фінансової свободи',
};

const STORY_POOL = [
  { t: 'Перше знайомство', d: 'Завершіть реєстрацію та налаштуйте профіль', tgt: 1, xp: 50, c: 25, ic: 'user-plus' },
  { t: 'Перша запис', d: 'Додайте свою першу транзакцію', tgt: 1, xp: 30, c: 15, ic: 'pencil' },
  { t: 'Перші заощадження', d: 'Збережіть перші 500 ₴', tgt: 500, xp: 75, c: 40, ic: 'piggy-bank' },
  { t: 'Дослідник категорій', d: 'Створіть 3 категорії транзакцій', tgt: 3, xp: 40, c: 20, ic: 'folder-plus' },
  { t: 'Перша серія', d: 'Ведіть записи 3 дні поспіль', tgt: 3, xp: 60, c: 30, ic: 'flame' },
  { t: 'Перший квест', d: 'Виконайте 1 щоденний квест', tgt: 1, xp: 35, c: 15, ic: 'scroll' },
  { t: 'Фінансова мета', d: 'Створіть свою першу ціль заощаджень', tgt: 1, xp: 50, c: 25, ic: 'target' },
  { t: 'Перший тиждень', d: 'Зробіть 10 транзакцій за один тиждень', tgt: 10, xp: 80, c: 40, ic: 'calendar-check' },
  { t: 'Перше досягнення', d: 'Отримайте своє перше досягнення', tgt: 1, xp: 45, c: 50, ic: 'award' },
  { t: 'Новачок-воїн', d: 'Досягніть 2 рівня', tgt: 2, xp: 100, c: 60, ic: 'shield' },
];

export function generateStoryQuests(chapter: number): QuestTemplate[] {
  const rng = createRNG(dateHash(`story_ch${chapter}`));
  const chTitle = CHAPTERS[chapter] ?? `Розділ ${chapter}`;

  return STORY_POOL.map((q, i) =>
    makeQuest(
      `story_${chapter}_${String(i + 1).padStart(2, '0')}`, 'story', q.t, q.d,
      q.tgt, scaleReward(q.xp, chapter), scaleReward(q.c, chapter), q.ic, pickDifficulty(rng), chapter, chTitle,
    ),
  );
}

// ── Bonus Wheel Rewards ─────────────────────────────────────────
export interface WheelReward {
  id: string;
  label: string;
  type: 'xp' | 'coins' | 'streak_freeze' | 'xp_multiplier' | 'shield';
  value: number;
  color: string;
  probability: number;
}

export function generateBonusWheelRewards(): WheelReward[] {
  return [
    { id: 'xp_s', label: '+50 XP', type: 'xp', value: 50, color: '#00AAFF', probability: 0.25 },
    { id: 'xp_m', label: '+150 XP', type: 'xp', value: 150, color: '#0070D1', probability: 0.15 },
    { id: 'coin_s', label: '+25 монет', type: 'coins', value: 25, color: '#FFD700', probability: 0.20 },
    { id: 'coin_m', label: '+75 монет', type: 'coins', value: 75, color: '#FFA500', probability: 0.12 },
    { id: 'freeze', label: 'Заморозка серії', type: 'streak_freeze', value: 1, color: '#9D4EDD', probability: 0.10 },
    { id: 'x2xp', label: 'x2 XP (1 год)', type: 'xp_multiplier', value: 2, color: '#00FF88', probability: 0.08 },
    { id: 'shield', label: 'Щит від штрафу', type: 'shield', value: 1, color: '#FF6B00', probability: 0.05 },
    { id: 'xp_l', label: '+500 XP', type: 'xp', value: 500, color: '#FF3B3B', probability: 0.05 },
  ];
}
