/**
 * XPBadge — Shows XP earned or total XP with optional animation.
 *
 * Features: accentGreen background, mono font, animated fade-in + slide-up.
 */

import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme, createStyles } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
export type XPBadgeSize = 'sm' | 'md' | 'lg';

export interface XPBadgeProps {
  amount: number;
  animated?: boolean;
  size?: XPBadgeSize;
}

// ── Size config ────────────────────────────────────────────────
const SIZE_CONFIG: Record<
  XPBadgeSize,
  { paddingHorizontal: number; paddingVertical: number; fontSize: number }
> = {
  sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 8 },
  md: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 11 },
  lg: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 13 },
};

// ── Component ──────────────────────────────────────────────────
export function XPBadge({
  amount,
  animated = false,
  size = 'md',
}: XPBadgeProps) {
  const theme = useTheme();
  const styles = useXPBadgeStyles(theme);
  const sizeConfig = SIZE_CONFIG[size];

  const opacity = useSharedValue(animated ? 0 : 1);
  const translateY = useSharedValue(animated ? 12 : 0);

  useEffect(() => {
    if (!animated) return;
    opacity.value = 0;
    translateY.value = 12;

    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    translateY.value = withTiming(0, {
      duration: 450,
      easing: Easing.out(Easing.back(1.2)),
    });
  }, [animated, amount, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const displayAmount = amount >= 0 ? `+${amount}` : `${amount}`;

  return (
    <Animated.View style={[animatedStyle]}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: `${theme.colors.accentGreen}18`,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            paddingVertical: sizeConfig.paddingVertical,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: theme.colors.accentGreen,
              fontSize: sizeConfig.fontSize,
            },
          ]}
        >
          {displayAmount} XP
        </Text>
      </View>
    </Animated.View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useXPBadgeStyles = createStyles((theme) =>
  StyleSheet.create({
    badge: {
      borderRadius: theme.semanticRadii.chipRadius,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${theme.colors.accentGreen}30`,
    } as any,
    text: {
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
      letterSpacing: 0.5,
    } as any,
  }),
);
