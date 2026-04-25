/**
 * SaveState Design System — ErrorState
 *
 * Centered error state with alert icon, message, and retry ghost button.
 * Used for loading failures, network errors, etc.
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
  typography,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Retry button press handler */
  onRetry?: () => void;
  /** Additional style overrides */
  style?: ViewStyle;
  /** Retry button label (default: "Try Again") */
  retryLabel?: string;
}

// ── Alert Icon (triangle with exclamation) ───────────────────────

const AlertIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={styles.alertIconContainer}>
    {/* Triangle shape via border trick */}
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: 24,
        borderRightWidth: 24,
        borderBottomWidth: 42,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
      }}
    />
    {/* Exclamation mark */}
    <View style={styles.exclamationContainer}>
      <View
        style={[
          styles.exclamationBar,
          { backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.exclamationDot,
          { backgroundColor: color },
        ]}
      />
    </View>
  </View>
);

// ── Component ────────────────────────────────────────────────────

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  style,
  retryLabel = 'Try Again',
}) => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityLabel={`Error: ${message}`}
      accessibilityRole="alert"
    >
      {/* Alert Icon */}
      <View
        style={[
          styles.iconWrapper,
          {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: `${theme.colors.accentRed}15`,
          },
        ]}
      >
        <AlertIcon color={theme.colors.accentRed} />
      </View>

      {/* Error message */}
      <Text
        style={[
          typography.bodyMedium.style,
          {
            color: theme.colors.textSecondary,
            marginTop: spacing['2xl'],
            textAlign: 'center',
            maxWidth: 300,
            lineHeight: 20,
          },
        ]}
      >
        {message}
      </Text>

      {/* Retry button */}
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={[
            styles.retryButton,
            {
              borderRadius: semanticRadii.buttonRadius,
              borderColor: theme.colors.borderDefault,
              marginTop: spacing['2xl'],
            },
          ]}
          accessibilityLabel={retryLabel}
          accessibilityRole="button"
        >
          <Text
            style={[
              typography.labelLarge.style,
              { color: theme.colors.textSecondary },
            ]}
          >
            {retryLabel}
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
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  exclamationContainer: {
    position: 'absolute',
    top: 12,
    alignItems: 'center',
  },
  exclamationBar: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  exclamationDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 3,
  },
  retryButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
});

export default React.memo(ErrorState);
export type { ErrorStateProps };
