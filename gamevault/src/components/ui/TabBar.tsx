/**
 * SaveState Design System — TabBar
 *
 * Custom bottom tab bar with 5 tabs. The center "Quests" tab is elevated
 * with a gradient circle. Active tabs show accent blue + animated indicator.
 * Supports badge counters.
 */

import React, { useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useTheme,
  spacing,
  semanticRadii,
  shadows,
  typography,
  colors,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

import type {
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

interface TabBarProps extends BottomTabBarProps {}

interface BadgeInfo {
  count: number;
}

// ── Constants ────────────────────────────────────────────────────

const TAB_HEIGHT = 64;
const CENTER_TAB_INDEX = 2;
const INDICATOR_HEIGHT = 4;
const CENTER_ELEVATION = 48;

// ── Tab definitions ──────────────────────────────────────────────

interface TabDefinition {
  label: string;
  inactiveIcon: string;
  activeIcon: string;
  isCenter: boolean;
}

const TAB_DEFS: TabDefinition[] = [
  { label: 'Home', inactiveIcon: '🏠', activeIcon: '🏠', isCenter: false },
  { label: 'Vault', inactiveIcon: '🏦', activeIcon: '🏦', isCenter: false },
  { label: 'Quests', inactiveIcon: '⚔️', activeIcon: '⚔️', isCenter: true },
  { label: 'Stats', inactiveIcon: '📊', activeIcon: '📊', isCenter: false },
  { label: 'Profile', inactiveIcon: '👤', activeIcon: '👤', isCenter: false },
];

// ── Animated indicator ───────────────────────────────────────────

const TabIndicator: React.FC<{
  index: number;
  tabWidth: number;
  color: string;
}> = ({ index, tabWidth, color }) => {
  const translateX = useRef(new Animated.Value(index * tabWidth)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: index * tabWidth,
      damping: 20,
      stiffness: 200,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [index, tabWidth, translateX]);

  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          width: tabWidth * 0.4,
          backgroundColor: color,
          transform: [{ translateX }],
        },
      ]}
    />
  );
};

// ── Single tab button ────────────────────────────────────────────

interface TabButtonProps {
  def: TabDefinition;
  isActive: boolean;
  onPress: () => void;
  badge?: BadgeInfo;
  theme: ReturnType<typeof useTheme>;
  badgeColor: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  def,
  isActive,
  onPress,
  badge,
  theme,
  badgeColor,
}) => {
  const isCenter = def.isCenter;

  if (isCenter) {
    return (
      <Pressable
        onPress={onPress}
        style={styles.centerTabWrapper}
        accessibilityLabel={def.label}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
      >
        <View
          style={[
            styles.centerTabButton,
            {
              width: CENTER_ELEVATION,
              height: CENTER_ELEVATION,
              borderRadius: CENTER_ELEVATION / 2,
              ...shadows.elevation3,
            },
          ]}
        >
          {/* Gradient background simulated with overlay */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: CENTER_ELEVATION / 2,
                backgroundColor: theme.colors.accentBlue,
              },
            ]}
          />
          <Text style={styles.centerIcon}>{def.activeIcon}</Text>
        </View>
        {badge && badge.count > 0 ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.colors.accentRed },
            ]}
          >
            <Text style={styles.badgeText}>{badge.count}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabButton}
      accessibilityLabel={def.label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.tabIcon, { opacity: isActive ? 1 : 0.5 }]}>
        {isActive ? def.activeIcon : def.inactiveIcon}
      </Text>
      <Text
        style={[
          typography.tabInactive.style,
          {
            color: isActive ? theme.colors.accentBlue : theme.colors.textTertiary,
            marginTop: 2,
            fontSize: 9,
          },
        ]}
      >
        {def.label}
      </Text>
      {badge && badge.count > 0 ? (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge.count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

// ── Main Component ───────────────────────────────────────────────

const TabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const theme = useTheme();
  const activeIndex = state.index;
  const tabCount = state.routes.length;

  const handleTabPress = useCallback(
    (routeName: string, index: number) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeName,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bgSecondary,
          ...shadows.elevation3,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        },
      ]}
      accessible
      accessibilityRole="tablist"
    >
      {/* Active indicator */}
      <TabIndicator
        index={activeIndex === CENTER_TAB_INDEX ? 0 : activeIndex > CENTER_TAB_INDEX ? activeIndex - 1 : activeIndex}
        tabWidth={100}
        color={theme.colors.accentBlue}
      />

      {/* Tab items */}
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const def = TAB_DEFS[index] ?? TAB_DEFS[0];
          const isActive = index === activeIndex;
          const descriptor = descriptors[route.key];
          const options = descriptor?.options ?? {};

          return (
            <TabButton
              key={route.key}
              def={def}
              isActive={isActive}
              onPress={() => handleTabPress(route.name, index)}
              badge={options.tabBarBadge ? { count: options.tabBarBadge as number } : undefined}
              theme={theme}
              badgeColor={theme.colors.accentRed}
            />
          );
        })}
      </View>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    height: TAB_HEIGHT,
    overflow: 'hidden',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: INDICATOR_HEIGHT,
    borderRadius: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    position: 'relative',
  },
  centerTabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -20,
    position: 'relative',
  },
  centerTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabIcon: {
    fontSize: 20,
  },
  centerIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: '30%',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
});

export default React.memo(TabBar);
export type { TabBarProps };
