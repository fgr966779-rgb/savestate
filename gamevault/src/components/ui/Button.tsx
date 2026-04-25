/**
 * SaveState Design System — Button Component
 *
 * 6 variants: primary, secondary, ghost, danger, iconOnly, fab
 * 3 sizes: sm (32h), md (44h), lg (52h)
 * Press animation via Reanimated scale(0.97), haptic feedback.
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  useTheme,
  triggerHaptic,
  radii,
  semanticRadii,
  borderWidths,
  colors,
  typography,
  fontFamilies,
  fontSizes,
  spacing,
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'iconOnly' | 'fab';
type ButtonSize = 'sm' | 'md' | 'lg';
type IconPosition = 'left' | 'right';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  icon?: React.ReactElement;
  iconPosition?: IconPosition;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityRole?: string;
}

// ── Size Tokens ──────────────────────────────────────────────────
const sizeMap: Record<ButtonSize, { height: number; paddingHorizontal: number; typoKey: 'buttonSmall' | 'buttonMedium' | 'buttonLarge' }> = {
  sm: { height: 32, paddingHorizontal: spacing.md, typoKey: 'buttonSmall' },
  md: { height: 44, paddingHorizontal: spacing.base, typoKey: 'buttonMedium' },
  lg: { height: 52, paddingHorizontal: spacing.lg, typoKey: 'buttonLarge' },
};

// ── Component ────────────────────────────────────────────────────
const ButtonComponent: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  label,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onPress,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
}) => {
  const theme = useTheme();
  const c = theme.colors;
  const scaleAnim = useSharedValue(1);

  const sizeToken = sizeMap[size];

  const handlePressIn = useCallback(() => {
    scaleAnim.value = withSpring(0.97, { damping: 15, stiffness: 400, mass: 1 });
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 400, mass: 1 });
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    triggerHaptic('buttonPress');
    onPress?.();
  }, [disabled, loading, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  // ── Variant Styles ─────────────────────────────────────────────
  const getVariantStyle = (): {
    container: ViewStyle;
    gradientColors: readonly [string, string] | null;
    text: TextStyle;
  } => {
    const typo = typography[sizeToken.typoKey].style;

    switch (variant) {
      case 'primary':
        return {
          container: {
            borderRadius: radii.md,
            borderWidth: 0,
          },
          gradientColors: c.gradientPrimary,
          text: { color: c.textPrimary, ...typo },
        };
      case 'secondary':
        return {
          container: {
            borderRadius: radii.md,
            borderWidth: borderWidths.medium,
            borderColor: c.borderDefault,
            backgroundColor: 'transparent',
          },
          gradientColors: null,
          text: { color: c.textPrimary, ...typo },
        };
      case 'ghost':
        return {
          container: {
            borderRadius: radii.md,
            borderWidth: 0,
            backgroundColor: 'transparent',
          },
          gradientColors: null,
          text: { color: c.textSecondary, ...typo },
        };
      case 'danger':
        return {
          container: {
            borderRadius: radii.md,
            borderWidth: 0,
          },
          gradientColors: [c.accentRed, '#FF6B3B'] as const,
          text: { color: c.textPrimary, ...typo },
        };
      case 'iconOnly':
        return {
          container: {
            borderRadius: semanticRadii.fabRadius,
            borderWidth: 0,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          },
          gradientColors: c.gradientPrimary,
          text: { color: c.textPrimary, ...typo },
        };
      case 'fab':
        return {
          container: {
            borderRadius: semanticRadii.fabRadius,
            borderWidth: 0,
            width: 56,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
          },
          gradientColors: c.gradientPrimary,
          text: { color: c.textPrimary, ...typo },
        };
      default:
        return {
          container: {
            borderRadius: radii.md,
            borderWidth: 0,
          },
          gradientColors: c.gradientPrimary,
          text: { color: c.textPrimary, ...typo },
        };
    }
  };

  const { container: variantContainer, gradientColors, text: textStyle } = getVariantStyle();

  const isInteractive = !disabled && !loading;
  const opacity = disabled ? 0.5 : 1;

  // ── Gradient or solid background ───────────────────────────────
  const renderContent = () => {
    const elements: React.ReactNode[] = [];

    if (loading) {
      elements.push(
        <ActivityIndicator
          key="spinner"
          size="small"
          color={c.textPrimary}
        />,
      );
    } else if (icon && (variant === 'iconOnly' || variant === 'fab')) {
      elements.push(
        <View key="icon" style={styles.iconOnlyWrapper}>
          {icon}
        </View>,
      );
    } else {
      if (icon && iconPosition === 'left') {
        elements.push(<View key="icon-left" style={styles.iconWrapper}>{icon}</View>);
      }
      if (variant !== 'iconOnly' && variant !== 'fab') {
        elements.push(
          <Animated.Text
            key="label"
            style={[textStyle, disabled && { color: c.textDisabled }]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>,
        );
      }
      if (icon && iconPosition === 'right') {
        elements.push(<View key="icon-right" style={styles.iconWrapper}>{icon}</View>);
      }
    }

    return elements;
  };

  const innerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: variant === 'iconOnly' ? 44 : variant === 'fab' ? 56 : sizeToken.height,
    paddingHorizontal: variant === 'iconOnly' || variant === 'fab' ? 0 : sizeToken.paddingHorizontal,
    borderRadius: variantContainer.borderRadius,
    opacity,
    borderWidth: variantContainer.borderWidth,
    borderColor: (variantContainer as ViewStyle & { borderColor?: string }).borderColor,
    backgroundColor:
      variant === 'secondary'
        ? 'transparent'
        : variant === 'ghost'
          ? 'transparent'
          : undefined,
  };

  // For primary / danger / iconOnly / fab — render a gradient background
  if (gradientColors && variant !== 'ghost' && variant !== 'secondary') {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={isInteractive ? handlePressIn : undefined}
        onPressOut={isInteractive ? handlePressOut : undefined}
        disabled={disabled || loading}
        accessible
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
          <Animated.View
            style={[
              innerStyle,
              {
                overflow: 'hidden',
              },
            ]}
          >
            <Animated.View
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: innerStyle.borderRadius,
                backgroundColor: gradientColors[0],
              }}
            />
            <Animated.View style={styles.contentRow}>
              {renderContent()}
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  }

  // For secondary / ghost — no gradient
  return (
    <Pressable
      onPress={handlePress}
      onPressIn={isInteractive ? handlePressIn : undefined}
      onPressOut={isInteractive ? handlePressOut : undefined}
      disabled={disabled || loading}
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <Animated.View style={[animatedStyle, innerStyle, fullWidth && styles.fullWidth]}>
        {renderContent()}
      </Animated.View>
    </Pressable>
  );
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  iconWrapper: {
    marginRight: spacing.sm,
  },
  iconOnlyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

export const Button = React.memo(ButtonComponent);
export default Button;
