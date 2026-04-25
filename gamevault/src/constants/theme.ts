/**
 * SaveState Design System — Central Theme
 *
 * THE single source of truth for all design tokens.
 * Re-exports everything from colors, typography, spacing, animations, haptics.
 * Provides useTheme hook and createStyles helper for React Navigation + StyleSheet.
 */

import { createContext, useContext } from 'react';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// ── Re-export all token modules ────────────────────────────────
export { colors, lightColors, type ColorKeys, type LightColorKeys, type GradientTuple } from './colors';
export {
  fontFamilies,
  fontWeights,
  lineHeights,
  letterSpacing,
  fontSizes,
  typography,
  type FontFamilyKey,
  type FontWeightKey,
  type LineHeightKey,
  type LetterSpacingKey,
  type FontSizeKey,
  type FontSizeToken,
  type SemanticFontToken,
} from './typography';
export {
  spacing,
  semanticSpacing,
  radii,
  semanticRadii,
  shadows,
  borderWidths,
  applyShadow,
  type SpacingKey,
  type RadiusKey,
  type ShadowKey,
  type ShadowToken,
  type BorderWidthKey,
} from './spacing';
export {
  durations,
  easings,
  pageTransitions,
  stagger,
  keyframes,
  type DurationKey,
  type EasingKey,
  type EasingToken,
  type SpringConfig,
  type PageTransitionKey,
  type PageTransitionConfig,
  type KeyframeKey,
} from './animations';
export {
  hapticPatterns,
  triggerHaptic,
  triggerImpact,
  triggerNotification,
  triggerHapticSequence,
  type HapticPatternKey,
  type HapticPattern,
} from './haptics';

// ── Theme Mode ─────────────────────────────────────────────────
export type ThemeMode = 'dark' | 'light';

// ── Complete Theme Interface ───────────────────────────────────
export interface SaveStateTheme {
  /** Active color mode */
  mode: ThemeMode;
  /** Full color palette (dark or light) */
  colors: typeof colors;
  /** Typography tokens */
  typography: typeof typography;
  /** Font families */
  fontFamilies: typeof fontFamilies;
  /** Font weights */
  fontWeights: typeof fontWeights;
  /** Font sizes */
  fontSizes: typeof fontSizes;
  /** Spacing scale */
  spacing: typeof spacing;
  /** Semantic spacing aliases */
  semanticSpacing: typeof semanticSpacing;
  /** Border radii */
  radii: typeof radii;
  /** Semantic radii aliases */
  semanticRadii: typeof semanticRadii;
  /** Shadows */
  shadows: typeof shadows;
  /** Border widths */
  borderWidths: typeof borderWidths;
  /** Animation durations */
  durations: typeof durations;
  /** Animation easings */
  easings: typeof easings;
  /** Page transitions */
  pageTransitions: typeof pageTransitions;
  /** Stagger configs */
  stagger: typeof stagger;
  /** Keyframe presets */
  keyframes: typeof keyframes;
}

// ── Build theme object for a given mode ────────────────────────
function buildTheme(mode: ThemeMode): SaveStateTheme {
  const activeColors = mode === 'dark' ? colors : lightColors;

  return {
    mode,
    colors: activeColors as unknown as typeof colors,
    typography,
    fontFamilies,
    fontWeights,
    fontSizes,
    spacing,
    semanticSpacing,
    radii,
    semanticRadii,
    shadows,
    borderWidths,
    durations,
    easings,
    pageTransitions,
    stagger,
    keyframes,
  };
}

// ── Pre-built themes ───────────────────────────────────────────
export const darkTheme = buildTheme('dark');
export const lightTheme = buildTheme('light');

// ── Theme context ──────────────────────────────────────────────
export const ThemeContext = createContext<SaveStateTheme>(darkTheme);

// ── useTheme Hook ──────────────────────────────────────────────
/**
 * Access the current theme anywhere in the component tree.
 * Requires ThemeProvider to be an ancestor.
 */
export function useTheme(): SaveStateTheme {
  return useContext(ThemeContext);
}

// ── createStyles Helper ────────────────────────────────────────
type StylesRecord = Record<string, TextStyle | ViewStyle>;

/**
 * Type-safe style creation helper.
 *
 * @param getStyles - A function that receives the theme and returns a style record.
 * @returns A function that, when called with a theme, returns the StyleSheet.
 *
 * @example
 * ```ts
 * const createHomeStyles = createStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.bgPrimary,
 *     padding: theme.semanticSpacing.screenPadding,
 *   },
 *   title: {
 *     ...theme.typography.headingLarge.style,
 *     color: theme.colors.textPrimary,
 *   },
 * }));
 *
 * // In component:
 * const theme = useTheme();
 * const styles = createHomeStyles(theme);
 * ```
 */
export function createStyles<T extends StylesRecord>(
  getStyles: (theme: SaveStateTheme) => T,
): (theme: SaveStateTheme) => ReturnType<typeof StyleSheet.create> {
  return (theme: SaveStateTheme) => {
    return StyleSheet.create(getStyles(theme));
  };
}

/**
 * Resolve colors for the current theme mode.
 * Utility for interpolating dynamic colors outside React tree.
 */
export function getColors(mode: ThemeMode = 'dark'): typeof colors {
  return (mode === 'dark' ? colors : lightColors) as unknown as typeof colors;
}
