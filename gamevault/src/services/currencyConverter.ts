/**
 * SaveState — Currency Converter Service
 *
 * Converts between currencies using a Supabase Edge Function or
 * cached exchange rates. Rates are cached for 1 hour to minimise
 * network calls and improve latency.
 */

import client from './supabase';

// ── Cache ───────────────────────────────────────────────────────
const CACHE_KEY = 'SaveState_currency_rates';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CachedRates {
  rates: Record<string, number>;
  fetchedAt: number;
}

let memoryCache: CachedRates | null = null;

// ── Supported Currencies ────────────────────────────────────────
const SUPPORTED_CURRENCIES = [
  'UAH', 'USD', 'EUR', 'GBP', 'PLN', 'CZK',
  'TRY', 'GEL', 'BTC', 'ETH',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function getSupportedCurrencies(): SupportedCurrency[] {
  return [...SUPPORTED_CURRENCIES];
}

// ── Get Rates ───────────────────────────────────────────────────
export async function getRates(): Promise<Record<string, number>> {
  try {
    // 1. Check memory cache
    if (memoryCache && Date.now() - memoryCache.fetchedAt < CACHE_TTL_MS) {
      return memoryCache.rates;
    }

    // 2. Fetch from Edge Function
    const { data, error } = await client.functions.invoke('currency-rates');

    if (error) {
      console.warn('[CurrencyConverter] Edge function failed, falling back to cache:', error.message);
      return memoryCache?.rates ?? getFallbackRates();
    }

    const rates = (data as Record<string, number>) ?? {};
    memoryCache = { rates, fetchedAt: Date.now() };

    // Persist to SecureStore for offline access
    try {
      const { default: SecureStore } = await import('expo-secure-store');
      await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(memoryCache));
    } catch {
      // Non-critical — memory cache is enough
    }

    return rates;
  } catch (error) {
    console.error('[CurrencyConverter] getRates failed:', error);
    return memoryCache?.rates ?? getFallbackRates();
  }
}

// ── Convert ─────────────────────────────────────────────────────
export async function convert(
  amount: number,
  from: string,
  to: string,
): Promise<number> {
  try {
    if (from === to) return amount;
    if (amount <= 0) return 0;

    // Crypto currencies go through the Edge Function for live rates
    const isCrypto = ['BTC', 'ETH'].includes(from) || ['BTC', 'ETH'].includes(to);

    if (isCrypto) {
      const { data, error } = await client.functions.invoke('currency-convert', {
        body: { amount, from, to },
      });
      if (error) throw error;
      return (data as { converted: number }).converted;
    }

    // Fiat — use cached rates
    const rates = await getRates();
    const rateFrom = rates[from];
    const rateTo = rates[to];

    if (!rateFrom || !rateTo) {
      console.warn(
        `[CurrencyConverter] Missing rate for ${from} or ${to}. Falling back to 1:1.`,
      );
      return amount;
    }

    // Convert: amount in `from` → base → `to`
    const baseAmount = amount / rateFrom;
    return Math.round(baseAmount * rateTo * 100) / 100; // 2 decimal places
  } catch (error) {
    console.error('[CurrencyConverter] convert failed:', error);
    return amount;
  }
}

// ── Fallback Rates (hardcoded UAH-centric) ─────────────────────
function getFallbackRates(): Record<string, number> {
  return {
    UAH: 1,
    USD: 0.024,
    EUR: 0.022,
    GBP: 0.019,
    PLN: 0.096,
    CZK: 0.56,
    TRY: 0.78,
    GEL: 0.065,
    BTC: 0.00000024,
    ETH: 0.0000058,
  };
}

// ── Restore Cache from Storage ──────────────────────────────────
export async function restoreCacheFromStorage(): Promise<void> {
  try {
    const { default: SecureStore } = await import('expo-secure-store');
    const raw = await SecureStore.getItemAsync(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CachedRates;
      if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
        memoryCache = parsed;
        console.log('[CurrencyConverter] Cache restored from storage.');
      }
    }
  } catch {
    // Non-critical
  }
}

// Auto-restore on module load
restoreCacheFromStorage();
