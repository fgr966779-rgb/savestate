/**
 * SaveState Design System — Skeleton
 *
 * Loading placeholder with shimmer animation.
 * 4 variants: card, listItem, avatar, chart.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  useTheme,
  spacing,
  semanticRadii,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

type SkeletonVariant = 'card' | 'listItem' | 'avatar' | 'chart';

interface SkeletonProps {
  /** Visual variant that determines the layout shape */
  variant: SkeletonVariant;
  /** Override width (theme-aware default varies by variant) */
  width?: number;
  /** Override height (theme-aware default varies by variant) */
  height?: number;
  /** Additional style overrides */
  style?: ViewStyle;
}

// ── Shimmer animation component ──────────────────────────────────

interface ShimmerProps {
  style: ViewStyle;
}

const ShimmerView: React.FC<ShimmerProps> = ({ style }) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerValue]);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  return (
    <View style={[style, styles.clipOverflow]}>
      <Animated.View
        style={[
          styles.shimmerGradient,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

// ── Variant renderers ────────────────────────────────────────────

const SkeletonCard: React.FC<{ theme: ReturnType<typeof useTheme> }> = ({ theme }) => (
  <View
    style={[
      styles.cardContainer,
      {
        backgroundColor: theme.colors.bgTertiary,
        borderRadius: semanticRadii.cardRadius,
      },
    ]}
    accessible
    accessibilityLabel="Loading card"
    accessibilityRole="text"
  >
    {/* Image placeholder */}
    <ShimmerView
      style={{
        height: 120,
        width: '100%',
        borderTopLeftRadius: semanticRadii.cardRadius,
        borderTopRightRadius: semanticRadii.cardRadius,
      }}
    />
    {/* Title placeholder */}
    <View style={[styles.cardBody, { paddingHorizontal: spacing.base }]}>
      <ShimmerView
        style={{
          height: 14,
          width: '70%',
          borderRadius: 4,
          marginTop: spacing.md,
        }}
      />
      {/* Subtitle placeholder */}
      <ShimmerView
        style={{
          height: 10,
          width: '50%',
          borderRadius: 4,
          marginTop: spacing.sm,
        }}
      />
      {/* Action row */}
      <View style={[styles.cardActionRow, { marginTop: spacing.base }]}>
        <ShimmerView style={{ height: 12, width: 80, borderRadius: 4 }} />
        <ShimmerView style={{ height: 12, width: 40, borderRadius: 4 }} />
      </View>
    </View>
  </View>
);

const SkeletonListItem: React.FC<{ theme: ReturnType<typeof useTheme> }> = ({ theme }) => (
  <View
    style={[
      styles.listItemContainer,
      {
        backgroundColor: theme.colors.bgTertiary,
        borderRadius: semanticRadii.buttonRadius,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
      },
    ]}
    accessible
    accessibilityLabel="Loading list item"
    accessibilityRole="text"
  >
    {/* Avatar placeholder */}
    <ShimmerView
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
      }}
    />
    {/* Text placeholders */}
    <View style={{ flex: 1, marginLeft: spacing.sm }}>
      <ShimmerView
        style={{ height: 14, width: '65%', borderRadius: 4 }}
      />
      <ShimmerView
        style={{ height: 10, width: '40%', borderRadius: 4, marginTop: spacing.sm }}
      />
    </View>
    {/* Right detail */}
    <ShimmerView
      style={{ height: 14, width: 50, borderRadius: 4 }}
    />
  </View>
);

const SkeletonAvatar: React.FC<{ theme: ReturnType<typeof useTheme>; width?: number; height?: number }> = ({
  theme,
  width,
  height,
}) => {
  const size = width ?? height ?? 48;
  return (
    <View accessible accessibilityLabel="Loading avatar" accessibilityRole="img">
      <ShimmerView
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    </View>
  );
};

const SkeletonChart: React.FC<{ theme: ReturnType<typeof useTheme> }> = ({ theme }) => (
  <View
    style={[
      styles.chartContainer,
      {
        backgroundColor: theme.colors.bgTertiary,
        borderRadius: semanticRadii.cardRadius,
        padding: spacing.base,
      },
    ]}
    accessible
    accessibilityLabel="Loading chart"
    accessibilityRole="text"
  >
    {/* Header row */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
      <ShimmerView style={{ height: 12, width: 80, borderRadius: 4 }} />
      <ShimmerView style={{ height: 12, width: 60, borderRadius: 4 }} />
    </View>
    {/* Bar chart bars */}
    <View style={styles.chartBars}>
      {[0.6, 0.9, 0.4, 0.75, 1.0, 0.55, 0.85].map((ratio, i) => (
        <ShimmerView
          key={i}
          style={{
            flex: 1,
            height: 80 * ratio,
            borderRadius: 4,
            marginLeft: i > 0 ? 6 : 0,
          }}
        />
      ))}
    </View>
  </View>
);

// ── Main Component ───────────────────────────────────────────────

const Skeleton: React.FC<SkeletonProps> = ({
  variant,
  width,
  height,
  style,
}) => {
  const theme = useTheme();

  switch (variant) {
    case 'card':
      return <SkeletonCard theme={theme} />;
    case 'listItem':
      return <SkeletonListItem theme={theme} />;
    case 'avatar':
      return <SkeletonAvatar theme={theme} width={width} height={height} />;
    case 'chart':
      return <SkeletonChart theme={theme} />;
    default:
      return <SkeletonCard theme={theme} />;
  }
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  clipOverflow: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  shimmerGradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 150,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
  },
  cardContainer: {
    overflow: 'hidden',
  },
  cardBody: {
    paddingBottom: spacing.md,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartContainer: {
    overflow: 'hidden',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    height: 80,
  },
});

export default React.memo(Skeleton);
export type { SkeletonProps, SkeletonVariant };
