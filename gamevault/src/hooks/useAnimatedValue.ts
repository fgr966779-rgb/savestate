/**
 * SaveState — useAnimatedValue Hook
 *
 * Reanimated animated value hooks for smooth UI animations.
 * Provides simple animated value and spring-animated value variants.
 */

import { useCallback, useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  type SharedValue,
  type WithTimingConfig,
  type WithSpringConfig,
} from 'react-native-reanimated';

// ── Default configs ────────────────────────────────────────────
const DEFAULT_TIMING_CONFIG: WithTimingConfig = {
  duration: 300,
};

const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

// ── useAnimatedValue: Simple timing animation ───────────────────
/**
 * Creates an animated shared value with timing-based transitions.
 *
 * @param initialValue - Starting numeric value
 * @param config - Optional WithTimingConfig for the animation
 * @returns Object with value, styles helper, and animate method
 */
export function useAnimatedValue(
  initialValue: number,
  config: WithTimingConfig = DEFAULT_TIMING_CONFIG,
) {
  const value = useSharedValue<number>(initialValue);

  const animateTo = useCallback(
    (toValue: number, customConfig?: WithTimingConfig) => {
      value.value = withTiming(toValue, customConfig ?? config);
    },
    [value, config],
  );

  const reset = useCallback(() => {
    value.value = withTiming(initialValue, config);
  }, [value, initialValue, config]);

  // Convenience: animated style for opacity
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: value.value,
  }));

  return {
    value,
    animateTo,
    reset,
    opacityStyle,
  };
}

// ── useAnimatedValueSpring: Spring animation ────────────────────
/**
 * Creates an animated shared value with spring-based transitions.
 *
 * @param initialValue - Starting numeric value
 * @param config - Optional WithSpringConfig for the spring physics
 * @returns Object with value, styles helper, and animate method
 */
export function useAnimatedValueSpring(
  initialValue: number,
  config: WithSpringConfig = DEFAULT_SPRING_CONFIG,
) {
  const value = useSharedValue<number>(initialValue);

  const animateTo = useCallback(
    (toValue: number, customConfig?: WithSpringConfig) => {
      value.value = withSpring(toValue, customConfig ?? config);
    },
    [value, config],
  );

  const reset = useCallback(() => {
    value.value = withSpring(initialValue, config);
  }, [value, initialValue, config]);

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: value.value,
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: value.value }],
  }));

  const translateYStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: value.value }],
  }));

  const translateXStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: value.value }],
  }));

  return {
    value,
    animateTo,
    reset,
    opacityStyle,
    scaleStyle,
    translateYStyle,
    translateXStyle,
  };
}
