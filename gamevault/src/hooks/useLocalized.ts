/**
 * SaveState — useLocalized Hook
 *
 * Wraps i18next for translation, language switching,
 * and localized date formatting. Supports 'uk' and 'en'.
 */

import { useCallback } from 'react';

// ── Language type ───────────────────────────────────────────────
type SupportedLanguage = 'uk' | 'en';

// ── Translation function type ───────────────────────────────────
type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
) => string;

// ── Locale date formats ─────────────────────────────────────────
const localeMap: Record<SupportedLanguage, string> = {
  uk: 'uk-UA',
  en: 'en-US',
};

const localeDateOptions: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

// ── Fallback translations (minimal set for offline) ─────────────
const fallbackTranslations: Record<string, Record<string, string>> = {
  uk: {
    'common.save': 'Зберегти',
    'common.cancel': 'Скасувати',
    'common.delete': 'Видалити',
    'common.confirm': 'Підтвердити',
    'common.loading': 'Завантаження...',
    'common.error': 'Помилка',
    'common.success': 'Успішно',
    'common.back': 'Назад',
    'common.next': 'Далі',
  },
  en: {
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.back': 'Back',
    'common.next': 'Next',
  },
};

// ── Hook return type ────────────────────────────────────────────
interface UseLocalizedReturn {
  t: TranslateFn;
  changeLanguage: (lang: SupportedLanguage) => void;
  currentLanguage: SupportedLanguage;
  formatDateLocalized: (date: Date) => string;
}

// ── Cached i18next instance (lazy-loaded) ───────────────────────
let i18nInstance: any = null;
let _currentLang: SupportedLanguage = 'uk';

async function getI18n() {
  if (i18nInstance) return i18nInstance;
  try {
    const i18next = require('i18next');
    const init = require('react-i18next').initReactI18next;

    const uk = require('@/locales/uk.json');
    const en = require('@/locales/en.json');

    i18next.default.use(init.default).init({
      resources: {
        uk: { translation: uk.default ?? uk },
        en: { translation: en.default ?? en },
      },
      lng: _currentLang,
      fallbackLng: 'uk',
      interpolation: { escapeValue: false },
    });

    i18nInstance = i18next.default;
    return i18nInstance;
  } catch {
    return null;
  }
}

export function useLocalized(initialLang: SupportedLanguage = 'uk'): UseLocalizedReturn {
  _currentLang = initialLang;

  const t: TranslateFn = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const fallback = fallbackTranslations[_currentLang]?.[key];
      if (i18nInstance) {
        const translated = i18nInstance.t(key, params);
        return translated === key && fallback ? fallback : translated;
      }
      return fallback ?? key;
    },
    [],
  );

  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    _currentLang = lang;
    const instance = await getI18n();
    if (instance) {
      instance.changeLanguage(lang);
    }
  }, []);

  const formatDateLocalized = useCallback((date: Date): string => {
    const locale = localeMap[_currentLang] ?? 'uk-UA';
    return new Intl.DateTimeFormat(locale, localeDateOptions).format(date);
  }, []);

  return {
    t,
    changeLanguage,
    currentLanguage: _currentLang,
    formatDateLocalized,
  };
}
