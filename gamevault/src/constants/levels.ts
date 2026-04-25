/**
 * SaveState Design System — Level Definitions
 *
 * 50 levels for the gamified savings progression system.
 * Formula: levelUpXP = 100 * level * (level + 1) / 2
 * All titles are in Ukrainian.
 */

// ── Level Definition ───────────────────────────────────────────
export interface LevelDefinition {
  /** Level number (1–50) */
  level: number;
  /** Ukrainian title */
  title: string;
  /** Total XP required to reach this level */
  requiredXP: number;
  /** XP needed to go from previous level to this one */
  levelUpXP: number;
  /** Ukrainian description of what this level unlocks */
  unlockDescription: string;
  /** Icon name from the icon set */
  iconName: string;
  /** Rarity tier */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

// ── XP Formula ─────────────────────────────────────────────────
function calcLevelUpXP(level: number): number {
  return Math.floor((100 * level * (level + 1)) / 2);
}

function calcRequiredXP(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += calcLevelUpXP(i);
  }
  return total;
}

function getRarity(level: number): LevelDefinition['rarity'] {
  if (level <= 10) return 'common';
  if (level <= 20) return 'uncommon';
  if (level <= 30) return 'rare';
  if (level <= 40) return 'epic';
  if (level <= 48) return 'legendary';
  return 'mythic';
}

// ── Level Titles (Ukrainian) ───────────────────────────────────
const levelTitles: Array<{ title: string; iconName: string; unlock: string }> = [
  // 1-10: Common
  { title: 'Новачок', iconName: 'sprout', unlock: 'Розблоковано: основний інтерфейс' },
  { title: 'Учень', iconName: 'book-open', unlock: 'Розблоковано: щоденні квести' },
  { title: 'Розвідник', iconName: 'compass', unlock: 'Розблоковано: категорії транзакцій' },
  { title: 'Воїн', iconName: 'shield', unlock: 'Розблоковано: налаштування безпеки' },
  { title: 'Збирач', iconName: 'coins', unlock: 'Розблоковано: перші монети за квести' },
  { title: 'Геймер', iconName: 'gamepad-2', unlock: 'Розблоковано: міні-ігри' },
  { title: 'Стратег', iconName: 'brain', unlock: 'Розблоковано: бюджетні шаблони' },
  { title: 'Майстер', iconName: 'award', unlock: 'Розблоковано: кастомні категорії' },
  { title: 'Експерт', iconName: 'trophy', unlock: 'Розблоковано: аналітика за місяць' },
  { title: 'Чемпіон', iconName: 'crown', unlock: 'Розблоковано: титульний бейдж' },

  // 11-20: Uncommon
  { title: 'Хранитель', iconName: 'shield-check', unlock: 'Розблоковано: автозбереження' },
  { title: 'Піонер', iconName: 'flag', unlock: 'Розблоковано: щотижневі квести' },
  { title: 'Фінансист', iconName: 'trending-up', unlock: 'Розблоковано: інвестиційний трекер' },
  { title: 'Алхімік', iconName: 'flask-conical', unlock: 'Розблоковано: конвертація монет' },
  { title: 'Рыцар', iconName: 'swords', unlock: 'Розблоковано: рейтингову таблицю' },
  { title: 'Маг', iconName: 'wand-sparkles', unlock: 'Розблоковано: преміум іконки' },
  { title: 'Навігатор', iconName: 'map', unlock: 'Розблоковано: фінансову карту' },
  { title: 'Інженер', iconName: 'wrench', unlock: 'Розблоковано: розширені налаштування' },
  { title: 'Архітектор', iconName: 'building', unlock: 'Розблоковано: шаблони цілей' },
  { title: 'Легенда', iconName: 'star', unlock: 'Розблоковано: ексклюзивний фон' },

  // 21-30: Rare
  { title: 'Скарбничник', iconName: 'piggy-bank', unlock: 'Розблоковано: бонус за серію' },
  { title: 'Таємниця', iconName: 'eye-off', unlock: 'Розблоковано: приховані категорії' },
  { title: 'Скарбошукач', iconName: 'gem', unlock: 'Розблоковано: квест-руїни' },
  { title: 'Мудрець', iconName: 'scroll', unlock: 'Розблоковано: розширені поради' },
  { title: 'Захисник', iconName: 'castle', unlock: 'Розблоковано: фінансовий щит' },
  { title: 'Штурман', iconName: 'anchor', unlock: 'Розблоковано: портове з\'єднання' },
  { title: 'Реформатор', iconName: 'refresh-cw', unlock: 'Розблоковано: фінансовий перезапуск' },
  { title: 'Інвестор', iconName: 'bar-chart-3', unlock: 'Розблоковано: річну аналітику' },
  { title: 'Дипломат', iconName: 'handshake', unlock: 'Розблоковано: спільні цілі' },
  { title: 'Командир', iconName: 'users', unlock: 'Розблоковано: групові виклики' },

  // 31-40: Epic
  { title: 'Архонт', iconName: 'landmark', unlock: 'Розблоковано: архонтські бонуси' },
  { title: 'Провидець', iconName: 'eye', unlock: 'Розблоковано: прогноз витрат' },
  { title: 'Титан', iconName: 'mountain', unlock: 'Розблоковано: міфічні нагороди' },
  { title: 'Візіонер', iconName: 'telescope', unlock: 'Розблоковано: довгострокові цілі' },
  { title: 'Архімаг', iconName: 'hat-wizard', unlock: 'Розблоковано: магію складних відсотків' },
  { title: 'Фенікс', iconName: 'flame', unlock: 'Розблоковано: відродження цілі' },
  { title: 'Скелет', iconName: 'skull', unlock: 'Розблоковано: екстремальний режим' },
  { title: 'Лорд', iconName: 'chess-king', unlock: 'Розблоковано: стратегічну дошку' },
  { title: 'Архіваріус', iconName: 'library', unlock: 'Розблоковано: архів фінансів' },
  { title: 'Величний', iconName: 'sparkles', unlock: 'Розблоковано: величне оновлення' },

  // 41-50: Legendary & Mythic
  { title: 'Дракон', iconName: 'dragon', unlock: 'Розблоковано: драконячі бонуси' },
  { title: 'Космонавт', iconName: 'rocket', unlock: 'Розблоковано: космічну тему' },
  { title: 'Багатир', iconName: 'sunset', unlock: 'Розблоковано: багатирські сили' },
  { title: 'Аватар', iconName: 'zap', unlock: 'Розблоковано: аватарний режим' },
  { title: 'Олімпієць', iconName: 'medal', unlock: 'Розблоковано: олімпійські нагороди' },
  { title: 'Геній', iconName: 'lightbulb', unlock: 'Розблоковано: геніальні поради' },
  { title: 'Творець', iconName: 'palette', unlock: 'Розблоковано: власні теми' },
  { title: 'Абсолют', iconName: 'infinity', unlock: 'Розблоковано: безмежні можливості' },
  { title: 'Магістр', iconName: 'graduation-cap', unlock: 'Розблоковано: фінальну главу' },
  { title: 'Бог Накопичення', iconName: 'sun', unlock: 'Розблоковано: все. Ви — легенда.' },
];

// ── Generate All 50 Levels ─────────────────────────────────────
export const levels: ReadonlyArray<LevelDefinition> = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  const meta = levelTitles[i];
  const levelUpXP = calcLevelUpXP(level);
  const requiredXP = calcRequiredXP(level);

  return {
    level,
    title: meta.title,
    requiredXP,
    levelUpXP,
    unlockDescription: meta.unlock,
    iconName: meta.iconName,
    rarity: getRarity(level),
  };
});

// ── Utility: find level by total XP ────────────────────────────
export function getLevelForXP(totalXP: number): LevelDefinition {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i].requiredXP) {
      return levels[i];
    }
  }
  return levels[0];
}

// ── Utility: XP progress to next level ─────────────────────────
export function getXPProgress(
  totalXP: number,
): { currentLevel: LevelDefinition; nextLevel: LevelDefinition | null; progress: number; xpInCurrentLevel: number; xpNeeded: number } {
  const currentLevel = getLevelForXP(totalXP);
  const nextLevel = currentLevel.level < 50 ? levels[currentLevel.level] : null;
  const xpInCurrentLevel = totalXP - currentLevel.requiredXP;
  const xpNeeded = nextLevel ? nextLevel.levelUpXP : currentLevel.levelUpXP;
  const progress = nextLevel ? Math.min(xpInCurrentLevel / xpNeeded, 1) : 1;

  return {
    currentLevel,
    nextLevel,
    progress,
    xpInCurrentLevel,
    xpNeeded,
  };
}

// ── Rarity Colors (for display) ────────────────────────────────
export const rarityColors: Record<LevelDefinition['rarity'], string> = {
  common: '#A0A0C0',
  uncommon: '#00AAFF',
  rare: '#9D4EDD',
  epic: '#FF6B00',
  legendary: '#FFD700',
  mythic: '#FF3B3B',
};

export const rarityLabels: Record<LevelDefinition['rarity'], string> = {
  common: 'Звичайний',
  uncommon: 'Незвичайний',
  rare: 'Рідкісний',
  epic: 'Епічний',
  legendary: 'Легендарний',
  mythic: 'Міфічний',
};
