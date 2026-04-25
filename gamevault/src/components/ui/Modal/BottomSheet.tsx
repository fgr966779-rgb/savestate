/**
 * SaveState Design System — BottomSheet
 *
 * Draggable bottom sheet modal with handle, snap points, and backdrop.
 * Custom implementation using Animated API for maximum compatibility.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { useTheme, colors, semanticRadii, shadows, spacing, typography } from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface BottomSheetProps {
  /** Controls visibility */
  visible: boolean;
  /** Called when sheet should close */
  onClose: () => void;
  /** Optional title displayed above the content */
  title?: string;
  /** Snap point heights in pixels (smallest = collapsed) */
  snapPoints?: number[];
  /** Sheet content */
  children: React.ReactNode;
  /** Additional style overrides for the sheet container */
  style?: ViewStyle;
}

// ── Helpers ──────────────────────────────────────────────────────

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HANDLE_HEIGHT = 32;
const HANDLE_WIDTH = 4;
const DEFAULT_SNAP_POINTS = [SCREEN_HEIGHT * 0.35, SCREEN_HEIGHT * 0.6];
const BACKDROP_OPACITY = 0.6;
const VELOCITY_THRESHOLD = 0.5;

// ── Component ────────────────────────────────────────────────────

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  snapPoints = DEFAULT_SNAP_POINTS,
  children,
  style,
}) => {
  const theme = useTheme();
  const { c: tColors } = { c: theme.colors };
  const sortedSnaps = useMemo(
    () => [...snapPoints].sort((a, b) => a - b),
    [snapPoints],
  );
  const topSnap = sortedSnaps[sortedSnaps.length - 1];
  const bottomSnap = sortedSnaps[0];

  const panY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(sortedSnaps.length - 1);

  // ── Pan responder for drag gestures ───────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy < -5 || gs.dy > 5,
      onPanResponderMove: (_, gs) => {
        panY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        const velocity = gs.vy;
        const position = gs.dy;

        if (velocity > VELOCITY_THRESHOLD || position > 100) {
          if (currentIndex === 0) {
            closeSheet();
          } else {
            snapToIndex(currentIndex - 1);
          }
        } else if (velocity < -VELOCITY_THRESHOLD || position < -100) {
          if (currentIndex < sortedSnaps.length - 1) {
            snapToIndex(currentIndex + 1);
          }
        } else {
          snapToIndex(currentIndex);
        }
      },
    }),
  ).current;

  // ── Open / Close animations ───────────────────────────────────
  const openSheet = useCallback(() => {
    setCurrentIndex(sortedSnaps.length - 1);
    panY.setValue(topSnap);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: BACKDROP_OPACITY,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(panY, {
        toValue: 0,
        damping: 20,
        stiffness: 150,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [topSnap, sortedSnaps.length, panY, backdropOpacity]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(panY, {
        toValue: bottomSnap,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [bottomSnap, panY, backdropOpacity, onClose]);

  const snapToIndex = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      Animated.spring(panY, {
        toValue: 0,
        damping: 20,
        stiffness: 150,
        mass: 1,
        useNativeDriver: true,
      }).start();
    },
    [panY],
  );

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  // ── Accessibility ─────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      AccessibilityInfo.announceForAccessibility(
        title ?? 'Bottom sheet opened',
      );
    }
  }, [visible, title]);

  // ── Render ────────────────────────────────────────────────────
  if (!visible) return null;

  return (
    <View style={styles.overlay} testID="bottom-sheet-root">
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: `rgba(0,0,0,${BACKDROP_OPACITY})` },
          { opacity: backdropOpacity },
        ]}
      >
        <TouchableWithoutFeedback
          onPress={closeSheet}
          accessibilityLabel="Close bottom sheet"
          accessibilityRole="button"
        >
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: tColors.bgSecondary,
            borderTopLeftRadius: semanticRadii.modalRadius,
            borderTopRightRadius: semanticRadii.modalRadius,
            ...shadows.elevation4,
            height: topSnap,
            transform: [{ translateY: panY }],
          },
          style,
        ]}
        accessible
        accessibilityLabel={title ?? 'Bottom sheet'}
        accessibilityRole="dialog"
      >
        {/* Drag handle area */}
        <View
          {...panResponder.panHandlers}
          style={styles.handleArea}
          accessible={false}
        >
          <View
            style={[
              styles.handle,
              {
                backgroundColor: tColors.borderDefault,
                width: HANDLE_WIDTH,
                height: HANDLE_HEIGHT,
                borderRadius: HANDLE_WIDTH / 2,
              },
            ]}
          />
        </View>

        {/* Title */}
        {title ? (
          <View style={styles.titleRow}>
            <Animated.Text
              style={[
                typography.titleLarge.style,
                { color: tColors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>
          </View>
        ) : null}

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    overflow: 'hidden',
  },
  handleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    zIndex: 1,
  },
  handle: {
    opacity: 0.6,
  },
  titleRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
});

export default React.memo(BottomSheet);
export type { BottomSheetProps };
