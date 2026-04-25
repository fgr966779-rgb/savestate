/**
 * PullToRefresh — Custom pull-to-refresh with gaming coin spinner.
 *
 * Features: custom animated coin spinning indicator instead of default RefreshControl,
 * smooth spring-based pull gesture, gaming-themed visual feedback.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  type ScrollViewProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme, createStyles } from '@/constants/theme';
import { triggerHaptic } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
export interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  refreshing: boolean;
  children: React.ReactNode;
}

// ── Constants ──────────────────────────────────────────────────
const REFRESH_THRESHOLD = 80;
const INDICATOR_SIZE = 40;
const MAX_PULL = 120;

// ── Coin Spinner Indicator ─────────────────────────────────────
function CoinSpinner({ refreshing }: { refreshing: boolean }) {
  const theme = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const bounce = useSharedValue(0);

  React.useEffect(() => {
    if (refreshing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 800, easing: Easing.linear }),
        -1,
        false,
      );
      scale.value = withSpring(1.15, { damping: 8, stiffness: 200 });
      bounce.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
        false,
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 180 });
      bounce.value = withTiming(0, { duration: 200 });
    }
  }, [refreshing, rotation, scale, bounce]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
      { translateY: bounce.value * -4 },
    ],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + bounce.value * 0.1 }],
    opacity: 0.3 + bounce.value * 0.2,
  }));

  return (
    <View style={styles.indicatorContainer}>
      <Animated.View style={[styles.indicatorTrack, trackStyle]}>
        <View style={[styles.indicatorTrackBg, { borderColor: theme.colors.accentGold }]} />
      </Animated.View>
      <Animated.View style={[styles.indicatorCoin, animatedStyle]}>
        <Animated.Text style={styles.coinEmoji}>🪙</Animated.Text>
      </Animated.View>
    </View>
  );
}

// ── Component ──────────────────────────────────────────────────
export function PullToRefresh({
  onRefresh,
  refreshing,
  children,
}: PullToRefreshProps) {
  const theme = useTheme();
  const styles = usePullToRefreshStyles(theme);
  const scrollRef = useRef<ScrollView>(null);

  const isRefreshing = useSharedValue(refreshing);
  const pullDistance = useSharedValue(0);

  React.useEffect(() => {
    isRefreshing.value = refreshing;
    if (!refreshing) {
      pullDistance.value = withSpring(0, { damping: 20, stiffness: 180 });
    }
  }, [refreshing, isRefreshing, pullDistance]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    triggerHaptic('coinSpin');
    await onRefresh();
  }, [refreshing, onRefresh]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      const offsetY = event.contentOffsetY;
      if (offsetY <= 0 && !isRefreshing.value) {
        pullDistance.value = Math.min(Math.abs(offsetY), MAX_PULL);
      }
    },
    onEndDrag: (event) => {
      'worklet';
      const velocity = event.velocity?.y ?? 0;
      if (pullDistance.value > REFRESH_THRESHOLD || velocity > 800) {
        pullDistance.value = withSpring(REFRESH_THRESHOLD, {
          damping: 15,
          stiffness: 150,
        });
        if (!isRefreshing.value) {
          runOnJS(handleRefresh)();
        }
      } else {
        pullDistance.value = withSpring(0, {
          damping: 20,
          stiffness: 180,
        });
      }
    },
    onMomentumEnd: () => {
      'worklet';
      if (pullDistance.value > REFRESH_THRESHOLD && !isRefreshing.value) {
        runOnJS(handleRefresh)();
      }
    },
  });

  const headerTranslateY = useAnimatedStyle(() => ({
    height: pullDistance.value,
    opacity: interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.bgPrimary }]}>
      {/* Pull indicator area */}
      <Animated.View style={[styles.headerArea, headerTranslateY]}>
        <CoinSpinner refreshing={refreshing} />
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={onScroll}
        bounces={true}
        overScrollMode="never"
        contentContainerStyle={[
          refreshing && { paddingTop: REFRESH_THRESHOLD },
        ]}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  headerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  indicatorContainer: {
    width: INDICATOR_SIZE + 16,
    height: INDICATOR_SIZE + 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicatorTrack: {
    position: 'absolute',
    width: INDICATOR_SIZE + 16,
    height: INDICATOR_SIZE + 16,
    borderRadius: (INDICATOR_SIZE + 16) / 2,
  },
  indicatorTrackBg: {
    borderWidth: 2,
    borderRadius: (INDICATOR_SIZE + 16) / 2,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  indicatorCoin: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinEmoji: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
});

const usePullToRefreshStyles = createStyles((theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    } as any,
    headerArea: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    } as any,
    scrollView: {
      flex: 1,
    } as any,
  }),
);
