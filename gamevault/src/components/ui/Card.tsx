/**
 * SaveState Design System — Card Component
 *
 * 5 variants: default, elevated, outlined, glowing, achievement
 * Supports selected state, press animations, and haptic feedback.
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import {
  useTheme,
  triggerHaptic,
  radii,
  spacing,
  borderWidths,
  applyShadow,
  colors as staticColors,
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
type CardVariant = 'default' | 'elevated' | 'outlined' | 'glowing' | 'achievement';

export interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  selected?: boolean;
  accessibilityLabel?: string;
}

// ── Component ────────────────────────────────────────────────────
const CardComponent: React.FC<CardProps> = ({
  variant = 'default',
  children,
  style,
  onPress,
  selected = false,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const c = theme.colors;
  const scaleAnim = useSharedValue(1);
  const glowOpacity = useSharedValue(selected ? 0.8 : 0.3);

  const isPressable = !!onPress;

  const handlePressIn = useCallback(() => {
    scaleAnim.value = withSpring(0.97, { damping: 15, stiffness: 400, mass: 1 });
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 400, mass: 1 });
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    triggerHaptic('buttonPress');
    onPress?.();
  }, [onPress]);

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  // ── Animated glow shimmer for "glowing" variant ────────────────
  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  React.useEffect(() => {
    if (variant === 'glowing') {
      glowOpacity.value = withRepeat(
        withSequence(
          withSpring(0.8, { damping: 6, stiffness: 80 }),
          withSpring(0.3, { damping: 6, stiffness: 80 }),
        ),
        -1,
        true,
      );
    }
  }, [variant, glowOpacity]);

  // ── Variant base styles ────────────────────────────────────────
  const getVariantContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      padding: spacing.lg,
      borderRadius: radii.lg,
    };

    switch (variant) {
      case 'default':
        return {
          ...base,
          backgroundColor: c.bgSecondary,
          borderWidth: borderWidths.thin,
          borderColor: c.borderSubtle,
          ...applyShadow('elevation2'),
        };

      case 'elevated':
        return {
          ...base,
          backgroundColor: c.bgSecondary,
          borderWidth: borderWidths.thin,
          borderColor: c.borderSubtle,
          ...applyShadow('elevation3'),
        };

      case 'outlined':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: borderWidths.medium,
          borderColor: selected ? c.borderAccent : c.borderDefault,
          ...(selected ? applyShadow('glowAccent') : {}),
        };

      case 'glowing':
        return {
          ...base,
          backgroundColor: c.bgSecondary,
          borderWidth: borderWidths.medium,
          borderColor: c.borderAccent,
          ...applyShadow('glowAccent'),
        };

      case 'achievement':
        return {
          ...base,
          backgroundColor: c.bgSecondary,
          borderWidth: borderWidths.medium,
          borderColor: c.accentGold,
          ...applyShadow('glowGold'),
        };

      default:
        return {
          ...base,
          backgroundColor: c.bgSecondary,
          borderWidth: borderWidths.thin,
          borderColor: c.borderSubtle,
          ...applyShadow('elevation2'),
        };
    }
  };

  const containerStyle = getVariantContainerStyle();

  // ── Render achievement sparkle overlay ─────────────────────────
  const renderSparkleOverlay = () => {
    if (variant !== 'achievement') return null;
    return (
      <View style={styles.sparkleContainer} pointerEvents="none">
        <View style={[styles.sparkle, { top: spacing.sm, right: spacing.md, backgroundColor: c.accentGold }]} />
        <View style={[styles.sparkle, styles.sparkleMd, { top: spacing.md, right: spacing.lg, backgroundColor: c.accentGold }]} />
        <View style={[styles.sparkle, styles.sparkleSm, { bottom: spacing.sm, left: spacing.md, backgroundColor: c.accentGold }]} />
      </View>
    );
  };

  // ── Wrapper: Pressable or static View ──────────────────────────
  const content = (
    <Animated.View style={[containerStyle, animatedScale, style]}>
      {renderSparkleOverlay()}
      {children}
    </Animated.View>
  );

  if (isPressable) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible
        accessibilityLabel={accessibilityLabel ?? 'Card'}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 9999,
    opacity: 0.7,
  },
  sparkleMd: {
    width: 8,
    height: 8,
    opacity: 0.5,
  },
  sparkleSm: {
    width: 4,
    height: 4,
    opacity: 0.4,
  },
});

export const Card = React.memo(CardComponent);
export default Card;
