/**
 * HapticButton — Pressable wrapper that adds haptic feedback and scale animation.
 *
 * Wraps any content in Pressable with scale(0.97) animation + specified haptic pattern.
 */

import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  type PressableProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import {
  useTheme,
  triggerHaptic,
  triggerImpact,
  type HapticPatternKey,
} from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
export interface HapticButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  /** Predefined haptic pattern key or raw impact style string */
  hapticType?: HapticPatternKey;
  /** Press callback */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
  /** HitSlop for expanded tap area */
  hitSlop?: PressableProps['hitSlop'];
  /** Scale factor on press (default 0.97) */
  pressScale?: number;
}

// ── Component ──────────────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HapticButton({
  children,
  hapticType = 'buttonPress',
  onPress,
  disabled = false,
  style,
  hitSlop,
  pressScale = 0.97,
  ...rest
}: HapticButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(pressScale, {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
    });
  }, [pressScale, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 250,
      mass: 0.5,
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled) {
      triggerHaptic('error');
      return;
    }
    triggerHaptic(hapticType);
    onPress?.();
  }, [disabled, hapticType, onPress]);

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      android_ripple={
        disabled
          ? undefined
          : { color: theme.colors.borderSubtle, borderless: false }
      }
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

export default HapticButton;
