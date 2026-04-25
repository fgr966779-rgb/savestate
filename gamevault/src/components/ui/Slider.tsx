/**
 * SaveState Design System — Slider
 *
 * Custom range slider with gradient track fill, tooltip above thumb,
 * and min/max labels in mono font.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useTheme,
  spacing,
  typography,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface SliderProps {
  /** Current value between min and max */
  value: number;
  /** Called when value changes */
  onValueChange: (value: number) => void;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment (default: 1) */
  step?: number;
  /** Optional label above the slider */
  label?: string;
  /** Additional style overrides */
  style?: object;
  /** Show tooltip above thumb (default: true) */
  showTooltip?: boolean;
}

// ── Constants ────────────────────────────────────────────────────

const TRACK_HEIGHT = 4;
const THUMB_SIZE = 20;
const TRACK_PADDING = THUMB_SIZE / 2;

// ── Helpers ──────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function quantize(value: number, step: number, min: number) {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
}

// ── Component ────────────────────────────────────────────────────

const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  label,
  style,
  showTooltip = true,
}) => {
  const theme = useTheme();
  const [trackLayout, setTrackLayout] = useState({ width: 0, x: 0 });
  const [showTooltipLabel, setShowTooltipLabel] = useState(false);
  const isDragging = useRef(false);

  // ── Compute fill percentage ───────────────────────────────────
  const percentage = useMemo(
    () => ((value - min) / (max - min)) * 100,
    [value, min, max],
  );

  const displayValue = useMemo(() => {
    if (Number.isInteger(step)) return Math.round(value).toString();
    return value.toFixed(1);
  }, [value, step]);

  // ── Handle drag via touch position ────────────────────────────
  const handleDrag = useCallback(
    (clientX: number) => {
      if (trackLayout.width === 0) return;
      const relativeX = clientX - trackLayout.x;
      const ratio = clamp(relativeX / trackLayout.width, 0, 1);
      const rawValue = min + ratio * (max - min);
      const snapped = quantize(rawValue, step, min);
      const final = clamp(snapped, min, max);
      onValueChange(final);
    },
    [trackLayout, min, max, step, onValueChange],
  );

  // ── Pan responder ─────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = true;
        setShowTooltipLabel(true);
      },
      onPanResponderMove: (_, gs) => {
        handleDrag(gs.moveX);
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        setShowTooltipLabel(false);
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        setShowTooltipLabel(false);
      },
    }),
  ).current;

  const onTrackLayout = useCallback(
    (e: { nativeEvent: { layout: { x: number; width: number } } }) => {
      setTrackLayout({
        x: e.nativeEvent.layout.x,
        width: e.nativeEvent.layout.width,
      });
    },
    [],
  );

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityRole="slider"
      accessibilityValue={{ min, max, now: value }}
    >
      {/* Label */}
      {label ? (
        <Text
          style={[
            typography.labelMedium.style,
            { color: theme.colors.textSecondary, marginBottom: spacing.sm },
          ]}
        >
          {label}
        </Text>
      ) : null}

      {/* Slider area */}
      <View style={styles.sliderArea}>
        {/* Min label */}
        <Text
          style={[
            typography.code.style,
            { color: theme.colors.textTertiary, fontSize: 10 },
          ]}
        >
          {Number.isInteger(step) ? min : min.toFixed(1)}
        </Text>

        {/* Track + Thumb */}
        <View style={styles.trackWrapper}>
          {/* Background track */}
          <View
            style={[
              styles.track,
              {
                height: TRACK_HEIGHT,
                borderRadius: TRACK_HEIGHT / 2,
                backgroundColor: theme.colors.bgTertiary,
              },
            ]}
            onLayout={onTrackLayout}
          />

          {/* Filled track */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                height: TRACK_HEIGHT,
                borderRadius: TRACK_HEIGHT / 2,
                backgroundColor: theme.colors.accentBlue,
                width: `${percentage}%`,
              },
            ]}
          />

          {/* Touch area + Thumb */}
          <View
            {...panResponder.panHandlers}
            style={[
              styles.thumbContainer,
              {
                left: `${percentage}%`,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                marginLeft: -THUMB_SIZE / 2,
              },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View
              style={[
                styles.thumb,
                {
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: THUMB_SIZE / 2,
                  backgroundColor: theme.colors.accentBlue,
                  borderWidth: 3,
                  borderColor: theme.colors.bgPrimary,
                  shadowColor: theme.colors.accentBlue,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
            />

            {/* Tooltip */}
            {showTooltip && showTooltipLabel ? (
              <View style={styles.tooltip}>
                <View style={styles.tooltipArrow} />
                <View
                  style={[
                    styles.tooltipContent,
                    {
                      backgroundColor: theme.colors.bgSurface,
                      borderRadius: 6,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.code.style,
                      { color: theme.colors.textPrimary, fontSize: 11 },
                    ]}
                  >
                    {displayValue}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Max label */}
        <Text
          style={[
            typography.code.style,
            { color: theme.colors.textTertiary, fontSize: 10 },
          ]}
        >
          {Number.isInteger(step) ? max : max.toFixed(1)}
        </Text>
      </View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sliderArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackWrapper: {
    flex: 1,
    justifyContent: 'center',
    height: THUMB_SIZE + 24,
    position: 'relative',
    marginHorizontal: spacing.sm,
  },
  track: {
    width: '100%',
  },
  thumbContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
  },
  tooltip: {
    position: 'absolute',
    bottom: THUMB_SIZE / 2 + 12,
    alignItems: 'center',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#22223A',
  },
  tooltipContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

export default React.memo(Slider);
export type { SliderProps };
