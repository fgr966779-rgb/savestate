<p align="center">
  <strong>🎮 SAVESTATE</strong><br/>
  Гейміфікована скарбничка для накопичення на PS5 та ігровий монітор
</p>

---

## 📋 Зміст

- [Про проєкт](#-про-проєкт)
- [Функціонал](#-функціонал)
- [Технологічний стек](#-технологічний-стек)
- [Структура проєкту](#-структура-проєкту)
- [Початок роботи](#-початок-роботи)
- [Архітектура](#-архітектура)
- [Design System](#-design-system)
- [Внесок у проєкт](#-внесок-у-проєкт)
- [Ліцензія](#-ліцензія)

---

## 🎯 Про проєкт

**SaveState** — це мобільний додаток для iOS та Android, який перетворює нудний процес заощаджень на захопливу RPG-гру. Накопичуйте на PlayStation 5, ігровий монітор або будь-яку іншу мрію — заробляйте XP, підвищуйте рівень (50 рівнів!), виконуйте щоденні квести, збирайте досягнення та змагайтеся з друзями.

Додаток працює **offline-first** — всі дані зберігаються локально через WatermelonDB і автоматично синхронізуються з Supabase при наявності інтернету.

### Мотивація

Традиційні додатки для заощаджень нудні. SaveState використовує перевірені гейміфікаційні механіки — стріки, квести, лідерборд, колесо фортуни — щоб перетворити фінансову дисципліну на звичку, яку хочеться підтримувати щодня.

---

## ✨ Функціонал

### 🎮 Гейміфікація

| Механіка | Опис |
|---|---|
| **50 рівнів** | Прогресія від «Новачка» до «Легенди» з унікальними нагородами на кожному рівні |
| **XP система** | Заробляйте досвід за кожну транзакцію, виконаний квест, підтримання стріку |
| **Щоденні квести** | Автоматично згенеровані завдання: «Збережи 50 грн», «Не витрачай на каву», «Внеси депозит» |
| **Досягнення** | 20+ унікальних бейджів за фінансові та активні досягнення |
| **Стріки (streaks)** | Щоденний вхід та виконання квестів підтримує серію — не втрать її! |
| **Колесо фортуни** | Щотижневий спін з бонусами: подвійний XP, знижка цілі, ваучери |
| **XP Shop** | Витрачайте накопичений XP на косметичні та функціональні бонуси |
| **Story Mode** | Ігровий сюжет, що розкривається по мірі досягнення фінансових цілей |

### 💰 Фінансовий трекер

- **Цілі заощаджень** — створюйте кілька цілей із кастомним зображенням, цільовою сумою та дедлайном
- **Транзакції** — поповнення, зняття, перекази між цілями з категоризацією
- **Рекурентні плани** — автоматичні щотижневі/щомісячні внески з нагадуваннями
- **Debt трекер** — відстеження боргів та кредитів з графіком погашення
- **Budget Manager** — встановлення лімітів на категорії витрат
- **Emergency Fund** — окрема ціль для екстреного фонду

### 📊 Аналітика та статистика

- **Інтерактивні графіки** (Victory Native XL) — динаміка заощаджень, витрат, прогресу
- **Прогнозування** — розрахунок дати досягнення цілі на основі поточного темпу
- **Pattern Analysis** — виявлення шаблонів витрат та поради від AI-Coach
- **Звіти** — щотижневі та щомісячні автоматичні звіти з можливістю експорту
- **Фінансовий калькулятор** — розрахунок відсотків, інфляції, складних депозитів

### 🏆 Соціальні функції

- **Лідерборд** — рейтинг друзів за XP, стріками, сумою заощаджень
- **PvP виклики** — кидайте виклик другу: «Хто збере більше за тиждень?»
- **Профілі друзів** — перегляд прогресу та досягнень інших гравців
- **Спільні цілі** — накопичуйте разом на спільну мрію

### 📱 Технічні особливості

- **Offline-first** — WatermelonDB як локальна БД, повна робота без інтернету
- **Синхронізація** — двосторонній sync з Supabase через SyncAdapter
- **Біометрія** — захист додатку через Face ID / FingerPrint
- **Haptic Feedback** — тактильний відгук на кожну дію
- **Локалізація** — українська та англійська мови (i18next)
- **Push-сповіщення** — нагадування про квести, стріки, рекурентні внески

---

## 🛠 Технологічний стек

### Core

| Технологія | Версія | Призначення |
|---|---|---|
| **Expo SDK** | 52+ | Фреймворк React Native |
| **React Native** | 0.76+ | Мобільна розробка |
| **TypeScript** | 5.5+ (strict) | Типізація |
| **Expo Router** | 4.0+ | File-based навігація |

### State & Data

| Технологія | Призначення |
|---|---|
| **Zustand 5** + Immer | Глобальний state management |
| **WatermelonDB 0.27** | Локальна реактивна БД (offline-first) |
| **Supabase** | Backend-as-a-Service (Auth, DB, Storage, Edge Functions) |
| **MMKV** | Швидке key-value сховище |

### UI & Animation

| Технологія | Призначення |
|---|---|
| **React Native Reanimated 3.17** | Продуктивні анімації на UI-потоці |
| **Lottie 7.2** | Складні векторні анімації (celebration, level-up) |
| **@shopify/react-native-skia 1.5** | 2D-графіка (кастомні індикатори, particles) |
| **Victory Native 41** | Інтерактивні графіки та діаграми |
| **@gorhom/bottom-sheet 5.1** | Bottom sheets та модальні вікна |
| **expo-haptics** | Тактильний відгук |

### Інші

| Технологія | Призначення |
|---|---|
| **React Hook Form + Zod** | Валідація форм |
| **i18next** | Інтернаціоналізація |
| **date-fns** | Робота з датами |
| **Sentry** | Моніторинг помилок |
| **PostHog** | Аналітика подій |
| **Detox** | E2E тестування |
| **Jest + Testing Library** | Unit/інтеграційні тести |

---

## 📁 Структура проєкту

```
savestate/
├── app/                          # Expo Router — file-based навігація
│   ├── (auth)/                   # Auth flow (splash, welcome, account-setup)
│   ├── (tabs)/                   # Основні таби
│   │   ├── home/                 # Головний екран (дашборд, прогрес цілей)
│   │   ├── vault/                # Скарбничка (депозити, зняття, історія, рекурентні)
│   │   ├── quests/               # Квести, досягнення, стріки, лідерборд, колесо
│   │   ├── stats/                # Аналітика, графіки, звіти, прогнози
│   │   └── profile/              # Профіль, налаштування, цілі, сповіщення
│   ├── (money)/                  # Грошові інструменти (бюджет, борги, підписки...)
│   └── (debt)/                   # Управління боргами
├── src/
│   ├── components/
│   │   ├── shared/               # Спільні компоненти (картки, бейджі, анімації)
│   │   ├── ui/                   # Базові UI-компоненти (Button, Card, Modal...)
│   │   └── layout/               # Layout-компоненти (HeaderBar, ScreenLayout, TabBar)
│   ├── stores/                   # Zustand stores (auth, savings, quest, settings)
│   ├── db/
│   │   ├── models/               # WatermelonDB моделі (User, Goal, Transaction, Quest...)
│   │   ├── sync/                 # SyncAdapter, syncQueue
│   │   ├── migrations/           # Міграції БД
│   └── schema.ts                 # WatermelonDB схема
│   ├── services/                 # Сервіси (Supabase, haptics, notifications, AI coach)
│   ├── hooks/                    # Кастомні хуки (useTheme, useBiometric, useDebounce...)
│   ├── constants/                # Конфігурація (theme, colors, levels, animations, haptics)
│   ├── utils/                    # Утиліти (formatters, validators, calculations, dateHelpers)
│   └── locales/                  # Локалізація (uk.json, en.json)
├── supabase/
│   ├── config.toml               # Конфігурація Supabase
│   ├── migrations/               # SQL-міграції (users, goals, transactions, quests...)
│   └── functions/                # Edge Functions (ai-coach, push-notification, currency-converter)
├── eas.json                      # EAS Build конфігурація (dev / preview / production)
├── tsconfig.json                 # TypeScript (strict mode, path aliases)
├── jest.config.js                # Jest конфігурація
├── detox.config.js               # E2E тестування конфігурація
└── package.json
```

---

## 🚀 Початок роботи

### Prerequisites

- **Node.js** 20+ (рекомендується через [nvm](https://github.com/nvm-sh/nvm) або [fnm](https://fnm.vercel.app/))
- **npm** 10+ (або yarn / pnpm)
- **Expo CLI** — встановлюється глобально:
  ```bash
  npm install -g expo-cli
  ```
- **EAS CLI** — для білдів:
  ```bash
  npm install -g eas-cli
  ```
- **Android Studio** (для Android) або **Xcode 15+** (для iOS)
- **Supabase проект** — [створіть безкоштовний проект](https://supabase.com/dashboard)

### Installation

```bash
# Клонуємо репозиторій
git clone https://github.com/your-username/SaveState.git
cd SaveState

# Встановлюємо залежності
npm install

# (Опціонально) Генеруємо нативні файли для локальних білдів
npx expo prebuild
```

### Environment Variables

Створіть файл `.env` у корені проєкту (на основі `eas.json` профілів):

```env
# === Обов'язкові ===
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# === Опціональні ===
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_API_URL=https://dev-api.SaveState.app

# Моніторинг
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_POSTHOG_KEY=
```

> **⚠️ Ніколи не комітьте `.env` файл!** Додайте `.env` до `.gitignore`.

### Running

```bash
# Запуск dev-сервера з Expo Go
npx expo start

# Запуск на конкретній платформі
npx expo start --android
npx expo start --ios

# Запуск у веб-браузері
npx expo start --web

# Чіткий кеш та перезапуск
npx expo start --clear
```

### Building

```bash
# Android development build (APK)
eas build --platform android --profile development

# Android preview build (AAB)
eas build --platform android --profile preview

# Android production build
eas build --platform android --profile production

# iOS build
eas build --platform ios --profile production
```

### Testing

```bash
# Unit та інтеграційні тести
npm test

# Перевірка типів
npm run typecheck

# Лінтинг
npm run lint

# E2E тести (потребує зібраного білду)
eas build --platform android --profile development
detox test --configuration android.emu.release
```

---

## 🏗 Архітектура

### Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                         UI Layer                             │
│   (Expo Router screens → React components)                  │
└──────────────────────┬───────────────────────────────────────┘
                       │ dispatch / setState
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    Zustand Stores (x4)                       │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────┐ ┌─────────┐  │
│  │ authStore   │ │ savingsStore │ │questStore│ │settings │  │
│  │ (сесія,     │ │ (цілі,       │ │ (квести, │ │ Store   │  │
│  │  профіль)   │ │  транзакції) │ │  XP,     │ │ (тема,  │  │
│  │             │ │              │ │  стріки) │ │  мова)  │  │
│  └─────────────┘ └──────────────┘ └──────────┘ └─────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ read / write
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    WatermelonDB                              │
│  (Локальна реактивна БД — працює offline)                   │
│  Моделі: User, Goal, Transaction, Quest, Achievement,       │
│          Streak, Setting                                     │
└──────────────────────┬───────────────────────────────────────┘
                       │ SyncAdapter (bidirectional)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────────┐  │
│  │ PostgreSQL   │ │ Auth        │ │ Edge Functions       │  │
│  │ (RLS)        │ │ (JWT)       │ │ (ai-coach, currency) │  │
│  └──────────────┘ └─────────────┘ └──────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### State Management

Проєкт використовує **4 Zustand stores** з Immer для immutable оновлень:

| Store | Відповідальність |
|---|---|
| **useAuthStore** | Стан автентифікації, профіль користувача, JWT токен |
| **useSavingsStore** | Цілі, транзакції, баланси, рекурентні плани |
| **useQuestStore** | Квести, XP, рівні, стріки, досягнення, лідерборд |
| **useSettingsStore** | Тема (dark/light), мова, сповіщення, haptic |

### Navigation

Навігація реалізована через **Expo Router** (file-based routing):

- **`(auth)/`** — Unauthenticated flow (splash → welcome → goal-selection → account-setup)
- **`(tabs)/`** — Основні таби з Bottom Navigation (Home, Vault, Quests, Stats, Profile)
- **`(money)/`** — Розширені фінансові інструменти (Stack navigation)
- **`(debt)/`** — Управління боргами (Stack navigation)

Кожен route має власний `_layout.tsx` з конфігурацією навігації та перехідними анімаціями.

### Path Aliases

TypeScript налаштований з path aliases для чистих імпортів:

```typescript
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { theme } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
```

---

## 🎨 Design System

SaveState використовує **темну gaming-тему** як основну з акцентами neon-кольорів:

- **Single source of truth** — `src/constants/theme.ts` містить всі токени дизайн-системи
- **Color system** — `src/constants/colors.ts` (primary, secondary, success, warning, error, gradients)
- **Typography** — `src/constants/typography.ts` (шрифтові стилі, розміри, ваги)
- **Spacing** — `src/constants/spacing.ts` (уніфікована система відступів: 4px grid)
- **Animations** — `src/constants/animations.ts` (пресети для Reanimated: spring configs, durations)
- **Haptics** — `src/constants/haptics.ts` (типи haptic feedback для різних дій)

### Дизайн-принципи

- 🌙 **Dark-first** — темна тема за замовчуванням (gaming естетика)
- ✨ **Neon glow** — акцентні елементи з neon-підсвіткою (box-shadow, gradients)
- 🎯 **Haptic-first** — кожна значуща дія супроводжується тактильним відгуком
- 🎬 **Animated transitions** — плавні переходи між екранами, micro-animations
- 📐 **4px grid** — всі розміри кратні 4px для консистентності

---

## 🤝 Внесок у проєкт

Ми вітаємо контрибуції! Будь ласка, дотримуйтесь наступних правил:

### Code Style

1. **TypeScript strict** — проєкт використовує `strict: true` з додатковими перевірками (`noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride`). Усі нові файли повинні бути повністю типізовані.
2. **Ніяких `any`** — використовуйте `unknown` або конкретні типи. Якщо `any` неминучий — додайте коментар `// eslint-disable-next-line @typescript-eslint/no-explicit-any` з поясненням.
3. **Ніяких hardcoded значень** — всі кольори, розміри, анімації, haptic-типи повинні бути визначені в `src/constants/`. Не використовуйте магічні числа.
4. **Іменування** — компоненти: `PascalCase`, файли: `PascalCase.tsx`, утиліти: `camelCase.ts`, константи: `camelCase.ts` або `SCREAMING_SNAKE_CASE` для enum-подібних значень.
5. **Path aliases** — використовуйте `@/` замість відносних шляхів:
   ```typescript
   // ✅ Добре
   import { theme } from '@/constants/theme';
   // ❌ Погано
   import { theme } from '../../constants/theme';
   ```

### Pull Request Process

1. Філіруйте гілку від `main` з назвою `feature/short-description` або `fix/short-description`
2. Переконайтеся, що `npm run typecheck` та `npm run lint` проходять без помилок
3. Додайте тести для нової функціональності
4. Оновіть документацію, якщо змінили API або додали новий функціонал
5. Опис PR має містити: опис змін, мотивацию, скріншоти (якщо змінили UI)

### Commit Convention

Використовуйте [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: додано колесо фортуни
fix: виправлено розрахунок XP за стріки
docs: оновлено README з новими env-змінними
refactor: переписано SyncAdapter на TypeScript generics
style: виправлено форматування в theme.ts
test: додано тести для questGenerator
chore: оновлено залежності
```

---

## 📄 Ліцензія

Даний проєкт поширюється на умовах ліцензії **MIT**.

```
MIT License

Copyright (c) 2026 SaveState

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Зроблено з 🎮 та ❤️ для геймерів, які мріють<br/>
  <strong>SaveState &copy; 2026</strong>
</p>
