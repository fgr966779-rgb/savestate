/**
 * SaveState Design System — Amount Input Component
 *
 * Specialized large amount input for entering monetary values.
 * Shows currency symbol (₴), auto-formats with thousands separator,
 * triggers haptic on each digit entry.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {
  useTheme,
  triggerHaptic,
  radii,
  spacing,
  borderWidths,
  fontFamilies,
  fontSizes,
  typography,
} from '@/constants/theme';

// ── Props Interface ──────────────────────────────────────────────
export interface AmountInputProps {
  value: number;
  onChangeAmount: (amount: number) => void;
  currency?: string;
  maxValue?: number;
  label?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// ── Helpers ──────────────────────────────────────────────────────
function formatCurrency(value: number, locale: string = 'uk-UA'): string {
  if (value === 0) return '0';
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

function stripNonNumeric(raw: string): string {
  return raw.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
}

function parseAmount(raw: string): number {
  const stripped = stripNonNumeric(raw);
  if (!stripped) return 0;
  const num = parseFloat(stripped);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

// ── Component ────────────────────────────────────────────────────
const AmountInputComponent: React.FC<AmountInputProps> = ({
  value,
  onChangeAmount,
  currency = '₴',
  maxValue,
  label,
  style,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const c = theme.colors;

  const [rawInput, setRawInput] = useState(() =>
    value > 0 ? formatCurrency(value) : '',
  );
  const [focused, setFocused] = useState(false);

  // Derived formatted display value
  const displayValue = useMemo(() => {
    if (!focused && value > 0) return formatCurrency(value);
    return rawInput;
  }, [focused, value, rawInput]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    // Show raw number when focused
    if (value > 0) {
      setRawInput(String(value % 1 === 0 ? value : value.toFixed(2)));
    }
    triggerHaptic('buttonPress');
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    // Format on blur
    if (value > 0) {
      setRawInput(formatCurrency(value));
    } else {
      setRawInput('');
    }
  }, [value]);

  const handleChangeText = useCallback(
    (text: string) => {
      const stripped = stripNonNumeric(text);

      // Haptic on each digit entry
      if (stripped.length > stripNonNumeric(rawInput).length) {
        triggerHaptic('buttonPress');
      }

      setRawInput(stripped);

      const parsed = parseAmount(stripped);

      // Clamp to maxValue if provided
      const clamped = maxValue !== undefined ? Math.min(parsed, maxValue) : parsed;
      onChangeAmount(clamped);
    },
    [rawInput, onChangeAmount, maxValue],
  );

  return (
    <View style={[styles.container, style]}>
      {/* Optional label */}
      {label && (
        <Text
          style={[
            typography.labelMedium.style,
            { color: c.textSecondary, marginBottom: spacing.sm },
          ]}
        >
          {label}
        </Text>
      )}

      {/* Main input container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: c.bgTertiary,
            borderRadius: radii.lg,
            borderColor: focused ? c.borderAccent : c.borderDefault,
            borderWidth: borderWidths.medium,
          },
        ]}
      >
        {/* Currency symbol */}
        <Text
          style={[
            styles.currencySymbol,
            {
              color: c.accentGold,
              fontFamily: fontFamilies.mono,
            },
          ]}
        >
          {currency}
        </Text>

        {/* Amount TextInput */}
        <TextInput
          value={displayValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="decimal-pad"
          returnKeyType="done"
          placeholder="0"
          placeholderTextColor={c.textTertiary}
          style={[
            styles.amountInput,
            {
              color: c.accentGold,
              fontFamily: fontFamilies.mono,
              fontSize: fontSizes['3xl'].size,
              lineHeight: fontSizes['3xl'].lineHeight,
              fontWeight: '700',
            },
          ]}
          accessibilityLabel={accessibilityLabel ?? `Amount in ${currency}`}
          accessibilityRole="text"
          accessibilityValue={{ min: 0, max: maxValue ?? 999999999, now: value }}
        />
      </View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 80,
  },
  currencySymbol: {
    fontSize: 28,
    marginRight: spacing.sm,
    lineHeight: 36,
  },
  amountInput: {
    flex: 1,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlign: 'left',
    height: '100%',
    minHeight: 60,
  },
});

export const AmountInput = React.memo(AmountInputComponent);
export default AmountInput;
