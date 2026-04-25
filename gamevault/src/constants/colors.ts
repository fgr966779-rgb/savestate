/**
 * SaveState Design System — Color Tokens
 *
 * Full color palette for the gamified savings app.
 * Dark-first design with light theme overrides in theme.ts.
 */

export const colors = {
  // ── Backgrounds (depth hierarchy) ────────────────────────────
  bgPrimary: '#0A0A0F',
  bgSecondary: '#12121A',
  bgTertiary: '#1A1A28',
  bgSurface: '#22223A',
  bgOverlay: 'rgba(10,10,15,0.95)',

  // ── Accent colors ────────────────────────────────────────────
  accentBlue: '#0070D1',
  accentBlueLight: '#00AAFF',
  accentGold: '#FFD700',
  accentGreen: '#00FF88',
  accentPurple: '#9D4EDD',
  accentRed: '#FF3B3B',
  accentOrange: '#FF6B00',

  // ── Text ─────────────────────────────────────────────────────
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textTertiary: '#5A5A80',
  textDisabled: '#3A3A55',

  // ── Borders ──────────────────────────────────────────────────
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderDefault: 'rgba(255,255,255,0.12)',
  borderAccent: 'rgba(0,170,255,0.4)',

  // ── Gradients (start → end) ─────────────────────────────────
  gradientPrimary: ['#0070D1', '#00AAFF'] as const,
  gradientGold: ['#FFD700', '#FFA500'] as const,
  gradientPurple: ['#9D4EDD', '#7B2FF7'] as const,
  gradientDark: ['#0A0A0F', '#12121A'] as const,
  gradientSheen: ['rgba(255,255,255,0.05)', 'transparent'] as const,
  gradientOverlay: ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)'] as const,

  // ── Glow ─────────────────────────────────────────────────────
  glowBlue: 'rgba(0,112,209,0.3)',
  glowGold: 'rgba(255,215,0,0.25)',
  glowGreen: 'rgba(0,255,136,0.2)',

  // ── Semantic status ──────────────────────────────────────────
  success: '#00FF88',
  error: '#FF3B3B',
  warning: '#FF6B00',
  info: '#00AAFF',
  neutral: '#A0A0C0',
} as const;

// ── Light theme overrides ──────────────────────────────────────
export const lightColors = {
  bgPrimary: '#F5F6FA',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#EEEEF4',
  bgSurface: '#FFFFFF',
  bgOverlay: 'rgba(245,246,250,0.95)',

  accentBlue: '#0062C2',
  accentBlueLight: '#0090E8',
  accentGold: '#E8B800',
  accentGreen: '#00C96E',
  accentPurple: '#8840CC',
  accentRed: '#E03030',
  accentOrange: '#E05E00',

  textPrimary: '#1A1A2E',
  textSecondary: '#5A5A78',
  textTertiary: '#9090A8',
  textDisabled: '#C0C0D0',

  borderSubtle: 'rgba(0,0,0,0.06)',
  borderDefault: 'rgba(0,0,0,0.12)',
  borderAccent: 'rgba(0,98,194,0.4)',

  gradientPrimary: ['#0062C2', '#0090E8'] as const,
  gradientGold: ['#E8B800', '#E09200'] as const,
  gradientPurple: ['#8840CC', '#6A24DD'] as const,
  gradientDark: ['#F5F6FA', '#EEEEF4'] as const,
  gradientSheen: ['rgba(0,0,0,0.03)', 'transparent'] as const,
  gradientOverlay: ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)'] as const,

  glowBlue: 'rgba(0,98,194,0.2)',
  glowGold: 'rgba(232,184,0,0.15)',
  glowGreen: 'rgba(0,201,110,0.15)',

  success: '#00C96E',
  error: '#E03030',
  warning: '#E05E00',
  info: '#0090E8',
  neutral: '#5A5A78',
} as const;

export type ColorKeys = keyof typeof colors;
export type LightColorKeys = keyof typeof lightColors;

/** Gradient tuple type */
export type GradientTuple = readonly [string, string];
