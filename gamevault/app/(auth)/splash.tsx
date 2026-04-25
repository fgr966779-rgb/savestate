/**
 * SaveState — Splash Screen (Screen 01)
 *
 * Full-screen splash with animated logo, coin burst Lottie animation,
 * progress bar with blue glow, and auto-redirect to welcome after 2.5s.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme, colors, spacing, typography, fontFamilies } from '@/constants/theme';

// ── Constants ────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPLASH_DURATION = 2500;
const PROGRESS_BAR_WIDTH = SCREEN_WIDTH * 0.6;

export default function SplashScreenScreen() {
  const router = useRouter();
  const [lottieReady, setLottieReady] = useState(false);

  // ── Animation values ───────────────────────────────────────────
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const coinRotation = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  // ── Entrance animations ────────────────────────────────────────
  useEffect(() => {
    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.2)),
    });
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    coinRotation.value = withRepeat(
      withSequence(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        withTiming(720, { duration: 3000, easing: Easing.linear }),
      ),
      -1,
      false,
    );
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    // Progress bar fills over splash duration
    progressWidth.value = withDelay(400, withTiming(PROGRESS_BAR_WIDTH, {
      duration: SPLASH_DURATION - 600,
      easing: Easing.inOut(Easing.ease),
    }));
    glowOpacity.value = withDelay(400, withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    ));
  }, []);

  // ── Auto-redirect to welcome ───────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      router.replace('/(auth)/welcome');
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [router]);

  // ── Animated styles ────────────────────────────────────────────
  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const animatedCoinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${coinRotation.value}deg` }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Coin burst illustration area */}
      <View style={styles.illustrationArea}>
        {/* Floating coin */}
        <Animated.View style={[styles.coinContainer, animatedCoinStyle]}>
          <View style={styles.coinOuter}>
            <View style={styles.coinInner}>
              <Text style={styles.coinIcon}>🪙</Text>
            </View>
          </View>
        </Animated.View>

        {/* Device icons */}
        <Animated.View style={[styles.iconRow, animatedLogoStyle]}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconEmoji}>🎮</Text>
          </View>
          <View style={styles.iconBadge}>
            <Text style={styles.iconEmoji}>🖥️</Text>
          </View>
        </Animated.View>
      </View>

      {/* Logo text */}
      <Animated.View style={[styles.logoArea, animatedLogoStyle]}>
        <Text style={styles.logoText}>SaveState</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={[styles.subtitleArea, animatedSubtitleStyle]}>
        <Text style={styles.subtitleText}>
          Накопичуй. Грай. Перемагай.
        </Text>
      </Animated.View>

      {/* Progress bar with glow */}
      <View style={styles.progressArea}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, animatedProgressStyle]}>
            <Animated.View style={[styles.progressGlow, animatedGlowStyle]} />
          </Animated.View>
        </View>
      </View>

      {/* Lottie placeholder for splash-coin-burst */}
      <View style={styles.lottieArea}>
        {lottieReady && (
          <Text style={styles.lottiePlaceholder}>✨</Text>
        )}
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  coinContainer: {
    marginBottom: spacing.lg,
  },
  coinOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  coinInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIcon: {
    fontSize: 36,
  },
  iconRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  logoArea: {
    marginBottom: spacing.sm,
  },
  logoText: {
    fontFamily: fontFamilies.display,
    fontSize: 42,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subtitleArea: {
    marginBottom: spacing['3xl'],
  },
  subtitleText: {
    ...typography.bodyLarge.style,
    color: colors.textTertiary,
    fontSize: 16,
    letterSpacing: 1,
  },
  progressArea: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    width: PROGRESS_BAR_WIDTH,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bgTertiary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accentBlue,
    position: 'relative',
  },
  progressGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
    backgroundColor: colors.accentBlueLight,
    shadowColor: colors.accentBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  lottieArea: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
    opacity: 0.4,
  },
  lottiePlaceholder: {
    fontSize: 20,
  },
});
