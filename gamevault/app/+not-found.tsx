/**
 * SaveState — 404 Not Found Screen
 *
 * Dark background, centered error state, Ukrainian message,
 * and "На головну" button linking back to home.
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { useRouter, Stack } from 'expo-router';
import {
  colors,
  spacing,
  typography,
  fontFamilies,
  triggerHaptic,
} from '@/constants/theme';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';

export default function NotFoundScreen() {
  const router = useRouter();

  // ── Bobbing animation for error icon ───────────────────────────
  const bobOffset = useSharedValue(0);

  React.useEffect(() => {
    bobOffset.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const bobbedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobOffset.value }],
  }));

  // ── Navigation ─────────────────────────────────────────────────
  const handleGoHome = useCallback(() => {
    triggerHaptic('buttonPress');
    router.replace('/(tabs)/home');
  }, [router]);

  const handleRetry = useCallback(() => {
    triggerHaptic('buttonPress');
    router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Hide default header */}
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View entering={FadeIn.duration(500)} style={styles.contentContainer}>
        {/* Error icon with bobbing animation */}
        <Animated.View style={[styles.iconContainer, bobbedStyle]}>
          <View style={styles.iconBg}>
            <Text style={styles.iconText}>404</Text>
          </View>
        </Animated.View>

        {/* Glitch lines decoration */}
        <View style={styles.decorationContainer}>
          <View style={[styles.glitchLine, { width: '60%', left: '20%' }]} />
          <View style={[styles.glitchLine, { width: '40%', left: '30%', top: 8 }]} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Сторінку не знайдено</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Ця локація ще не відкрита. Повернися на безпечну територію.
        </Text>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            label="На головну"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleGoHome}
          />
          <View style={styles.backButtonSpacing}>
            <Button
              label="Назад"
              variant="ghost"
              size="md"
              fullWidth
              onPress={handleRetry}
            />
          </View>
        </View>

        {/* Decorative bottom text */}
        <Text style={styles.footerText}>
          SaveState v1.0
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.accentRed}12`,
    borderWidth: 2,
    borderColor: `${colors.accentRed}30`,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  iconText: {
    fontFamily: fontFamilies.display,
    fontSize: 36,
    fontWeight: '800',
    color: colors.accentRed,
    letterSpacing: 2,
  },
  decorationContainer: {
    position: 'absolute',
    top: '35%',
    alignItems: 'center',
    opacity: 0.15,
  },
  glitchLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: colors.accentRed,
    borderRadius: 1,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium.style,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: spacing['3xl'],
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 320,
  },
  backButtonSpacing: {
    marginTop: spacing.sm,
  },
  footerText: {
    ...typography.labelSmall.style,
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: fontFamilies.mono,
    marginTop: spacing['3xl'],
    opacity: 0.5,
  },
});
