/**
 * SaveState — Root Layout
 *
 * Wraps the entire app with providers, font loading, splash management,
 * and conditional auth/tabs routing based on onboarding state.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StatusBar, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  ThemeContext,
  darkTheme,
  colors,
  fontFamilies,
  spacing,
  typography,
} from '@/constants/theme';
import { ToastProvider } from '@/components/ui/Toast';
import { useSettingsStore } from '@/stores/useSettingsStore';

// ── Keep native splash visible until we're ready ─────────────────
SplashScreen.preventAutoHideAsync().catch(() => {
  // Silently handle platforms where this isn't supported
});

// ── Constants ────────────────────────────────────────────────────
const SPLASH_MIN_DURATION = 2000;

// ── Root Layout Component ────────────────────────────────────────
export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isOnboarded = useSettingsStore((s) => s.isOnboarded);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  // ── Font loading ───────────────────────────────────────────────
  const [fontsLoaded, fontError] = useFonts({
    [fontFamilies.display]: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'),
    'Rajdhani': require('../assets/fonts/Rajdhani-Bold.ttf'),
    'Rajdhani-Light': require('../assets/fonts/Rajdhani-Regular.ttf'),
    'Rajdhani-Medium': require('../assets/fonts/Rajdhani-Medium.ttf'),
    'Rajdhani-Regular': require('../assets/fonts/Rajdhani-Regular.ttf'),
    'Rajdhani-SemiBold': require('../assets/fonts/Rajdhani-SemiBold.ttf'),
    'Inter': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-Light': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-Bold.ttf'),
    'JetBrainsMono': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
    'JetBrainsMono-Light': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-Medium': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-Regular': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-SemiBold': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
  });

  // ── App initialization ─────────────────────────────────────────
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const splashStartTime = useMemo(() => Date.now(), []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Mark app as ready once fonts are loaded and settings hydrated
  useEffect(() => {
    if (fontsLoaded || fontError) {
      setIsAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  // Hide native splash once fonts are loaded
  useEffect(() => {
    if (isAppReady) {
      const elapsed = Date.now() - splashStartTime;
      const remaining = Math.max(0, SPLASH_MIN_DURATION - elapsed);

      if (remaining <= 0) {
        SplashScreen.hideAsync().catch(() => {});
        setShowSplash(false);
      } else {
        const timer = setTimeout(() => {
          SplashScreen.hideAsync().catch(() => {});
          setShowSplash(false);
        }, remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [isAppReady, splashStartTime]);

  // ── Conditional routing: auth vs tabs ──────────────────────────
  useEffect(() => {
    if (!isAppReady || showSplash) return;

    const currentGroup = segments[0];

    if (!isOnboarded) {
      // Not onboarded → show auth flow
      if (currentGroup !== 'auth') {
        router.replace('/(auth)/splash');
      }
    } else {
      // Onboarded → show main tabs
      if (currentGroup !== 'tabs' && currentGroup !== 'debt' && currentGroup !== 'money') {
        router.replace('/(tabs)/home');
      }
    }
  }, [isAppReady, showSplash, isOnboarded, segments, router]);

  // ── Navigation theme for dark mode ─────────────────────────────
  const navTheme = useMemo(
    () => ({
      dark: true,
      colors: {
        primary: colors.accentBlue,
        background: colors.bgPrimary,
        card: colors.bgSecondary,
        text: colors.textPrimary,
        border: colors.borderDefault,
        notification: colors.accentRed,
        tabBar: colors.bgSecondary,
      },
    }),
    [],
  );

  // ── Render loading state while initializing ────────────────────
  if (!isAppReady) {
    return (
      <GestureHandlerRootView style={styles.rootLoading}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingLogo}>🎮</Text>
            <Text style={styles.loadingAppName}>SaveState</Text>
            <ActivityIndicator
              size="small"
              color={colors.accentBlue}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeContext.Provider value={darkTheme}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

          <ToastProvider>
            <Animated.View style={styles.appContainer} entering={FadeIn.duration(300)}>
              <Slot />
            </Animated.View>
          </ToastProvider>
        </SafeAreaProvider>
      </ThemeContext.Provider>
    </GestureHandlerRootView>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootLoading: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingLogo: {
    fontSize: 56,
  },
  loadingAppName: {
    ...typography.headingLarge.style,
    color: colors.textPrimary,
    fontFamily: fontFamilies.display,
    letterSpacing: 2,
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
});
