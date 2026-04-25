/**
 * SaveState — useDebounce Hook
 *
 * Provides two debounce utilities:
 * 1. useDebounce — debounces a value change
 * 2. useDebouncedCallback — debounces a callback function
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ── useDebounce: Debounce value changes ────────────────────────
/**
 * Returns a debounced version of the provided value.
 * The returned value only updates after `delay` ms of inactivity.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ── useDebouncedCallback: Debounce a callback ──────────────────
/**
 * Returns a debounced version of the provided callback.
 * The callback is only invoked after `delay` ms of inactivity.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300)
 */
export function useDebouncedCallback<
  T extends (...args: any[]) => any,
>(callback: T, delay = 300): T {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always use the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const debouncedFn = useCallback(
    (...args: Parameters<T>): void => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  ) as T;

  return debouncedFn;
}
