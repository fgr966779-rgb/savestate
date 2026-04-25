/**
 * SaveState Design System — CelebrationModal
 *
 * Fullscreen celebration overlay with Lottie animation, centered text,
 * optional CTA button, 3-second auto-dismiss, haptic feedback.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  AccessibilityInfo,
  Easing,
} from 'react-native';
import {
  useTheme,
  spacing,
  semanticRadii,
  shadows,
  typography,
  triggerNotification,
  triggerImpact,
  triggerHaptic,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface CelebrationModalProps {
  /** Controls visibility */
  visible: boolean;
  /** Called when modal closes */
  onClose: () => void;
  /** Headline text (e.g. "Achievement Unlocked!") */
  title?: string;
  /** Subtitle / reward description */
  subtitle?: string;
  /** CTA button label (e.g. "Claim Reward") */
  ctaLabel?: string;
  /** CTA button handler */
  onCta?: () => void;
  /** Lottie animation source (require or URL) */
  lottieSource?: object;
}

// ── Constants ────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 3000;
const ENTER_DURATION = 500;
const EXIT_DURATION = 300;
const BOUNCE_SCALE = 1.08;

// ── Particle component (CSS-free confetti substitute) ────────────

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
}

const CelebrationParticles: React.FC<{ visible: boolean }> = ({ visible }) => {
  const particles = useRef<Particle[]>(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#FFD700', '#00AAFF', '#00FF88', '#9D4EDD', '#FF3B3B'][i % 5],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 600,
    })),
  ).current;

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.color,
            },
          ]}
        />
      ))}
    </View>
  );
};

// ── Component ────────────────────────────────────────────────────

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  ctaLabel,
  onCta,
  lottieSource,
}) => {
  const theme = useTheme();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.3)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Trigger haptics on show ───────────────────────────────────
  useEffect(() => {
    if (visible) {
      triggerNotification('success');
      setTimeout(() => triggerImpact('heavy'), 300);
    }
  }, [visible]);

  // ── Animate in ────────────────────────────────────────────────
  const animateIn = useCallback(() => {
    contentScale.setValue(0.3);
    contentOpacity.setValue(0);
    backdropOpacity.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ENTER_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(contentScale, {
          toValue: BOUNCE_SCALE,
          damping: 8,
          stiffness: 120,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(contentScale, {
        toValue: 1,
        damping: 12,
        stiffness: 150,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();

    AccessibilityInfo.announceForAccessibility(
      title ? `Celebration! ${title}` : 'Celebration!',
    );
  }, [backdropOpacity, contentScale, contentOpacity, title]);

  // ── Animate out ───────────────────────────────────────────────
  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 0.8,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [backdropOpacity, contentScale, contentOpacity, onClose]);

  // ── Auto-dismiss timer ────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      animateIn();
      autoDismissTimer.current = setTimeout(() => {
        animateOut();
      }, AUTO_DISMISS_MS);
    }
    return () => {
      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current);
      }
    };
  }, [visible, animateIn, animateOut]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleBackdropTap = () => {
    if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    animateOut();
  };

  const handleCta = () => {
    if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    if (onCta) onCta();
    animateOut();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay} testID="celebration-modal-root">
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: 'rgba(0,0,0,0.7)', opacity: backdropOpacity },
        ]}
      >
        <Pressable
          onPress={handleBackdropTap}
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close celebration"
          accessibilityRole="button"
        />
      </Animated.View>

      {/* Particles */}
      <CelebrationParticles visible={visible} />

      {/* Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: contentOpacity,
            transform: [{ scale: contentScale }],
          },
        ]}
        accessible
        accessibilityLabel={title ?? 'Celebration'}
        accessibilityRole="alert"
      >
        {/* Title */}
        {title ? (
          <Text
            style={[
              typography.displaySmall.style,
              {
                color: theme.colors.accentGold,
                textAlign: 'center',
              },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
        ) : null}

        {/* Subtitle */}
        {subtitle ? (
          <Text
            style={[
              typography.titleLarge.style,
              {
                color: theme.colors.textSecondary,
                textAlign: 'center',
                marginTop: spacing.sm,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}

        {/* CTA Button */}
        {ctaLabel ? (
          <Pressable
            onPress={handleCta}
            style={[
              styles.ctaButton,
              {
                backgroundColor: theme.colors.accentBlue,
                borderRadius: semanticRadii.buttonRadius,
                ...shadows.glowAccent,
              },
            ]}
            accessibilityLabel={ctaLabel}
            accessibilityRole="button"
          >
            <Text
              style={[
                typography.buttonMedium.style,
                { color: theme.colors.textPrimary },
              ]}
            >
              {ctaLabel}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    maxWidth: 400,
    gap: spacing.md,
  },
  particle: {
    position: 'absolute',
    top: '10%',
    opacity: 0.8,
  },
  ctaButton: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.md,
  },
});

export default React.memo(CelebrationModal);
export type { CelebrationModalProps };
