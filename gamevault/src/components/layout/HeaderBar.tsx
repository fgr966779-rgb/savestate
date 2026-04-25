/**
 * HeaderBar — Common header bar for screens.
 *
 * Features: fixed top, 64px height, transparent → opaque on scroll (>20px),
 * left back/avatar action, center title, right action icons with optional badges.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, createStyles, applyShadow } from '@/constants/theme';
import { triggerHaptic } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
export interface HeaderAction {
  icon: string;
  onPress: () => void;
  badge?: number | string;
}

export interface HeaderBarProps {
  title: string;
  leftAction?: HeaderAction;
  rightActions?: HeaderAction[];
  transparent?: boolean;
  scrollOffset?: number;
  scrollEventRef?: React.RefObject<Animated.ScrollView>;
}

// ── Component ──────────────────────────────────────────────────
export function HeaderBar({
  title,
  leftAction,
  rightActions,
  transparent = false,
  scrollOffset = 0,
}: HeaderBarProps) {
  const theme = useTheme();
  const styles = useHeaderBarStyles(theme);

  const opacity = transparent ? Math.min(scrollOffset / 20, 1) : 1;
  const showBg = !transparent || scrollOffset > 20;

  return (
    <SafeAreaView
      style={[styles.safeArea, showBg && { backgroundColor: theme.colors.bgPrimary }]}
      edges={['top']}
    >
      <View
        style={[
          styles.container,
          showBg && applyShadow('elevation1'),
        ]}
      >
        {/* Backdrop when scrolling */}
        {transparent && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: theme.colors.bgPrimary,
                opacity: Math.min(scrollOffset / 20, 1),
              },
            ]}
          />
        )}

        {/* Left action */}
        <View style={styles.leftSection}>
          {leftAction ? (
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                triggerHaptic('buttonPress');
                leftAction.onPress();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              android_ripple={{
                color: theme.colors.borderSubtle,
                borderless: true,
                radius: 20,
              }}
            >
              <Text style={styles.actionIcon}>{leftAction.icon}</Text>
              {leftAction.badge != null ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {typeof leftAction.badge === 'number' && leftAction.badge > 99
                      ? '99+'
                      : leftAction.badge}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ) : (
            <View style={styles.actionPlaceholder} />
          )}
        </View>

        {/* Center title */}
        <View style={styles.centerSection}>
          <Text
            style={[
              styles.title,
              { opacity },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right actions */}
        <View style={styles.rightSection}>
          {rightActions?.map((action, index) => (
            <Pressable
              key={`action-${index}`}
              style={styles.actionButton}
              onPress={() => {
                triggerHaptic('buttonPress');
                action.onPress();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              android_ripple={{
                color: theme.colors.borderSubtle,
                borderless: true,
                radius: 20,
              }}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              {action.badge != null ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {typeof action.badge === 'number' && action.badge > 99
                      ? '99+'
                      : action.badge}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ))}
          {/* Spacer to match left width */}
          {(!rightActions || rightActions.length === 0) && (
            <View style={styles.actionPlaceholder} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useHeaderBarStyles = createStyles((theme) =>
  StyleSheet.create({
    safeArea: {
      zIndex: 100,
    } as any,
    container: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.semanticSpacing.screenPadding,
      position: 'relative',
    } as any,
    leftSection: {
      width: 48,
      justifyContent: 'center',
      alignItems: 'flex-start',
    } as any,
    centerSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as any,
    rightSection: {
      width: 48,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: theme.spacing.xs,
    } as any,
    title: {
      ...theme.typography.headingSmall.style,
      color: theme.colors.textPrimary,
    } as any,
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: theme.semanticRadii.buttonRadius,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    } as any,
    actionIcon: {
      fontSize: 22,
      color: theme.colors.textPrimary,
    } as any,
    actionPlaceholder: {
      width: 40,
      height: 40,
    } as any,
    badge: {
      position: 'absolute',
      top: 2,
      right: 2,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.accentRed,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    } as any,
    badgeText: {
      ...theme.typography.caption.style,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 9,
    } as any,
  }),
);
