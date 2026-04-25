/**
 * SaveState Design System — Input Component
 *
 * 3 variants: default, withIcon, amount
 * Focused state: accent border + glow. Error state: red border.
 */

import React, { useState, useCallback, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  ColorValue,
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
  spacing,
  borderWidths,
  applyShadow,
  typography,
  fontFamilies,
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
type InputVariant = 'default' | 'withIcon' | 'amount';

export interface InputProps {
  variant?: InputVariant;
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  icon?: React.ReactElement;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  maxLength?: number;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  style?: ViewStyle;
  accessibilityLabel?: string;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
}

// ── Component ────────────────────────────────────────────────────
const InputComponent = forwardRef<TextInput, InputProps>(
  (
    {
      variant = 'default',
      label,
      placeholder,
      value,
      onChangeText,
      icon,
      error,
      disabled = false,
      secureTextEntry = false,
      maxLength,
      returnKeyType = 'done',
      onSubmitEditing,
      style,
      accessibilityLabel,
      autoCapitalize = 'sentences',
      keyboardType = 'default',
    },
    ref,
  ) => {
    const theme = useTheme();
    const c = theme.colors;
    const [focused, setFocused] = useState(false);

    const borderAnim = useSharedValue(focused ? borderWidths.medium : borderWidths.thin);
    const glowAnim = useSharedValue(focused ? 1 : 0);

    const handleFocus = useCallback(
      (e: React.FocusEvent<TextInput>) => {
        setFocused(true);
        borderAnim.value = withSpring(borderWidths.medium, { damping: 15, stiffness: 300 });
        glowAnim.value = withSpring(1, { damping: 15, stiffness: 200 });
        triggerHaptic('buttonPress');
      },
      [borderAnim, glowAnim],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<TextInput>) => {
        setFocused(false);
        borderAnim.value = withSpring(borderWidths.thin, { damping: 15, stiffness: 300 });
        glowAnim.value = withSpring(0, { damping: 15, stiffness: 200 });
      },
      [borderAnim, glowAnim],
    );

    const animatedBorderStyle = useAnimatedStyle(() => ({
      borderWidth: borderAnim.value,
    }));

    const animatedGlowStyle = useAnimatedStyle(() => ({
      opacity: glowAnim.value,
    }));

    // ── Height by variant ─────────────────────────────────────────
    const getInputHeight = (): number => {
      switch (variant) {
        case 'amount':
          return 100;
        default:
          return 48;
      }
    };

    // ── Border color ──────────────────────────────────────────────
    const getBorderColor = (): ColorValue => {
      if (error) return c.accentRed;
      if (focused) return c.accentBlueLight;
      return c.borderDefault;
    };

    // ── Container styles ──────────────────────────────────────────
    const containerBase: ViewStyle = {
      backgroundColor: c.bgTertiary,
      borderRadius: radii.md,
      overflow: 'hidden',
    };

    const containerStyle: ViewStyle = {
      ...containerBase,
      borderWidth: borderWidths.thin,
      borderColor: getBorderColor(),
    };

    const inputHeight = getInputHeight();

    return (
      <View style={[styles.wrapper, disabled && styles.disabledWrapper, style]}>
        {/* Label */}
        {label && (
          <Text
            style={[
              typography.labelMedium.style,
              { color: error ? c.accentRed : c.textSecondary, marginBottom: spacing.xs },
            ]}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <Animated.View style={[containerStyle, animatedBorderStyle]}>
          {/* Glow overlay */}
          <Animated.View
            style={[
              styles.glowOverlay,
              animatedGlowStyle,
              {
                borderRadius: radii.md,
                backgroundColor: focused
                  ? c.borderAccent
                  : 'transparent',
              },
            ]}
          />

          <View style={[styles.inputRow, { height: inputHeight }]}>
            {/* Icon slot */}
            {variant === 'withIcon' && icon && (
              <View style={styles.iconContainer}>{icon}</View>
            )}

            {/* Currency symbol for amount variant */}
            {variant === 'amount' && (
              <Text
                style={[
                  styles.currencySymbol,
                  {
                    color: c.accentGold,
                    fontFamily: fontFamilies.mono,
                    fontSize: 32,
                  },
                ]}
              >
                ₴
              </Text>
            )}

            {/* Text Input */}
            <TextInput
              ref={ref}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={c.textTertiary}
              editable={!disabled}
              secureTextEntry={secureTextEntry}
              maxLength={maxLength}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
              autoCapitalize={autoCapitalize}
              keyboardType={variant === 'amount' ? 'decimal-pad' : keyboardType}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={[
                styles.input,
                {
                  color: error ? c.accentRed : c.textPrimary,
                  flex: 1,
                  fontFamily:
                    variant === 'amount' ? fontFamilies.mono : fontFamilies.body,
                  fontSize: variant === 'amount' ? 40 : fontSizes.md.size,
                  fontWeight: variant === 'amount' ? '700' : '400',
                },
              ]}
              accessibilityLabel={accessibilityLabel ?? label ?? placeholder ?? 'Text input'}
              accessibilityRole="text"
              accessibilityState={{ disabled }}
            />
          </View>
        </Animated.View>

        {/* Error message */}
        {error ? (
          <Text style={[typography.bodySmall.style, { color: c.accentRed, marginTop: spacing.xs }]}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  disabledWrapper: {
    opacity: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    zIndex: 1,
  },
  input: {
    flex: 1,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  iconContainer: {
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    marginRight: spacing.sm,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

InputComponent.displayName = 'Input';
export const Input = React.memo(InputComponent);
export default Input;
