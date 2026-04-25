/**
 * SaveState — Debt Stack Layout
 *
 * Stack navigator for debt management screens.
 * Shows header with back button and title.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function DebtLayout() {
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
          title: 'Борги',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Додати борг',
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Оплата боргу',
        }}
      />
    </Stack>
  );
}
