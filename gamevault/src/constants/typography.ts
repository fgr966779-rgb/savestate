/**
 * SaveState Design System — Typography Tokens
 *
 * Font families: Rajdhani (display), Inter (body), JetBrains Mono (code).
 * Size scale: 2xs(8px) → 5xl(80px).
 * Line heights: tight(1.1), snugged(1.25), normal(1.5), relaxed(1.75).
 * Letter spacing: tight(-0.02em), normal(0), wide(0.05em), widest(0.1em).
 */

import { TextStyle, Platform } from 'react-native';

// ── Font Families ──────────────────────────────────────────────
export const fontFamilies = {
  display: 'Rajdhani',
  body: Platform.select({ ios: 'Inter', default: 'Inter' }),
  mono: Platform.select({ ios: 'JetBrains Mono', default: 'JetBrains Mono' }),
} as const;

export type FontFamilyKey = keyof typeof fontFamilies;

// ── Font Weights ───────────────────────────────────────────────
export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export type FontWeightKey = keyof typeof fontWeights;

// ── Line Height Multipliers ────────────────────────────────────
export const lineHeights = {
  tight: 1.1,
  snugged: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export type LineHeightKey = keyof typeof lineHeights;

// ── Letter Spacing ─────────────────────────────────────────────
export const letterSpacing = {
  tight: -0.02,   // em
  normal: 0,
  wide: 0.05,     // em
  widest: 0.1,    // em
} as const;

export type LetterSpacingKey = keyof typeof letterSpacing;

// ── Single size definition ─────────────────────────────────────
export interface FontSizeToken {
  /** Font size in pixels */
  size: number;
  /** Computed line-height in pixels */
  lineHeight: number;
  /** Letter spacing in em */
  letterSpacing: number;
  /** Font weight key */
  weight: FontWeightKey;
}

// ── Size Scale ─────────────────────────────────────────────────
export const fontSizes = {
  '2xs': {
    size: 8,
    lineHeight: Math.round(8 * lineHeights.normal),
    letterSpacing: letterSpacing.wide,
    weight: 'regular',
  },
  xs: {
    size: 10,
    lineHeight: Math.round(10 * lineHeights.normal),
    letterSpacing: letterSpacing.wide,
    weight: 'regular',
  },
  sm: {
    size: 12,
    lineHeight: Math.round(12 * lineHeights.normal),
    letterSpacing: letterSpacing.normal,
    weight: 'regular',
  },
  base: {
    size: 14,
    lineHeight: Math.round(14 * lineHeights.normal),
    letterSpacing: letterSpacing.normal,
    weight: 'regular',
  },
  md: {
    size: 16,
    lineHeight: Math.round(16 * lineHeights.normal),
    letterSpacing: letterSpacing.normal,
    weight: 'regular',
  },
  lg: {
    size: 18,
    lineHeight: Math.round(18 * lineHeights.normal),
    letterSpacing: letterSpacing.normal,
    weight: 'medium',
  },
  xl: {
    size: 20,
    lineHeight: Math.round(20 * lineHeights.snugged),
    letterSpacing: letterSpacing.normal,
    weight: 'semibold',
  },
  '2xl': {
    size: 24,
    lineHeight: Math.round(24 * lineHeights.snugged),
    letterSpacing: letterSpacing.normal,
    weight: 'bold',
  },
  '3xl': {
    size: 30,
    lineHeight: Math.round(30 * lineHeights.snugged),
    letterSpacing: letterSpacing.tight,
    weight: 'bold',
  },
  '4xl': {
    size: 36,
    lineHeight: Math.round(36 * lineHeights.tight),
    letterSpacing: letterSpacing.tight,
    weight: 'bold',
  },
  '5xl': {
    size: 48,
    lineHeight: Math.round(48 * lineHeights.tight),
    letterSpacing: letterSpacing.tight,
    weight: 'extrabold',
  },
  display: {
    size: 64,
    lineHeight: Math.round(64 * lineHeights.tight),
    letterSpacing: letterSpacing.tight,
    weight: 'extrabold',
  },
  hero: {
    size: 80,
    lineHeight: Math.round(80 * lineHeights.tight),
    letterSpacing: letterSpacing.tight,
    weight: 'extrabold',
  },
} as const;

export type FontSizeKey = keyof typeof fontSizes;

// ── Semantic Typography Tokens ─────────────────────────────────
export interface SemanticFontToken {
  /** Full React Native TextStyle */
  style: TextStyle;
  /** Reference to the size token */
  size: FontSizeKey;
  /** Reference to the family token */
  family: FontFamilyKey;
}

export const typography = {
  // ── Display ──────────────────────────────────────────────────
  displayLarge: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes.hero.size,
      lineHeight: fontSizes.hero.lineHeight,
      letterSpacing: fontSizes.hero.letterSpacing,
      fontWeight: fontWeights.extrabold as TextStyle['fontWeight'],
    },
    size: 'hero' as const,
    family: 'display' as const,
  },
  displayMedium: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes['5xl'].size,
      lineHeight: fontSizes['5xl'].lineHeight,
      letterSpacing: fontSizes['5xl'].letterSpacing,
      fontWeight: fontWeights.extrabold as TextStyle['fontWeight'],
    },
    size: '5xl' as const,
    family: 'display' as const,
  },
  displaySmall: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes['4xl'].size,
      lineHeight: fontSizes['4xl'].lineHeight,
      letterSpacing: fontSizes['4xl'].letterSpacing,
      fontWeight: fontWeights.bold as TextStyle['fontWeight'],
    },
    size: '4xl' as const,
    family: 'display' as const,
  },

  // ── Headings ─────────────────────────────────────────────────
  headingLarge: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes['3xl'].size,
      lineHeight: fontSizes['3xl'].lineHeight,
      letterSpacing: fontSizes['3xl'].letterSpacing,
      fontWeight: fontWeights.bold as TextStyle['fontWeight'],
    },
    size: '3xl' as const,
    family: 'display' as const,
  },
  headingMedium: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes['2xl'].size,
      lineHeight: fontSizes['2xl'].lineHeight,
      letterSpacing: fontSizes['2xl'].letterSpacing,
      fontWeight: fontWeights.bold as TextStyle['fontWeight'],
    },
    size: '2xl' as const,
    family: 'display' as const,
  },
  headingSmall: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes.xl.size,
      lineHeight: fontSizes.xl.lineHeight,
      letterSpacing: fontSizes.xl.letterSpacing,
      fontWeight: fontWeights.semibold as TextStyle['fontWeight'],
    },
    size: 'xl' as const,
    family: 'display' as const,
  },

  // ── Title ────────────────────────────────────────────────────
  titleLarge: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.lg.size,
      lineHeight: fontSizes.lg.lineHeight,
      letterSpacing: fontSizes.lg.letterSpacing,
      fontWeight: fontWeights.medium as TextStyle['fontWeight'],
    },
    size: 'lg' as const,
    family: 'body' as const,
  },
  titleMedium: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.md.size,
      lineHeight: fontSizes.md.lineHeight,
      letterSpacing: fontSizes.md.letterSpacing,
      fontWeight: fontWeights.medium as TextStyle['fontWeight'],
    },
    size: 'md' as const,
    family: 'body' as const,
  },

  // ── Body ─────────────────────────────────────────────────────
  bodyLarge: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.base.size,
      lineHeight: fontSizes.base.lineHeight,
      letterSpacing: fontSizes.base.letterSpacing,
      fontWeight: fontWeights.regular as TextStyle['fontWeight'],
    },
    size: 'base' as const,
    family: 'body' as const,
  },
  bodyMedium: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.sm.size,
      lineHeight: fontSizes.sm.lineHeight,
      letterSpacing: fontSizes.sm.letterSpacing,
      fontWeight: fontWeights.regular as TextStyle['fontWeight'],
    },
    size: 'sm' as const,
    family: 'body' as const,
  },
  bodySmall: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.xs.size,
      lineHeight: fontSizes.xs.lineHeight,
      letterSpacing: fontSizes.xs.letterSpacing,
      fontWeight: fontWeights.regular as TextStyle['fontWeight'],
    },
    size: 'xs' as const,
    family: 'body' as const,
  },
  bodyTiny: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes['2xs'].size,
      lineHeight: fontSizes['2xs'].lineHeight,
      letterSpacing: fontSizes['2xs'].letterSpacing,
      fontWeight: fontWeights.regular as TextStyle['fontWeight'],
    },
    size: '2xs' as const,
    family: 'body' as const,
  },

  // ── Label ────────────────────────────────────────────────────
  labelLarge: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.md.size,
      lineHeight: fontSizes.md.lineHeight,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.semibold as TextStyle['fontWeight'],
    },
    size: 'md' as const,
    family: 'body' as const,
  },
  labelMedium: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.sm.size,
      lineHeight: fontSizes.sm.lineHeight,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.semibold as TextStyle['fontWeight'],
    },
    size: 'sm' as const,
    family: 'body' as const,
  },
  labelSmall: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.xs.size,
      lineHeight: fontSizes.xs.lineHeight,
      letterSpacing: letterSpacing.widest,
      fontWeight: fontWeights.semibold as TextStyle['fontWeight'],
    },
    size: 'xs' as const,
    family: 'body' as const,
  },

  // ── Code ─────────────────────────────────────────────────────
  code: {
    style: {
      fontFamily: fontFamilies.mono,
      fontSize: fontSizes.sm.size,
      lineHeight: fontSizes.sm.lineHeight,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.regular as TextStyle['fontWeight'],
    },
    size: 'sm' as const,
    family: 'mono' as const,
  },

  // ── Numeric / Stat (for XP, coins, etc.) ────────────────────
  statLarge: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes['5xl'].size,
      lineHeight: fontSizes['5xl'].lineHeight,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.extrabold as TextStyle['fontWeight'],
    },
    size: '5xl' as const,
    family: 'display' as const,
  },
  statMedium: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes['3xl'].size,
      lineHeight: fontSizes['3xl'].lineHeight,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.bold as TextStyle['fontWeight'],
    },
    size: '3xl' as const,
    family: 'display' as const,
  },
  statSmall: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes['2xl'].size,
      lineHeight: fontSizes['2xl'].lineHeight,
      letterSpacing: letterSpacing.normal,
      fontWeight: fontWeights.bold as TextStyle['fontWeight'],
    },
    size: '2xl' as const,
    family: 'display' as const,
  },

  // ── Button ───────────────────────────────────────────────────
  buttonLarge: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes.lg.size,
      lineHeight: fontSizes.lg.lineHeight,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.bold as TextStyle['fontWeight'],
    },
    size: 'lg' as const,
    family: 'display' as const,
  },
  buttonMedium: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes.md.size,
      lineHeight: fontSizes.md.lineHeight,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.semibold as TextStyle['fontWeight'],
    },
    size: 'md' as const,
    family: 'display' as const,
  },
  buttonSmall: {
    style: {
      fontFamily: fontFamilies.display,
      fontSize: fontSizes.sm.size,
      lineHeight: fontSizes.sm.lineHeight,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.semibold as TextStyle['fontWeight'],
    },
    size: 'sm' as const,
    family: 'display' as const,
  },

  // ── Navigation / Tab bar ─────────────────────────────────────
  tabActive: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.xs.size,
      lineHeight: fontSizes.xs.lineHeight,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.semibold as TextStyle['fontWeight'],
    },
    size: 'xs' as const,
    family: 'body' as const,
  },
  tabInactive: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.xs.size,
      lineHeight: fontSizes.xs.lineHeight,
      letterSpacing: letterSpacing.wide,
      fontWeight: fontWeights.regular as TextStyle['fontWeight'],
    },
    size: 'xs' as const,
    family: 'body' as const,
  },

  // ── Caption / Overline ──────────────────────────────────────
  caption: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes['2xs'].size,
      lineHeight: fontSizes['2xs'].lineHeight,
      letterSpacing: letterSpacing.widest,
      fontWeight: fontWeights.medium as TextStyle['fontWeight'],
    },
    size: '2xs' as const,
    family: 'body' as const,
  },
  overline: {
    style: {
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.xs.size,
      lineHeight: fontSizes.xs.lineHeight,
      letterSpacing: letterSpacing.widest,
      fontWeight: fontWeights.bold as TextStyle['fontWeight'],
      textTransform: 'uppercase',
    },
    size: 'xs' as const,
    family: 'body' as const,
  },
} as const;

export type TypographyKey = keyof typeof typography;
