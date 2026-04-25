/**
 * SaveState — Main Tab Navigator Layout
 *
 * Bottom tabs: Home, Vault, Quests (center elevated), Stats, Profile.
 * Uses custom TabBar component with badge counters.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import TabBar from '@/components/ui/TabBar';
import { colors } from '@/constants/theme';
import { useQuestStore } from '@/stores/useQuestStore';
import { useAuthStore } from '@/stores/useAuthStore';

export default function TabsLayout() {
  const activeQuestCount = useQuestStore((s) => s.quests.filter((q) => q.status === 'active').length) ?? 0;
  const notificationCount = useAuthStore((s) => 0);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        sceneStyle: {
          backgroundColor: colors.bgPrimary,
        },
      }}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarBadge: notificationCount > 0 ? notificationCount : undefined,
          tabBarLabel: 'Головна',
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          tabBarLabel: 'Скарбниця',
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          tabBarBadge: activeQuestCount > 0 ? activeQuestCount : undefined,
          tabBarLabel: 'Квести',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarLabel: 'Статистика',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Профіль',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
