/**
 * SaveState Design System — Chip
 *
 * Compact selectable tag / filter chip.
 * 28px height, 12px radius, tertiary bg by default.
 * Selected state: accent blue bg with white text.
 */

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import {
  useTheme,
  spacing,
  semanticRadii,
  typography,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface ChipProps {
  /** Display label */
  label: string;
  /** Whether the chip is selected */
  selected: boolean;
  /** Press handler */
  onPress: () => void;
  /** Optional icon text (emoji) rendered before the label */
  icon?: string;
  /** Additional style overrides */
  style?: ViewStyle;
  /** Whether the chip is disabled */
  disabled?: boolean;
}

// ── Component ────────────────────────────────────────────────────

const Chip: React.FC<ChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  style,
  disabled = false,
}) => {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.95,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 15,
      stiffness: 250,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const isActive = selected && !disabled;
  const bgColor = isActive
    ? theme.colors.accentBlue
    : theme.colors.bgTertiary;
  const textColor = isActive
    ? theme.colors.textPrimary
    : theme.colors.textSecondary;
  const opacity = disabled ? 0.5 : 1;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            borderRadius: semanticRadii.chipRadius,
            paddingHorizontal: spacing.md,
            height: 28,
            opacity,
            transform: [{ scale }],
          },
          style,
        ]}
      >
        {icon ? (
          <Text style={[styles.icon, { marginRight: spacing.xs }]}>{icon}</Text>
        ) : null}
        <Text
          style={[
            typography.labelMedium.style,
            { color: textColor, fontSize: 12 },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderWidth: 0,
  },
  icon: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default React.memo(Chip);
export type { ChipProps };
