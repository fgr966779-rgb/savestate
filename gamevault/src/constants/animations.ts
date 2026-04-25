/**
 * SaveState Design System — Animation Tokens
 *
 * Duration levels, easing curves (CSS + Reanimated spring configs),
 * page transition presets for React Navigation + Reanimated.
 */

// ── Duration Levels ────────────────────────────────────────────
export const durations = {
  /** 100ms — micro feedback (press ripple) */
  instant: 100,
  /** 200ms — toggle, checkbox */
  fast: 200,
  /** 300ms — default interactive transitions */
  normal: 300,
  /** 450ms — content entrance */
  gentle: 450,
  /** 600ms — card / modal transitions */
  moderate: 600,
  /** 800ms — complex animations (hero, parallax) */
  slow: 800,
  /** 2500ms — splash screen, celebration */
  splash: 2500,
} as const;

export type DurationKey = keyof typeof durations;

// ── Easing Curves ──────────────────────────────────────────────
export interface EasingToken {
  /** CSS cubic-bezier string */
  css: string;
  /** Reanimated Easing function name for reference */
  reanimated: string;
  /** Reanimated spring config (when applicable) */
  spring?: SpringConfig;
}

export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
}

export const easings = {
  /** Standard ease */
  ease: {
    css: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    reanimated: 'Easing.ease',
  } satisfies EasingToken,

  /** Ease-in (accelerate) */
  easeIn: {
    css: 'cubic-bezier(0.42, 0, 1, 1)',
    reanimated: 'Easing.in(Easing.ease)',
  } satisfies EasingToken,

  /** Ease-out (decelerate) */
  easeOut: {
    css: 'cubic-bezier(0, 0, 0.58, 1)',
    reanimated: 'Easing.out(Easing.ease)',
  } satisfies EasingToken,

  /** Ease-in-out (smooth both ends) */
  easeInOut: {
    css: 'cubic-bezier(0.42, 0, 0.58, 1)',
    reanimated: 'Easing.inOut(Easing.ease)',
  } satisfies EasingToken,

  /** iOS-style spring */
  spring: {
    css: 'cubic-bezier(0.33, 1, 0.68, 1)',
    reanimated: 'withSpring',
    spring: {
      damping: 15,
      stiffness: 150,
      mass: 1,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  } satisfies EasingToken,

  /** Playful overshoot spring */
  bouncy: {
    css: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    reanimated: 'withSpring',
    spring: {
      damping: 10,
      stiffness: 180,
      mass: 1,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  } satisfies EasingToken,

  /** Heavy overshoot (rubber band) */
  rubber: {
    css: 'cubic-bezier(0.22, 1.2, 0.36, 1)',
    reanimated: 'withSpring',
    spring: {
      damping: 8,
      stiffness: 200,
      mass: 0.8,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  } satisfies EasingToken,

  /** Soft deceleration — gentle fade-in */
  gentle: {
    css: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    reanimated: 'withSpring',
    spring: {
      damping: 20,
      stiffness: 120,
      mass: 1,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  } satisfies EasingToken,
} as const;

export type EasingKey = keyof typeof easings;

// ── Page Transition Configs ────────────────────────────────────
export interface PageTransitionConfig {
  /** Animation duration in ms */
  duration: number;
  /** Easing to use */
  easing: EasingKey;
  /** Screen initial translateX for entering screen */
  translateX?: number;
  /** Screen initial translateY for entering screen */
  translateY?: number;
  /** Initial opacity */
  opacity?: number;
  /** Initial scale factor */
  scale?: number;
  /** Description for documentation */
  description: string;
}

export const pageTransitions = {
  /** Stack push — new screen slides in from right */
  stackPush: {
    duration: durations.normal,
    easing: 'easeOut',
    translateX: 300,
    opacity: 1,
    description: 'New screen enters from the right with deceleration',
  } satisfies PageTransitionConfig,

  /** Stack pop — current screen slides out to the right */
  stackPop: {
    duration: durations.normal,
    easing: 'easeIn',
    translateX: -300,
    opacity: 1,
    description: 'Current screen exits to the left with acceleration',
  } satisfies PageTransitionConfig,

  /** Tab switch — crossfade with subtle scale */
  tabSwitch: {
    duration: durations.fast,
    easing: 'easeInOut',
    opacity: 0.9,
    scale: 0.98,
    description: 'Subtle crossfade with scale bounce on tab change',
  } satisfies PageTransitionConfig,

  /** Modal present — slides up from bottom */
  modalPresent: {
    duration: durations.moderate,
    easing: 'spring',
    translateY: 400,
    opacity: 0,
    description: 'Modal rises from bottom with iOS spring feel',
  } satisfies PageTransitionConfig,

  /** Modal dismiss — slides down to bottom */
  modalDismiss: {
    duration: durations.moderate,
    easing: 'easeIn',
    translateY: 400,
    opacity: 0,
    description: 'Modal descends and fades out',
  } satisfies PageTransitionConfig,

  /** Bottom sheet — partial slide from bottom */
  bottomSheet: {
    duration: durations.moderate,
    easing: 'spring',
    translateY: 300,
    opacity: 0,
    description: 'Bottom sheet slides up with spring physics',
  } satisfies PageTransitionConfig,

  /** Celebration — playful entrance with scale bounce */
  celebration: {
    duration: durations.slow,
    easing: 'bouncy',
    scale: 0.5,
    opacity: 0,
    description: 'Over-the-top entrance for achievements and rewards',
  } satisfies PageTransitionConfig,

  /** Shared element — morph between screens */
  sharedElement: {
    duration: durations.moderate,
    easing: 'gentle',
    opacity: 1,
    description: 'Smooth morph transition for shared element navigation',
  } satisfies PageTransitionConfig,
} as const;

export type PageTransitionKey = keyof typeof pageTransitions;

// ── Stagger Configs ────────────────────────────────────────────
export const stagger = {
  /** Delay between each item in a stagger animation */
  itemDelay: 50,
  /** Base delay before stagger starts */
  baseDelay: 100,
  /** Maximum stagger duration before everything is in */
  maxTotalDuration: 600,
  /** Default stagger for list items */
  listItem: 30,
  /** Stagger for dashboard cards */
  dashboardCard: 80,
  /** Stagger for achievement list */
  achievementItem: 60,
  /** Stagger for quest items */
  questItem: 70,
} as const;

// ── Keyframe Presets ───────────────────────────────────────────
export const keyframes = {
  fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
  fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
  slideUp: { from: { translateY: 20, opacity: 0 }, to: { translateY: 0, opacity: 1 } },
  slideDown: { from: { translateY: -20, opacity: 0 }, to: { translateY: 0, opacity: 1 } },
  slideInRight: { from: { translateX: 40, opacity: 0 }, to: { translateX: 0, opacity: 1 } },
  slideInLeft: { from: { translateX: -40, opacity: 0 }, to: { translateX: 0, opacity: 1 } },
  scaleIn: { from: { scale: 0.8, opacity: 0 }, to: { scale: 1, opacity: 1 } },
  scaleOut: { from: { scale: 1, opacity: 1 }, to: { scale: 0.8, opacity: 0 } },
  bounceIn: { from: { scale: 0.3, opacity: 0 }, to: { scale: 1, opacity: 1 } },
  pulse: { from: { scale: 1 }, to: { scale: 1.05 } },
  shake: { from: { translateX: 0 }, to: { translateX: -5 } },
  spin: { from: { rotate: '0deg' }, to: { rotate: '360deg' } },
  coinFlip: { from: { rotateY: '0deg' }, to: { rotateY: '180deg' } },
} as const;

export type KeyframeKey = keyof typeof keyframes;
