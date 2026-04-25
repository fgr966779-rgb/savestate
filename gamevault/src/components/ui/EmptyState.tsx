/**
 * SaveState Design System — EmptyState
 *
 * Centered empty state layout with icon, title, description,
 * and optional CTA button.
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  useTheme,
  spacing,
  semanticRadii,
  shadows,
  typography,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Icon character (emoji or unicode symbol), displayed at 48px */
  icon: string;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Optional CTA button label */
  ctaLabel?: string;
  /** CTA button press handler */
  onCta?: () => void;
  /** Additional style overrides */
  style?: ViewStyle;
}

// ── Component ────────────────────────────────────────────────────

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
  style,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="text"
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.bgTertiary,
          },
        ]}
      >
        <Text style={[styles.iconText, { fontSize: 40 }]}>
          {icon}
        </Text>
      </View>

      {/* Title */}
      <Text
        style={[
          typography.headingSmall.style,
          { color: theme.colors.textSecondary, marginTop: spacing['2xl'] },
        ]}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        style={[
          typography.bodyMedium.style,
          {
            color: theme.colors.textTertiary,
            marginTop: spacing.sm,
            textAlign: 'center',
            maxWidth: 280,
          },
        ]}
      >
        {description}
      </Text>

      {/* CTA Button */}
      {ctaLabel && onCta ? (
        <Pressable
          onPress={onCta}
          style={[
            styles.ctaButton,
            {
              backgroundColor: theme.colors.accentBlue,
              borderRadius: semanticRadii.buttonRadius,
              ...shadows.glowAccent,
              marginTop: spacing['2xl'],
            },
          ]}
          accessibilityLabel={ctaLabel}
          accessibilityRole="button"
        >
          <Text
            style={[
              typography.buttonMedium.style,
              { color: theme.colors.textPrimary },
            ]}
          >
            {ctaLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#A0A0C0',
  },
  ctaButton: {
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.md,
  },
});

export default React.memo(EmptyState);
export type { EmptyStateProps };
