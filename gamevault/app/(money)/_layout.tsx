/**
 * SaveState — Money Stack Layout
 *
 * Stack navigator for money/transaction management screens.
 * File-based routing — all screens auto-registered by Expo Router.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function MoneyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerTintColor: colors.textPrimary,
        headerStyle: {
          backgroundColor: colors.bgPrimary,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.bgPrimary,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Гроші',
        }}
      />
    </Stack>
  );
}
