/**
 * CoinAnimation — Animated coin that flies from one position to another.
 *
 * Uses Reanimated shared values for position. Gold coin icon.
 * Duration 800ms with bouncy spring physics.
 */

import React, { useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

// ── Types ──────────────────────────────────────────────────────
export interface CoinAnimationProps {
  visible: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onComplete?: () => void;
}

// ── Component ──────────────────────────────────────────────────
export function CoinAnimation({
  visible,
  startX,
  startY,
  endX,
  endY,
  onComplete,
}: CoinAnimationProps) {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  const runAnimation = useCallback(() => {
    translateX.value = startX;
    translateY.value = startY;
    scale.value = 0;
    opacity.value = 0;
    rotation.value = 0;

    // Phase 1: Pop in at start
    scale.value = withTiming(1.2, { duration: 150, easing: Easing.out(Easing.back(2)) });
    opacity.value = withTiming(1, { duration: 100 });

    // Phase 2: Fly to end with bouncy spring
    translateX.value = withSpring(endX, {
      damping: 12,
      stiffness: 180,
      mass: 0.8,
    });

    translateY.value = withSpring(endY, {
      damping: 12,
      stiffness: 180,
      mass: 0.8,
    });

    rotation.value = withSequence(
      withTiming(360, { duration: 600, easing: Easing.inOut(Easing.cubic) }),
    );

    // Phase 3: Shrink and fade out at end
    setTimeout(() => {
      scale.value = withTiming(0.3, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 }, () => {
        if (onComplete) {
          onComplete();
        }
      });
    }, 650);
  }, [startX, startY, endX, endY, onComplete, translateX, translateY, scale, opacity, rotation]);

  useEffect(() => {
    if (visible) {
      runAnimation();
    }
  }, [visible, runAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.coin, animatedStyle]} pointerEvents="none">
      <Text style={styles.coinEmoji}>🪙</Text>
    </Animated.View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  coin: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    pointerEvents: 'none',
  },
  coinEmoji: {
    fontSize: 28,
  },
});
