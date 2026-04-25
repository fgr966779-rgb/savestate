/**
 * SaveState Design System — Wave Progress Component
 *
 * Animated wave fill rising from bottom based on progress value.
 * Uses Reanimated + SVG path animation for a fluid wave effect.
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop, ClipPath, Rect } from 'react-native-svg';
import {
  useTheme,
  radii,
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
export interface WaveProgressProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Container height in pixels — default 120 */
  height?: number;
  /** Wave fill color — defaults to accentBlue */
  color?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// ── Animated Path ────────────────────────────────────────────────
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// ── Generate wave SVG path ───────────────────────────────────────
function buildWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phase: number,
  baseY: number,
): string {
  const points: string[] = [];
  const step = 2;

  for (let x = 0; x <= width; x += step) {
    const y = baseY + amplitude * Math.sin((x / width) * Math.PI * frequency + phase);
    points.push(`L ${x} ${y}`);
  }

  points.push(`L ${width} ${height}`);
  points.push(`L 0 ${height}`);
  points.push('Z');

  return `M 0 ${baseY + amplitude * Math.sin(phase)} ${points.join(' ')}`;
}

// ── Component ────────────────────────────────────────────────────
const WaveProgressComponent: React.FC<WaveProgressProps> = ({
  progress,
  height = 120,
  color,
  style,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const c = theme.colors;

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const waveColor = color ?? c.accentBlue;
  const waveColorEnd = color ?? c.accentBlueLight;
  const waveWidth = height; // Square wave container

  const fillLevel = useSharedValue(height); // Y position — lower = more filled
  const wavePhase = useSharedValue(0);

  useEffect(() => {
    const targetY = height - (clampedProgress / 100) * height;
    fillLevel.value = withTiming(targetY, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // Continuous wave oscillation
    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [clampedProgress, height, fillLevel, wavePhase]);

  const animatedPathProps = useAnimatedProps(() => {
    const baseY = fillLevel.value;
    const phase = wavePhase.value;
    const amplitude = 6;
    const frequency = 2;
    const path = buildWavePath(waveWidth, height, amplitude, frequency, phase, baseY);
    return { d: path };
  });

  // Background wave (offset phase for depth)
  const bgPhase = useSharedValue(Math.PI);

  useEffect(() => {
    bgPhase.value = withRepeat(
      withTiming(Math.PI * 3, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [bgPhase]);

  const bgAnimatedPathProps = useAnimatedProps(() => {
    const baseY = fillLevel.value + 8;
    const phase = bgPhase.value;
    const amplitude = 4;
    const frequency = 1.5;
    const path = buildWavePath(waveWidth, height, amplitude, frequency, phase, baseY);
    return { d: path };
  });

  const gradientId = 'waveProgressGrad';
  const clipId = 'waveClip';

  return (
    <View
      style={[
        styles.container,
        {
          width: waveWidth,
          height,
          borderRadius: radii.md,
          backgroundColor: c.bgTertiary,
        },
        style,
      ]}
      accessible
      accessibilityLabel={accessibilityLabel ?? `Wave progress: ${Math.round(clampedProgress)}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress) }}
    >
      <Svg
        width={waveWidth}
        height={height}
        style={[styles.svg, { borderRadius: radii.md }]}
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={waveColorEnd} stopOpacity={0.8} />
            <Stop offset="100%" stopColor={waveColor} stopOpacity={0.5} />
          </LinearGradient>
          <ClipPath id={clipId}>
            <Rect x="0" y="0" width={waveWidth} height={height} rx={radii.md} ry={radii.md} />
          </ClipPath>
        </Defs>

        <G clipPath={`url(#${clipId})`}>
          {/* Background wave layer (darker / offset) */}
          <AnimatedPath
            animatedProps={bgAnimatedPathProps}
            fill={waveColor}
            fillOpacity={0.15}
          />

          {/* Foreground wave */}
          <AnimatedPath
            animatedProps={animatedPathProps}
            fill={`url(#${gradientId})`}
          />
        </G>
      </Svg>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
  },
});

export const WaveProgress = React.memo(WaveProgressComponent);
export default WaveProgress;
