/**
 * SaveState Design System — Spacing, Radius & Shadow Tokens
 *
 * 4px base grid system with semantic aliases for consistent layouts.
 */

import { ViewStyle } from 'react-native';

// ── Spacing Scale (4px base grid) ─────────────────────────────
export const spacing = {
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  base: 16,
  /** 20px */
  lg: 20,
  /** 24px */
  xl: 24,
  /** 32px */
  '2xl': 32,
  /** 40px */
  '3xl': 40,
  /** 48px */
  '4xl': 48,
  /** 64px */
  '5xl': 64,
} as const;

export type SpacingKey = keyof typeof spacing;

// ── Semantic Spacing Aliases ───────────────────────────────────
export const semanticSpacing = {
  /** Default screen horizontal padding */
  screenPadding: spacing.xl,
  /** Default card internal padding */
  cardPadding: spacing.lg,
  /** Input field padding */
  inputPadding: {
    horizontal: spacing.base,
    vertical: spacing.md,
  },
  /** Button padding */
  buttonPadding: {
    horizontal: spacing.base,
    vertical: spacing.md,
  },
  /** Gap between major sections */
  sectionGap: spacing['2xl'],
  /** Gap between list items */
  listItemGap: spacing.base,
  /** Gap between icon and text */
  iconGap: spacing.sm,
  /** Gap between form fields */
  formFieldGap: spacing.md,
  /** Avatar to text gap */
  avatarGap: spacing.sm,
  /** Bottom tab bar height */
  tabBarHeight: 80,
  /** Top status bar area */
  statusBarHeight: 48,
  /** Bottom safe area fallback */
  bottomSafeArea: 20,
  /** Floating action button margin */
  fabMargin: spacing.base,
  /** Modal horizontal margin */
  modalMargin: spacing.xl,
  /** Chip / badge horizontal padding */
  chipPaddingH: spacing.md,
  /** Chip / badge vertical padding */
  chipPaddingV: spacing.xs,
} as const;

// ── Border Radius Scale ───────────────────────────────────────
export const radii = {
  /** 6px — small elements (badges, chips) */
  sm: 6,
  /** 12px — buttons, inputs, small cards */
  md: 12,
  /** 16px — cards, containers */
  lg: 16,
  /** 24px — modals, dialogs */
  xl: 24,
  /** 32px — hero sections, feature cards */
  '2xl': 32,
  /** 9999px — fully rounded (avatars, FABs, pills) */
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radii;

// ── Semantic Radius Aliases ────────────────────────────────────
export const semanticRadii = {
  /** Standard card */
  cardRadius: radii.lg,
  /** Buttons */
  buttonRadius: radii.md,
  /** Input fields */
  inputRadius: radii.md,
  /** Modals & bottom sheets */
  modalRadius: radii.lg,
  /** Avatars */
  avatarRadius: radii.full,
  /** Floating action buttons */
  fabRadius: radii.full,
  /** Chips / tags */
  chipRadius: radii.full,
  /** Tooltip */
  tooltipRadius: radii.sm,
  /** Bottom sheet top corners */
  bottomSheetRadius: radii.xl,
  /** Toast / snackbar */
  toastRadius: radii.md,
  /** Progress bar */
  progressBarRadius: radii.full,
  /** Image card */
  imageRadius: radii.lg,
  /** Dialog */
  dialogRadius: radii.xl,
} as const;

// ── Shadows ────────────────────────────────────────────────────
export interface ShadowToken {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation?: number;
}

export const shadows = {
  /** No shadow — flat elements */
  elevation0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } satisfies ShadowToken,

  /** Subtle lift — 2dp */
  elevation1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  } satisfies ShadowToken,

  /** Low lift — 4dp */
  elevation2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
  } satisfies ShadowToken,

  /** Medium lift — 8dp */
  elevation3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  } satisfies ShadowToken,

  /** High lift — 16dp */
  elevation4: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 16,
  } satisfies ShadowToken,

  /** Accent glow effect */
  glowAccent: {
    shadowColor: 'rgba(0,170,255,0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  } satisfies ShadowToken,

  /** Gold glow effect */
  glowGold: {
    shadowColor: 'rgba(255,215,0,0.45)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  } satisfies ShadowToken,

  /** Green glow effect */
  glowGreen: {
    shadowColor: 'rgba(0,255,136,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  } satisfies ShadowToken,

  /** Purple glow effect */
  glowPurple: {
    shadowColor: 'rgba(157,78,221,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  } satisfies ShadowToken,
} as const;

export type ShadowKey = keyof typeof shadows;

// ── Helper: apply shadow to ViewStyle ──────────────────────────
export function applyShadow(
  key: ShadowKey,
  overrides?: Partial<ShadowToken>,
): ViewStyle {
  const s = shadows[key];
  return {
    shadowColor: overrides?.shadowColor ?? s.shadowColor,
    shadowOffset: overrides?.shadowOffset ?? s.shadowOffset,
    shadowOpacity: overrides?.shadowOpacity ?? s.shadowOpacity,
    shadowRadius: overrides?.shadowRadius ?? s.shadowRadius,
    elevation: overrides?.elevation ?? s.elevation,
  };
}

// ── Border Widths ──────────────────────────────────────────────
export const borderWidths = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

export type BorderWidthKey = keyof typeof borderWidths;
