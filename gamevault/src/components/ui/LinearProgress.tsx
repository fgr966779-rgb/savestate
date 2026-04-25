/**
 * SaveState Design System — Linear Progress Component
 *
 * Gradient-filled horizontal progress bar with optional label.
 * Uses Reanimated interpolate for smooth animation.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  useTheme,
  radii,
  spacing,
  typography,
  colors as staticColors,
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
export interface LinearProgressProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Bar fill color — defaults to accentBlue */
  color?: string;
  /** Bar height in pixels — defaults to 4 */
  height?: number;
  /** Show percentage label to the right */
  showLabel?: boolean;
  /** Animate progress changes */
  animated?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// ── Component ────────────────────────────────────────────────────
const LinearProgressComponent: React.FC<LinearProgressProps> = ({
  progress,
  color,
  height = 4,
  showLabel = false,
  animated = true,
  style,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const c = theme.colors;

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const barColor = color ?? c.accentBlue;
  const barColorEnd = color ?? c.accentBlueLight;

  const progressAnim = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressAnim.value = withTiming(clampedProgress / 100, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progressAnim.value = clampedProgress / 100;
    }
  }, [clampedProgress, animated, progressAnim]);

  const barAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityLabel={accessibilityLabel ?? `Progress: ${Math.round(clampedProgress)}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress) }}
    >
      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: c.bgTertiary,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            barAnimatedStyle,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      {showLabel && (
        <Text
          style={[
            typography.caption.style,
            {
              color: c.textSecondary,
              marginTop: spacing.xs,
              textAlign: 'right',
            },
          ]}
        >
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    maxWidth: '100%',
  },
});

export const LinearProgress = React.memo(LinearProgressComponent);
export default LinearProgress;
