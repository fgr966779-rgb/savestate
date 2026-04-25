/**
 * TransactionItem — Displays a single transaction in a list.
 *
 * Features: type-colored icon, formatted amount, XP badge, haptic on press,
 * swipe-to-delete (red) and swipe-to-edit (blue) actions.
 */

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  GestureResponderEvent,
  Animated,
  StyleSheet,
} from 'react-native';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  type HapticPatternKey,
  applyShadow,
} from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
export type TransactionType = 'deposit' | 'withdrawal' | 'bonus';

export interface TransactionItemProps {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  xpEarned?: number;
  note?: string;
  currency?: string;
  onPress?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  TransactionType,
  { color: string; icon: string; haptic: HapticPatternKey; prefix: string }
> = {
  deposit: {
    color: '#00FF88',
    icon: '⬆',
    haptic: 'depositConfirm',
    prefix: '+',
  },
  withdrawal: {
    color: '#FF3B3B',
    icon: '⬇',
    haptic: 'withdrawalWarn',
    prefix: '-',
  },
  bonus: {
    color: '#FFD700',
    icon: '★',
    haptic: 'coinSpin',
    prefix: '+',
  },
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Сьогодні';
  }
  if (diffDays === 1) {
    return 'Вчора';
  }
  if (diffDays < 7) {
    return `${diffDays} дн. тому`;
  }
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
}

// ── Component ──────────────────────────────────────────────────
export function TransactionItem({
  id,
  type,
  amount,
  category,
  date,
  xpEarned,
  note,
  currency = 'UAH',
  onPress,
  onDelete,
  onEdit,
}: TransactionItemProps) {
  const theme = useTheme();
  const styles = useTransactionItemStyles(theme);
  const translateX = useRef(new Animated.Value(0)).current;
  const config = TYPE_CONFIG[type];

  const handlePress = useCallback(() => {
    triggerHaptic(config.haptic);
    onPress?.(id);
  }, [config.haptic, id, onPress]);

  const handleSwipeLeft = useCallback(() => {
    if (!onDelete) return;
    triggerHaptic('error');
    Animated.timing(translateX, {
      toValue: -200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDelete(id);
      translateX.setValue(0);
    });
  }, [id, onDelete, translateX]);

  const handleSwipeRight = useCallback(() => {
    if (!onEdit) return;
    triggerHaptic('buttonPress');
    Animated.timing(translateX, {
      toValue: 200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onEdit(id);
      translateX.setValue(0);
    });
  }, [id, onEdit, translateX]);

  const handlePan = useCallback(
    (evt: GestureResponderEvent) => {
      const dx = evt.nativeEvent.pageX;
      if (dx < -60) {
        handleSwipeLeft();
      } else if (dx > 60) {
        handleSwipeRight();
      }
    },
    [handleSwipeLeft, handleSwipeRight],
  );

  const amountStr = formatAmount(amount, currency);

  return (
    <View style={styles.containerOuter}>
      {/* Swipe background actions */}
      <View style={styles.swipeActions}>
        <Pressable
          style={[styles.swipeAction, styles.swipeDelete]}
          onPress={() => onDelete?.(id)}
        >
          <Text style={styles.swipeActionText}>Видалити</Text>
        </Pressable>
        <Pressable
          style={[styles.swipeAction, styles.swipeEdit]}
          onPress={() => onEdit?.(id)}
        >
          <Text style={styles.swipeActionText}>Редагувати</Text>
        </Pressable>
      </View>

      {/* Main content */}
      <Animated.View
        style={[styles.containerInner, { transform: [{ translateX }] }]}
        onMoveShouldSetResponder={() => true}
        onResponderMove={handlePan}
        onResponderRelease={() => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            overshootClamping: true,
          }).start();
        }}
      >
        <Pressable
          style={styles.pressable}
          onPress={handlePress}
          android_ripple={{ color: theme.colors.borderSubtle, borderless: false }}
        >
          {/* Left icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${config.color}18` },
            ]}
          >
            <Text style={[styles.icon, { color: config.color }]}>
              {config.icon}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text
              style={styles.category}
              numberOfLines={1}
            >
              {category}
            </Text>
            <Text style={styles.date}>{formatDate(date)}</Text>
            {note ? (
              <Text style={styles.note} numberOfLines={1}>
                {note}
              </Text>
            ) : null}
          </View>

          {/* Right amount + XP */}
          <View style={styles.rightColumn}>
            <Text
              style={[styles.amount, { color: config.color }]}
              numberOfLines={1}
            >
              {config.prefix}{amountStr.replace(currency, '').trim()}
            </Text>
            <Text style={styles.currencyLabel}>{currency}</Text>
            {xpEarned != null && xpEarned > 0 ? (
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>+{xpEarned} XP</Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useTransactionItemStyles = createStyles((theme) =>
  StyleSheet.create({
    containerOuter: {
      position: 'relative',
      borderRadius: theme.semanticRadii.cardRadius,
      overflow: 'hidden',
      marginBottom: theme.semanticSpacing.listItemGap,
    } as any,
    swipeActions: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
    } as any,
    swipeAction: {
      width: 100,
      justifyContent: 'center',
      alignItems: 'center',
    } as any,
    swipeDelete: {
      backgroundColor: theme.colors.error,
    } as any,
    swipeEdit: {
      backgroundColor: theme.colors.accentBlue,
    } as any,
    swipeActionText: {
      ...theme.typography.labelSmall.style,
      color: '#FFFFFF',
      fontWeight: '700',
    } as any,
    containerInner: {
      backgroundColor: theme.colors.bgSurface,
      borderRadius: theme.semanticRadii.cardRadius,
      ...applyShadow('elevation1'),
    } as any,
    pressable: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.semanticSpacing.cardPadding,
      gap: theme.semanticSpacing.iconGap,
    } as any,
    iconContainer: {
      width: 42,
      height: 42,
      borderRadius: theme.semanticRadii.buttonRadius,
      justifyContent: 'center',
      alignItems: 'center',
    } as any,
    icon: {
      fontSize: 18,
      fontWeight: '700',
    } as any,
    content: {
      flex: 1,
      marginLeft: theme.spacing.xs,
      gap: 2,
    } as any,
    category: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
    } as any,
    date: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
    } as any,
    note: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      marginTop: 2,
    } as any,
    rightColumn: {
      alignItems: 'flex-end',
      gap: 2,
    } as any,
    amount: {
      ...theme.typography.titleLarge.style,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
    } as any,
    currencyLabel: {
      ...theme.typography.bodyTiny.style,
      color: theme.colors.textTertiary,
    } as any,
    xpBadge: {
      backgroundColor: `${theme.colors.accentGreen}20`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.semanticRadii.chipRadius,
      marginTop: 4,
    } as any,
    xpText: {
      ...theme.typography.caption.style,
      fontFamily: theme.fontFamilies.mono,
      color: theme.colors.accentGreen,
      fontWeight: '700',
    } as any,
  }),
);


