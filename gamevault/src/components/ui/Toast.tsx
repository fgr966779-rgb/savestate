/**
 * SaveState Design System — Toast
 *
 * Toast notification system with 4 variants, queue management (max 3 visible),
 * slide-down enter / slide-up exit animations, and left accent bar.
 *
 * Usage:
 *   Wrap your app with <ToastProvider>.
 *   Then use the useToast() hook: toast.success('Saved!') or toast.show('msg', 'achievement').
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  StatusBar,
  Text,
  View,
  Platform,
} from 'react-native';
import {
  useTheme,
  spacing,
  semanticRadii,
  typography,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'achievement';

export interface ToastItem {
  /** Unique toast ID */
  id: string;
  /** Visual variant */
  variant: ToastVariant;
  /** Message text */
  message: string;
  /** Optional icon name (rendered as emoji placeholder) */
  icon?: string;
  /** Display duration in ms (default: 3000) */
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, icon?: string) => void;
  success: (message: string, icon?: string) => void;
  error: (message: string, icon?: string) => void;
  warning: (message: string, icon?: string) => void;
  achievement: (message: string, icon?: string) => void;
}

// ── Variant config ───────────────────────────────────────────────

interface VariantConfig {
  accentColor: string;
  defaultIcon: string;
  bgColor: string;
  textColor: string;
}

function getVariantConfig(
  variant: ToastVariant,
  colors: ReturnType<typeof useTheme>['colors'],
): VariantConfig {
  switch (variant) {
    case 'success':
      return {
        accentColor: colors.success,
        defaultIcon: '✓',
        bgColor: colors.bgSurface,
        textColor: colors.textPrimary,
      };
    case 'error':
      return {
        accentColor: colors.error,
        defaultIcon: '✕',
        bgColor: colors.bgSurface,
        textColor: colors.textPrimary,
      };
    case 'warning':
      return {
        accentColor: colors.warning,
        defaultIcon: '⚠',
        bgColor: colors.bgSurface,
        textColor: colors.textPrimary,
      };
    case 'achievement':
      return {
        accentColor: colors.accentGold,
        defaultIcon: '🏆',
        bgColor: colors.bgSurface,
        textColor: colors.accentGold,
      };
  }
}

// ── Context ──────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Constants ────────────────────────────────────────────────────

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 3000;
const ENTER_DURATION = 200;
const EXIT_DURATION = 150;
const ACCENT_BAR_WIDTH = 4;
const STATUS_BAR_OFFSET = Platform.OS === 'ios' ? spacing.xl : (StatusBar.currentHeight ?? spacing.base);

let toastCounter = 0;

// ── Single Toast Item ───────────────────────────────────────────

interface ToastItemProps {
  item: ToastItem;
  index: number;
  onDismiss: (id: string) => void;
}

const ToastItemComponent: React.FC<ToastItemProps> = ({ item, index, onDismiss }) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-40)).current;
  const removed = useRef(false);
  const config = getVariantConfig(item.variant, theme.colors);

  // ── Enter animation ───────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  // ── Exit animation ────────────────────────────────────────────
  const dismiss = useCallback(() => {
    if (removed.current) return;
    removed.current = true;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -40,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(item.id));
  }, [opacity, translateY, item.id, onDismiss]);

  // ── Auto-dismiss ──────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(dismiss, item.duration ?? DEFAULT_DURATION);
    return () => clearTimeout(timer);
  }, [dismiss, item.duration]);

  const offset = STATUS_BAR_OFFSET + spacing.sm + index * (56 + spacing.sm);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: config.bgColor,
          borderRadius: semanticRadii.toastRadius,
          opacity,
          transform: [{ translateY }],
          top: offset,
        },
      ]}
      accessible
      accessibilityLabel={`${item.variant}: ${item.message}`}
      accessibilityRole="alert"
    >
      {/* Left accent bar */}
      <View
        style={[
          styles.accentBar,
          { backgroundColor: config.accentColor, width: ACCENT_BAR_WIDTH },
        ]}
      />

      {/* Icon */}
      <Text style={styles.icon}>{item.icon ?? config.defaultIcon}</Text>

      {/* Message */}
      <Text
        style={[
          typography.bodyLarge.style,
          { color: config.textColor, flex: 1 },
        ]}
        numberOfLines={2}
      >
        {item.message}
      </Text>

      {/* Dismiss area */}
      <Pressable
        onPress={dismiss}
        hitSlop={spacing.sm}
        style={styles.dismissArea}
        accessibilityLabel="Dismiss notification"
        accessibilityRole="button"
      >
        <Text style={[styles.dismissIcon, { color: theme.colors.textTertiary }]}>
          ✕
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ── Provider ─────────────────────────────────────────────────────

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [queue, setQueue] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'success', icon?: string) => {
      const id = `toast-${++toastCounter}`;
      const newToast: ToastItem = { id, variant, message, icon };
      setQueue((prev) => {
        const updated = [...prev, newToast];
        return updated.slice(-MAX_VISIBLE);
      });
    },
    [],
  );

  const ctx = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (msg, icon) => show(msg, 'success', icon),
      error: (msg, icon) => show(msg, 'error', icon),
      warning: (msg, icon) => show(msg, 'warning', icon),
      achievement: (msg, icon) => show(msg, 'achievement', icon),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {queue.map((item, index) => (
          <ToastItemComponent
            key={item.id}
            item={item}
            index={index}
            onDismiss={dismiss}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 99998,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    borderRadius: 2,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
    width: 24,
    textAlign: 'center',
  },
  dismissArea: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  dismissIcon: {
    fontSize: 14,
  },
});

export default React.memo(ToastProvider);
