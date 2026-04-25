/**
 * SaveState Design System — Avatar Component
 *
 * 3 variants: default, withLevelRing, withStatusDot
 * Shows initials fallback when no image URI is provided.
 * Level ring uses animated SVG stroke-dasharray.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  useEffect,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import {
  useTheme,
  radii,
  spacing,
  typography,
  fontFamilies,
  colors as staticColors,
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
type AvatarVariant = 'default' | 'withLevelRing' | 'withStatusDot';
type AvatarSize = 'sm' | 'md' | 'lg';
type StatusType = 'online' | 'away' | 'offline';

export interface AvatarProps {
  variant?: AvatarVariant;
  uri?: string;
  name?: string;
  size?: AvatarSize;
  accentColor?: string;
  level?: number;
  status?: StatusType;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// ── Size Tokens ──────────────────────────────────────────────────
const sizeMap: Record<AvatarSize, number> = {
  sm: 40,
  md: 48,
  lg: 64,
};

const statusColorMap: Record<StatusType, string> = {
  online: staticColors.success,
  away: staticColors.warning,
  offline: staticColors.neutral,
};

// ── Animated Circle for SVG ──────────────────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── Helpers ──────────────────────────────────────────────────────
function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

// ── Component ────────────────────────────────────────────────────
const AvatarComponent: React.FC<AvatarProps> = ({
  variant = 'default',
  uri,
  name,
  size = 'md',
  accentColor,
  level,
  status,
  style,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const c = theme.colors;

  const dimension = sizeMap[size];
  const hasImage = !!uri;
  const initials = useMemo(() => getInitials(name ?? ''), [name]);

  // Ring animation for withLevelRing
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    if (variant === 'withLevelRing' && level !== undefined) {
      ringProgress.value = withTiming(Math.min(level / 100, 1), { duration: 800 });
    }
  }, [variant, level, ringProgress]);

  const ringRadius = dimension / 2 + 4;
  const ringStrokeWidth = 3;
  const ringCircumference = 2 * Math.PI * ringRadius;

  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: ringCircumference * (1 - ringProgress.value),
  }));

  // ── Status dot color ───────────────────────────────────────────
  const statusColor = status ? statusColorMap[status] : undefined;
  const statusDotSize = size === 'sm' ? 10 : size === 'md' ? 12 : 14;

  // ── Accent color fallback ──────────────────────────────────────
  const bgColor = accentColor ?? c.accentPurple;

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityLabel={accessibilityLabel ?? (name ? `Avatar of ${name}` : 'Avatar')}
      accessibilityRole="image"
    >
      {/* Level ring */}
      {variant === 'withLevelRing' && level !== undefined && (
        <View style={[styles.ringContainer, { width: dimension + ringStrokeWidth * 2 + 8, height: dimension + ringStrokeWidth * 2 + 8 }]}>
          <Svg width="100%" height="100%">
            {/* Background ring */}
            <Circle
              cx="50%"
              cy="50%"
              r={ringRadius}
              stroke={c.borderDefault}
              strokeWidth={ringStrokeWidth}
              fill="none"
              strokeLinecap="round"
            />
            {/* Animated progress ring */}
            <AnimatedCircle
              cx="50%"
              cy="50%"
              r={ringRadius}
              stroke={c.accentBlueLight}
              strokeWidth={ringStrokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              animatedProps={animatedRingProps}
              rotation="-90"
              origin="50% 50%"
            />
          </Svg>
          {/* Level badge */}
          <View
            style={[
              styles.levelBadge,
              {
                bottom: -4,
                right: -4,
                backgroundColor: c.accentBlue,
              },
            ]}
          >
            <Text style={[typography.caption.style, { color: c.textPrimary, fontSize: 8, fontWeight: '700' }]}>
              {level}
            </Text>
          </View>
        </View>
      )}

      {/* Avatar body */}
      <View
        style={[
          styles.avatarBody,
          {
            width: dimension,
            height: dimension,
            borderRadius: radii.full,
            backgroundColor: hasImage ? c.bgTertiary : bgColor,
          },
        ]}
      >
        {hasImage ? (
          <Image
            source={{ uri }}
            style={{ width: dimension, height: dimension, borderRadius: radii.full }}
            contentFit="cover"
            accessibilityLabel={name ?? 'Avatar image'}
          />
        ) : (
          <Text
            style={[
              styles.initials,
              {
                fontSize: dimension * 0.35,
                color: c.textPrimary,
                fontFamily: fontFamilies.display,
                fontWeight: '700',
              },
            ]}
          >
            {initials}
          </Text>
        )}
      </View>

      {/* Status dot */}
      {variant === 'withStatusDot' && status && statusColor && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusDotSize,
              height: statusDotSize,
              borderRadius: statusDotSize / 2,
              backgroundColor: statusColor,
              borderWidth: 2,
              borderColor: c.bgPrimary,
              bottom: -1,
              right: -1,
            },
          ]}
        />
      )}
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  avatarBody: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    textAlign: 'center',
    lineHeight: undefined,
  },
  levelBadge: {
    position: 'absolute',
    minWidth: 16,
    height: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 2,
  },
  statusDot: {
    position: 'absolute',
    zIndex: 2,
  },
});

export const Avatar = React.memo(AvatarComponent);
export default Avatar;
