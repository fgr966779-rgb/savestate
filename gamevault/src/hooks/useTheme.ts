/**
 * SaveState — useTheme Hook
 *
 * Wraps the theme context with settings store integration
 * for dark/light preference persistence.
 * Provides responsive breakpoint values for adaptive layouts.
 */

import { useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import {
  useTheme as useBaseContext,
  darkTheme,
  lightTheme,
  type SaveStateTheme,
  type ThemeMode,
} from '@/constants/theme';
import { useSettingsStore } from '@/stores/useSettingsStore';

// ── Responsive Breakpoints ──────────────────────────────────────
interface Breakpoints {
  /** Width threshold for compact layout */
  compact: number;
  /** Width threshold for medium layout */
  medium: number;
  /** Width threshold for expanded layout */
  expanded: number;
}

const breakpoints: Breakpoints = {
  compact: 360,
  medium: 414,
  expanded: 768,
};

// ── Responsive Values ───────────────────────────────────────────
interface ResponsiveInfo {
  width: number;
  height: number;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  isPortrait: boolean;
  breakpoints: Breakpoints;
}

// ── Hook Return Type ────────────────────────────────────────────
interface UseThemeReturn extends SaveStateTheme {
  isDark: boolean;
  mode: ThemeMode;
  toggleTheme: () => void;
  responsive: ResponsiveInfo;
}

// ── Store-aware hook ───────────────────────────────────────────
/**
 * useThemeWithStore reads theme from useSettingsStore (persisted via MMKV).
 * Calling toggleTheme updates the store → triggers re-render automatically.
 */
export function useThemeWithStore(): UseThemeReturn {
  // Subscribe to settings store — any theme change triggers re-render
  const theme = useSettingsStore((s) => s.theme);
  const updateTheme = useSettingsStore((s) => s.updateTheme);

  const dimensions = useMemo(() => Dimensions.get('window'), []);

  const isDark = theme === 'dark';
  const activeTheme = isDark ? darkTheme : lightTheme;

  const responsive: ResponsiveInfo = useMemo(() => {
    const { width, height } = dimensions;
    return {
      width,
      height,
      isCompact: width < breakpoints.compact,
      isMedium: width >= breakpoints.compact && width < breakpoints.expanded,
      isExpanded: width >= breakpoints.expanded,
      isPortrait: height >= width,
      breakpoints,
    };
  }, [dimensions]);

  const toggleTheme = useCallback(() => {
    updateTheme(isDark ? 'light' : 'dark');
  }, [isDark, updateTheme]);

  return {
    ...activeTheme,
    isDark,
    mode: activeTheme.mode,
    toggleTheme,
    responsive,
  };
}

/**
 * Convenience re-export. Components using ThemeProvider
 * can call `useTheme()` directly from `@/constants/theme`.
 *
 * For store-aware theming with toggle support, use `useThemeWithStore` instead.
 */
export function useTheme(): SaveStateTheme {
  return useBaseContext();
}

export { type Breakpoints, type ResponsiveInfo };
