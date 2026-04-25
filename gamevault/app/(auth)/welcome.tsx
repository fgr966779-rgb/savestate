/**
 * SaveState — Welcome Screen (Screen 02)
 *
 * Hero welcome screen with illustration, title, subtitle,
 * CTA button with pulse animation, and skip link.
 * Staggered entrance animations for all elements.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme, colors, spacing, typography, fontFamilies } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { triggerHaptic } from '@/constants/theme';

// ── Constants ────────────────────────────────────────────────────
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STAGGER_DELAY = 200;

export default function WelcomeScreen() {
  const router = useRouter();

  // ── Animation values for staggered entrance ────────────────────
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const ctaOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(0.9);
  const skipOpacity = useSharedValue(0);

  useEffect(() => {
    heroOpacity.value = withDelay(0, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    heroTranslateY.value = withDelay(0, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
    titleOpacity.value = withDelay(STAGGER_DELAY, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    titleTranslateY.value = withDelay(STAGGER_DELAY, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    subtitleOpacity.value = withDelay(STAGGER_DELAY * 2, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    subtitleTranslateY.value = withDelay(STAGGER_DELAY * 2, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    ctaOpacity.value = withDelay(STAGGER_DELAY * 3, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    ctaScale.value = withDelay(STAGGER_DELAY * 3, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.1)) }));
    skipOpacity.value = withDelay(STAGGER_DELAY * 4, withTiming(1, { duration: 400 }));
  }, []);

  // ── Pulse animation for CTA ────────────────────────────────────
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  // ── Navigation handlers ────────────────────────────────────────
  const handleStartAdventure = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/(auth)/goal-selection');
  }, [router]);

  const handleSkip = useCallback(() => {
    triggerHaptic('buttonPress');
    router.push('/(auth)/account-setup');
  }, [router]);

  // ── Animated styles ────────────────────────────────────────────
  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ scale: ctaScale.value * pulseScale.value }],
  }));

  const skipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: skipOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Skip link — top right */}
      <Animated.View style={[styles.skipArea, skipAnimatedStyle]}>
        <Pressable
          onPress={handleSkip}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Пропустити"
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>Пропустити</Text>
        </Pressable>
      </Animated.View>

      {/* Hero illustration area — 3/4 of screen */}
      <Animated.View style={[styles.heroArea, heroAnimatedStyle]}>
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroEmoji}>🎮</Text>
          <Text style={styles.heroDeviceEmoji}>🪙</Text>
        </View>
        <View style={styles.heroGlow} />
      </Animated.View>

      {/* Title */}
      <Animated.View style={[styles.titleArea, titleAnimatedStyle]}>
        <Text style={styles.titleText}>Твоя мрія — реальна</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={[styles.subtitleArea, subtitleAnimatedStyle]}>
        <Text style={styles.subtitleText}>Накопичуй. Грай. Перемагай.</Text>
      </Animated.View>

      {/* CTA Button */}
      <Animated.View style={[styles.ctaArea, ctaAnimatedStyle]}>
        <Button
          label="Почати пригоду"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleStartAdventure}
        />
      </Animated.View>

      {/* Bottom decorative dots */}
      <View style={styles.dotsArea}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipArea: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    ...typography.labelMedium.style,
    color: colors.textTertiary,
    fontSize: 14,
  },
  heroArea: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.bgSecondary,
    borderWidth: 2,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  heroEmoji: {
    fontSize: 64,
  },
  heroDeviceEmoji: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: 28,
  },
  heroGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.glowBlue,
    zIndex: 1,
    opacity: 0.5,
  },
  titleArea: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
  },
  titleText: {
    fontFamily: fontFamilies.display,
    fontSize: 42,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 50,
    letterSpacing: 0.5,
  },
  subtitleArea: {
    marginBottom: spacing['3xl'],
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
  },
  subtitleText: {
    ...typography.bodyLarge.style,
    color: colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  ctaArea: {
    width: '100%',
    paddingHorizontal: spacing['2xl'],
  },
  dotsArea: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgTertiary,
  },
  dotActive: {
    backgroundColor: colors.accentBlue,
    width: 24,
  },
});
