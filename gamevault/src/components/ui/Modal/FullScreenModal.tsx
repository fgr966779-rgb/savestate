/**
 * SaveState Design System — FullScreenModal
 *
 * Edge-to-edge fullscreen modal with slide-up enter / slide-down exit
 * animations, optional header with close button, and scrollable content.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  AccessibilityInfo,
  StatusBar,
  Platform,
} from 'react-native';
import { useTheme, spacing, typography, shadows } from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface FullScreenModalProps {
  /** Controls visibility */
  visible: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Optional title displayed in the header */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Whether the content area is scrollable (default: true) */
  scrollable?: boolean;
}

// ── Constants ────────────────────────────────────────────────────

const ENTER_DURATION = 400;
const EXIT_DURATION = 300;
const SLIDE_DISTANCE = Dimensions.get('window').height;

// ── Close icon (×) ───────────────────────────────────────────────

const CloseIcon: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Cross lines rendered with thin views */}
    <View
      style={{
        position: 'absolute',
        width: Math.round(size * 0.45),
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '45deg' }],
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: Math.round(size * 0.45),
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '-45deg' }],
      }}
    />
  </View>
);

// ── Component ────────────────────────────────────────────────────

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  visible,
  onClose,
  title,
  children,
  scrollable = true,
}) => {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  // ── Open animation ────────────────────────────────────────────
  const animateIn = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    translateY.setValue(SLIDE_DISTANCE);
    backdropOpacity.setValue(0);
    StatusBar.setBarStyle('light-content');

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isAnimating.current = false;
      AccessibilityInfo.announceForAccessibility(
        title ? `Opened: ${title}` : 'Opened full screen modal',
      );
    });
  }, [translateY, backdropOpacity, title]);

  // ── Close animation ───────────────────────────────────────────
  const animateOut = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SLIDE_DISTANCE,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isAnimating.current = false;
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible, animateIn]);

  if (!visible) return null;

  const handleClose = () => animateOut();

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <View style={styles.overlay} testID="fullscreen-modal-root">
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            backgroundColor: theme.colors.bgPrimary,
            opacity: backdropOpacity,
          },
        ]}
      />

      {/* Modal screen */}
      <Animated.View
        style={[
          styles.modalScreen,
          {
            backgroundColor: theme.colors.bgPrimary,
            transform: [{ translateY }],
          },
        ]}
        accessible
        accessibilityLabel={title ?? 'Full screen modal'}
        accessibilityRole="dialog"
      >
        {/* Status bar spacer */}
        <View style={styles.statusBarSpacer} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleArea}>
            {title ? (
              <Animated.Text
                style={[
                  typography.headingSmall.style,
                  { color: theme.colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {title}
              </Animated.Text>
            ) : (
              <View />
            )}
          </View>

          <Pressable
            onPress={handleClose}
            hitSlop={spacing.sm}
            style={styles.closeButton}
            accessibilityLabel="Close modal"
            accessibilityRole="button"
          >
            <CloseIcon color={theme.colors.textSecondary} size={32} />
          </Pressable>
        </View>

        {/* Content */}
        <ContentWrapper
          style={styles.content}
          bounces={scrollable}
          showsVerticalScrollIndicator={scrollable}
          contentContainerStyle={
            scrollable
              ? { paddingBottom: spacing['5xl'] }
              : undefined
          }
        >
          {children}
        </ContentWrapper>
      </Animated.View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10001,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalScreen: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  statusBarSpacer: {
    height:
      Platform.OS === 'ios'
        ? spacing['4xl']
        : StatusBar.currentHeight ?? spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  headerTitleArea: {
    flex: 1,
  },
  closeButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
});

export default React.memo(FullScreenModal);
export type { FullScreenModalProps };
