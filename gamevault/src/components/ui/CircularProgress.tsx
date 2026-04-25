/**
 * SaveState Design System — Circular Progress Component
 *
 * Large circular progress ring for hero dashboard display.
 * Uses react-native-svg (Circle + rotation) with optional glow effect.
 * Center area renders children (e.g., amount text).
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  useTheme,
  radii,
  colors as staticColors,
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
export interface CircularProgressProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Outer diameter in pixels — default 160 */
  size?: number;
  /** Ring stroke width in pixels — default 12 */
  strokeWidth?: number;
  /** Content rendered in the center */
  children?: React.ReactNode;
  /** Enable glow effect behind the ring */
  glow?: boolean;
  /** Animate progress changes */
  animated?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// ── Animated Circle ──────────────────────────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── Component ────────────────────────────────────────────────────
const CircularProgressComponent: React.FC<CircularProgressProps> = ({
  progress,
  size = 160,
  strokeWidth = 12,
  children,
  glow = false,
  animated = true,
  style,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const c = theme.colors;

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressAnim = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressAnim.value = withTiming(clampedProgress / 100, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progressAnim.value = clampedProgress / 100;
    }
  }, [clampedProgress, animated, progressAnim]);

  const animatedStrokeProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressAnim.value),
  }));

  const gradientId = 'circProgressGrad';

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          ...(glow
            ? {
                shadowColor: c.accentBlueLight,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: strokeWidth * 2,
                elevation: 10,
              }
            : {}),
        },
        style,
      ]}
      accessible
      accessibilityLabel={accessibilityLabel ?? `Circular progress: ${Math.round(clampedProgress)}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress) }}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={c.gradientPrimary[0]} />
            <Stop offset="100%" stopColor={c.gradientPrimary[1]} />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={c.bgTertiary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedStrokeProps}
          rotation="-90"
          origin={`${size / 2} ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={[styles.center, { width: size - strokeWidth * 2, height: size - strokeWidth * 2 }]}>
        {children}
      </View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

export const CircularProgress = React.memo(CircularProgressComponent);
export default CircularProgress;
