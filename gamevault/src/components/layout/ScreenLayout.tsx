/**
 * ScreenLayout — Common screen wrapper for SaveState.
 *
 * Features: safe area handling, bgPrimary background, optional ScrollView,
 * keyboard avoiding view, consistent 24px horizontal padding, loading/error states.
 */

import React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useTheme, createStyles } from '@/constants/theme';
import { triggerHaptic } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
export interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withBottomTabBar?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  style?: any;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
}

// ── Component ──────────────────────────────────────────────────
export function ScreenLayout({
  children,
  scrollable = true,
  withBottomTabBar = false,
  loading = false,
  error,
  onRetry,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}: ScreenLayoutProps) {
  const theme = useTheme();
  const styles = useScreenLayoutStyles(theme);

  const handleRetry = () => {
    triggerHaptic('buttonPress');
    onRetry?.();
  };

  const content = (
    <View
      style={[
        styles.contentArea,
        withBottomTabBar && styles.contentWithTabBar,
      ]}
    >
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.accentBlue}
          />
          <Text style={styles.loadingText}>Завантаження...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Щось пішло не так</Text>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry ? (
            <Pressable
              style={styles.retryButton}
              onPress={handleRetry}
              android_ripple={{ color: theme.colors.borderSubtle, borderless: false }}
            >
              <Text style={styles.retryText}>Спробувати знову</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        children
      )}
    </View>
  );

  const wrappedContent = scrollable ? (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={[
        styles.scrollContent,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      bounces={true}
      overScrollMode="never"
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  ) : (
    <View style={[styles.nonScrollContainer, style]}>{content}</View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {wrappedContent}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useScreenLayoutStyles = createStyles((theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    } as any,
    keyboardAvoid: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    } as any,
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    } as any,
    scrollContent: {
      paddingHorizontal: theme.semanticSpacing.screenPadding,
      paddingBottom: theme.semanticSpacing.sectionGap,
      minHeight: '100%',
    } as any,
    nonScrollContainer: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
      paddingHorizontal: theme.semanticSpacing.screenPadding,
    } as any,
    contentArea: {
      flex: 1,
    } as any,
    contentWithTabBar: {
      paddingBottom: theme.semanticSpacing.tabBarHeight + theme.semanticSpacing.bottomSafeArea,
    } as any,
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.semanticSpacing.screenPadding,
      gap: theme.spacing.md,
    } as any,
    loadingText: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
    } as any,
    errorEmoji: {
      fontSize: 48,
    } as any,
    errorTitle: {
      ...theme.typography.headingSmall.style,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    } as any,
    errorText: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    } as any,
    retryButton: {
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.accentBlue,
      paddingHorizontal: theme.spacing['2xl'],
      paddingVertical: theme.spacing.md,
      borderRadius: theme.semanticRadii.buttonRadius,
    } as any,
    retryText: {
      ...theme.typography.buttonMedium.style,
      color: '#FFFFFF',
    } as any,
  }),
);
