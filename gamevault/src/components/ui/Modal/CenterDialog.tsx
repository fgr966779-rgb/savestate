/**
 * SaveState Design System — CenterDialog
 *
 * Center-positioned dialog modal with title, message, and action buttons.
 * Supports up to 2 horizontal actions with primary / ghost variants.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  AccessibilityInfo,
} from 'react-native';
import {
  useTheme,
  semanticRadii,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface DialogAction {
  /** Button label text */
  label: string;
  /** Visual variant of the button */
  variant: 'primary' | 'ghost' | 'danger';
  /** Press handler */
  onPress: () => void;
}

interface CenterDialogProps {
  /** Controls visibility */
  visible: boolean;
  /** Called when dialog should close (backdrop tap / dismiss) */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Dialog body message */
  message: string;
  /** Action buttons (1–2 recommended) */
  actions: DialogAction[];
  /** Dialog width override (default ~300px) */
  width?: number;
}

// ── Animation config ─────────────────────────────────────────────

const ANIM_DURATION = 250;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_WIDTH = Math.min(SCREEN_WIDTH - spacing.xl * 2, 320);

// ── Variant color map ────────────────────────────────────────────

function getActionButtonStyle(
  variant: DialogAction['variant'],
  colors: ReturnType<typeof useTheme>['colors'],
) {
  const base = {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: semanticRadii.buttonRadius,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minWidth: 100,
  };

  switch (variant) {
    case 'primary':
      return {
        ...base,
        backgroundColor: colors.accentBlue,
      };
    case 'danger':
      return {
        ...base,
        backgroundColor: colors.accentRed,
      };
    case 'ghost':
    default:
      return {
        ...base,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.borderDefault,
      };
  }
}

function getActionTextStyle(
  variant: DialogAction['variant'],
  colors: ReturnType<typeof useTheme>['colors'],
) {
  const base = {
    ...typography.labelLarge.style,
    color: colors.textPrimary,
  };
  if (variant === 'primary' || variant === 'danger') {
    base.color = colors.textPrimary;
  }
  return base;
}

// ── Component ────────────────────────────────────────────────────

const CenterDialog: React.FC<CenterDialogProps> = ({
  visible,
  onClose,
  title,
  message,
  actions,
  width = DEFAULT_WIDTH,
}) => {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // ── Animate in / out ──────────────────────────────────────────
  const animateIn = useCallback(() => {
    scale.setValue(0.8);
    opacity.setValue(0);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 16,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.6,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity, backdropOpacity]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [scale, opacity, backdropOpacity, onClose]);

  useEffect(() => {
    if (visible) {
      animateIn();
      AccessibilityInfo.announceForAccessibility(`${title}. ${message}`);
    }
  }, [visible, animateIn, title, message]);

  if (!visible) return null;

  const handleBackdropPress = () => animateOut();
  const handleAction = (action: DialogAction) => {
    action.onPress();
    animateOut();
  };

  return (
    <View style={styles.overlay} testID="center-dialog-root">
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: 'rgba(0,0,0,0.6)' },
          { opacity: backdropOpacity },
        ]}
      >
        <Pressable
          onPress={handleBackdropPress}
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close dialog"
          accessibilityRole="button"
        />
      </Animated.View>

      {/* Dialog */}
      <Animated.View
        style={[
          styles.dialogContainer,
          {
            width,
            backgroundColor: theme.colors.bgSurface,
            borderRadius: semanticRadii.dialogRadius,
            ...shadows.elevation3,
            opacity,
            transform: [{ scale }],
          },
        ]}
        accessible
        accessibilityLabel={`Dialog: ${title}`}
        accessibilityRole="alert"
      >
        {/* Title */}
        <Text
          style={[
            typography.headingSmall.style,
            { color: theme.colors.textPrimary },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {/* Message */}
        <Text
          style={[
            typography.bodyLarge.style,
            { color: theme.colors.textSecondary },
            styles.message,
          ]}
        >
          {message}
        </Text>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {actions.map((action, index) => (
            <Pressable
              key={`action-${index}`}
              style={getActionButtonStyle(action.variant, theme.colors)}
              onPress={() => handleAction(action)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text
                style={getActionTextStyle(action.variant, theme.colors)}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogContainer: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['2xl'],
    overflow: 'hidden',
  },
  message: {
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing['2xl'],
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
});

export default React.memo(CenterDialog);
export type { CenterDialogProps, DialogAction };
