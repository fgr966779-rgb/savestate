/**
 * SaveState Design System — Badge Component
 *
 * 5 variants: level, xp, achievement, status, notification
 * XP variant has fade-in animation. Notification shows "99+" for large counts.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  useTheme,
  radii,
  spacing,
  typography,
  fontFamilies,
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
type BadgeVariant = 'level' | 'xp' | 'achievement' | 'status' | 'notification';
type StatusType = 'success' | 'error' | 'warning' | 'info';

export interface BadgeProps {
  variant?: BadgeVariant;
  text?: string;
  count?: number;
  status?: StatusType;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// ── Component ────────────────────────────────────────────────────
const BadgeComponent: React.FC<BadgeProps> = ({
  variant = 'level',
  text,
  count,
  status = 'info',
  style,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const c = theme.colors;

  // ── Variant styles ─────────────────────────────────────────────
  const getVariantConfig = (): {
    container: ViewStyle;
    textStyle: TextStyle;
    displayText: string;
    a11yLabel: string;
  } => {
    switch (variant) {
      case 'level': {
        const label = text ?? 'LVL 1';
        return {
          container: {
            backgroundColor: c.accentPurple,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radii.sm,
          },
          textStyle: {
            ...typography.labelMedium.style,
            fontFamily: fontFamilies.display,
            color: c.textPrimary,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.08,
          },
          displayText: label,
          a11yLabel: accessibilityLabel ?? `Level ${label}`,
        };
      }
      case 'xp': {
        const label = text ?? '+0 XP';
        return {
          container: {
            backgroundColor: c.accentGreen,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radii.sm,
            opacity: 0.9,
          },
          textStyle: {
            ...typography.labelSmall.style,
            fontFamily: fontFamilies.mono,
            color: c.bgPrimary,
            fontSize: 10,
            fontWeight: '700',
          },
          displayText: label,
          a11yLabel: accessibilityLabel ?? `Experience points: ${label}`,
        };
      }
      case 'achievement': {
        const label = text ?? 'NEW';
        return {
          container: {
            backgroundColor: c.accentGold,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radii.sm,
          },
          textStyle: {
            ...typography.labelMedium.style,
            fontFamily: fontFamilies.display,
            color: c.bgPrimary,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.12,
          },
          displayText: label,
          a11yLabel: accessibilityLabel ?? `Achievement: ${label}`,
        };
      }
      case 'status': {
        const statusColor =
          status === 'success'
            ? c.success
            : status === 'error'
              ? c.error
              : status === 'warning'
                ? c.warning
                : c.info;

        const label = text ?? status.charAt(0).toUpperCase() + status.slice(1);
        return {
          container: {
            backgroundColor: `${statusColor}20` as unknown as string,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: `${statusColor}40` as unknown as string,
          },
          textStyle: {
            ...typography.labelSmall.style,
            color: statusColor,
            fontSize: 10,
            fontWeight: '600',
          },
          displayText: label,
          a11yLabel: accessibilityLabel ?? `Status: ${label}`,
        };
      }
      case 'notification': {
        const num = count ?? 0;
        const displayNum = num > 99 ? '99+' : num > 0 ? String(num) : '';
        return {
          container: {
            backgroundColor: c.accentRed,
            minWidth: displayNum ? 20 : 8,
            height: displayNum ? 20 : 8,
            borderRadius: 9999,
            paddingHorizontal: displayNum ? 6 : 0,
            paddingVertical: 0,
            alignItems: 'center',
            justifyContent: 'center',
          },
          textStyle: {
            ...typography.caption.style,
            fontFamily: fontFamilies.body,
            color: c.textPrimary,
            fontSize: 11,
            fontWeight: '700',
          },
          displayText: displayNum,
          a11yLabel: accessibilityLabel ?? `${num} notifications`,
        };
      }
      default: {
        return {
          container: {},
          textStyle: {},
          displayText: '',
          a11yLabel: 'Badge',
        };
      }
    }
  };

  const config = getVariantConfig();

  // XP variant gets fade-in animation
  if (variant === 'xp') {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[config.container, style]}
        accessible
        accessibilityLabel={config.a11yLabel}
        accessibilityRole="text"
      >
        <Animated.Text style={config.textStyle}>{config.displayText}</Animated.Text>
      </Animated.View>
    );
  }

  return (
    <View
      style={[config.container, style]}
      accessible
      accessibilityLabel={config.a11yLabel}
      accessibilityRole="text"
    >
      <Text style={config.textStyle}>{config.displayText}</Text>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({});

export const Badge = React.memo(BadgeComponent);
export default Badge;
