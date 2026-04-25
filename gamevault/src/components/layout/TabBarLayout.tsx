/**
 * TabBarLayout — Wrapper for tab-based screens.
 *
 * Features: tab chips/buttons at top of screen content, active/inactive states,
 * animated indicator, consistent styling with design system tokens.
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedScrollHandler,
  measure,
  useDerivedValue,
  useAnimatedRef,
} from 'react-native-reanimated';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
export interface TabItem {
  key: string;
  label: string;
  icon?: string;
}

export interface TabBarLayoutProps {
  children: React.ReactNode;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

// ── Component ──────────────────────────────────────────────────
export function TabBarLayout({
  children,
  tabs,
  activeTab,
  onTabChange,
}: TabBarLayoutProps) {
  const theme = useTheme();
  const styles = useTabBarLayoutStyles(theme);
  const scrollRef = useAnimatedRef<ScrollView>();
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const activeIndex = tabs.findIndex((t) => t.key === activeTab);

  const handleTabPress = useCallback(
    (key: string) => {
      if (key === activeTab) return;
      triggerHaptic('tabSwitch');
      onTabChange(key);
    },
    [activeTab, onTabChange],
  );

  const tabButtonStyle = useCallback(
    (tabKey: string) => {
      const isActive = tabKey === activeTab;
      return [
        styles.tabButton,
        isActive && styles.tabButtonActive,
        isActive && { backgroundColor: theme.colors.accentBlue },
      ];
    },
    [activeTab, styles, theme.colors.accentBlue],
  );

  const tabTextStyle = useCallback(
    (tabKey: string) => {
      const isActive = tabKey === activeTab;
      return [
        styles.tabText,
        isActive && styles.tabTextActive,
      ];
    },
    [activeTab, styles],
  );

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
          overScrollMode="never"
          bounces={false}
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <Pressable
                key={tab.key}
                style={tabButtonStyle(tab.key)}
                onPress={() => handleTabPress(tab.key)}
                android_ripple={
                  isActive
                    ? undefined
                    : { color: theme.colors.borderSubtle, borderless: false }
                }
              >
                {tab.icon ? (
                  <Text
                    style={[
                      styles.tabIcon,
                      isActive
                        ? styles.tabIconActive
                        : styles.tabIconInactive,
                    ]}
                  >
                    {tab.icon}
                  </Text>
                ) : null}
                <Text
                  style={tabTextStyle(tab.key)}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab underline indicator */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorTrack} />
        <Animated.View
          style={[
            styles.indicatorFill,
            {
              backgroundColor: theme.colors.accentBlue,
            },
          ]}
        />
      </View>

      {/* Content area */}
      <View style={styles.contentArea}>{children}</View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useTabBarLayoutStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    } as any,
    tabBarContainer: {
      backgroundColor: theme.colors.bgSecondary,
      borderBottomWidth: theme.borderWidths.none,
    } as any,
    tabBarContent: {
      paddingHorizontal: theme.semanticSpacing.screenPadding,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
      alignItems: 'center',
    } as any,
    tabButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: theme.semanticSpacing.chipPaddingH,
      paddingVertical: theme.semanticSpacing.chipPaddingV,
      borderRadius: theme.semanticRadii.chipRadius,
      backgroundColor: theme.colors.bgTertiary,
      minWidth: 0,
    } as any,
    tabButtonActive: {
      ...applyShadow('elevation1'),
    } as any,
    tabIcon: {
      fontSize: 14,
    } as any,
    tabIconActive: {
      color: '#FFFFFF',
    } as any,
    tabIconInactive: {
      color: theme.colors.textTertiary,
    } as any,
    tabText: {
      ...theme.typography.tabActive.style,
      color: theme.colors.textTertiary,
      fontWeight: '600',
    } as any,
    tabTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    } as any,
    indicatorContainer: {
      height: 2,
      position: 'relative',
      backgroundColor: theme.colors.bgTertiary,
    } as any,
    indicatorTrack: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    } as any,
    indicatorFill: {
      position: 'absolute',
      top: 0,
      left: theme.semanticSpacing.screenPadding,
      width: 40,
      height: 2,
      borderRadius: 1,
    } as any,
    contentArea: {
      flex: 1,
    } as any,
  }),
);
