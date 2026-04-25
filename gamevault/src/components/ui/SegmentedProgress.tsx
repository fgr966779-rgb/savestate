/**
 * SaveState Design System — Segmented Progress Component
 *
 * Multi-segment horizontal bar for dual goal display.
 * Each segment has its own value, color, and label.
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
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
export interface Segment {
  value: number;
  color: string;
  label: string;
}

export interface SegmentedProgressProps {
  segments: Segment[];
  height?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// ── Animated Segment Bar ─────────────────────────────────────────
interface SegmentBarProps {
  widthPercent: number;
  color: string;
  height: number;
  isFirst: boolean;
}

const SegmentBar: React.FC<SegmentBarProps> = React.memo(
  ({ widthPercent, color, height, isFirst }) => {
    const widthAnim = useSharedValue(0);

    useEffect(() => {
      widthAnim.value = withTiming(widthPercent, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
    }, [widthPercent, widthAnim]);

    const animatedStyle = useAnimatedStyle(() => ({
      width: `${widthAnim.value}%`,
    }));

    return (
      <Animated.View
        style={[
          styles.segment,
          animatedStyle,
          {
            backgroundColor: color,
            height,
            borderRadius: isFirst ? { topLeft: height / 2, bottomLeft: height / 2 } : 0,
          },
        ]}
      />
    );
  },
);

SegmentBar.displayName = 'SegmentBar';

// ── Component ────────────────────────────────────────────────────
const SegmentedProgressComponent: React.FC<SegmentedProgressProps> = ({
  segments,
  height = 8,
  style,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const c = theme.colors;

  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  // Build description for a11y
  const a11yDesc =
    accessibilityLabel ??
    segments.map((s) => `${s.label}: ${s.value}`).join(', ');

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityLabel={a11yDesc}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(total) }}
    >
      {/* Bar */}
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
        {total > 0
          ? segments.map((segment, index) => {
              const widthPercent = total > 0 ? (segment.value / total) * 100 : 0;
              const isLast = index === segments.length - 1;
              return (
                <View key={segment.label} style={styles.segmentWrapper}>
                  <SegmentBar
                    widthPercent={widthPercent}
                    color={segment.color}
                    height={height}
                    isFirst={index === 0}
                  />
                </View>
              );
            })
          : null}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        {segments.map((segment) => (
          <View key={segment.label} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: segment.color,
                },
              ]}
            />
            <Text
              style={[
                typography.caption.style,
                {
                  color: c.textSecondary,
                },
              ]}
            >
              {segment.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segmentWrapper: {
    flexDirection: 'row',
    height: '100%',
  },
  segment: {
    height: '100%',
    maxWidth: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export const SegmentedProgress = React.memo(SegmentedProgressComponent);
export default SegmentedProgress;
