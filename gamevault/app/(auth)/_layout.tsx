/**
 * SaveState — Auth Stack Layout
 *
 * Stack navigator for authentication and onboarding screens.
 * No tab bar, full dark background, slide-from-right transitions.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.bgPrimary,
        },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
      initialRouteName="splash"
    >
      <Stack.Screen
        name="splash"
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          animation: 'slide_from_right',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="goal-selection" />
      <Stack.Screen name="target-amount" />
      <Stack.Screen name="savings-strategy" />
      <Stack.Screen name="account-setup" />
    </Stack>
  );
}
