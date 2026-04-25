/**
 * SaveState Design System — Divider
 *
 * Simple horizontal divider line with optional horizontal margins.
 * Uses borderSubtle color and 1px height from theme tokens.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme, spacing, borderWidths } from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface DividerProps {
  /** Additional style overrides */
  style?: ViewStyle;
  /** Whether to apply default 16px horizontal margins (default: true) */
  margin?: boolean;
}

// ── Component ────────────────────────────────────────────────────

const Divider: React.FC<DividerProps> = ({
  style,
  margin = true,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: theme.colors.borderSubtle,
          height: borderWidths.thin,
        },
        margin ? { marginHorizontal: spacing.base } : null,
        style,
      ]}
      accessibilityRole="separator"
      importantForAccessibility="no"
    />
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
});

export default React.memo(Divider);
export type { DividerProps };
