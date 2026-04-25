import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Link } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Chip } from '@/components/ui/Chip';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';

const CURRENCIES: { code: string; symbol: string; labelKey: string }[] = [
  { code: 'UAH', symbol: '₴', labelKey: 'profile.settings.currencyUah' },
  { code: 'USD', symbol: '$', labelKey: 'profile.settings.currencyUsd' },
  { code: 'EUR', symbol: '€', labelKey: 'profile.settings.currencyEur' },
];

const LANGUAGES = [
  { code: 'uk' as const, label: '🇺🇦 Українська' },
  { code: 'en' as const, label: '🇬🇧 English' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = useSettingsStyles(theme);
  const settings = useSettingsStore();
  const { t } = useLocalized();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.settings.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Theme */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🌙</Text>
              <Text style={styles.settingLabel}>{t('profile.settings.theme')}</Text>
              <Text style={styles.settingDesc}>
                {settings.theme === 'dark' ? t('profile.settings.darkMode') : t('profile.settings.lightMode')}
              </Text>
            </View>
            <Toggle
              value={settings.theme === 'light'}
              onValueChange={(isLight) => settings.updateTheme(isLight ? 'light' : 'dark')}
            />
          </View>
        </Card>

        {/* Language */}
        <Card style={styles.settingCard}>
          <Text style={styles.sectionLabel}>{t('profile.settings.language')}</Text>
          <View style={styles.chipRow}>
            {LANGUAGES.map((lang) => (
              <Chip
                key={lang.code}
                label={lang.label}
                selected={settings.language === lang.code}
                onPress={() => settings.updateLanguage(lang.code)}
              />
            ))}
          </View>
        </Card>

        {/* Currency */}
        <Card style={styles.settingCard}>
          <Text style={styles.sectionLabel}>{t('profile.settings.currency')}</Text>
          <View style={styles.chipRow}>
            {CURRENCIES.map((cur) => (
              <Chip
                key={cur.code}
                label={`${cur.symbol} ${t(cur.labelKey)}`}
                selected={settings.currency === cur.code}
                onPress={() => settings.updateCurrency(cur.code)}
              />
            ))}
          </View>
        </Card>

        {/* Haptic */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📳</Text>
              <Text style={styles.settingLabel}>{t('profile.settings.haptic')}</Text>
              <Text style={styles.settingDesc}>{t('profile.settings.hapticDesc')}</Text>
            </View>
            <Toggle value={settings.hapticEnabled} onValueChange={() => settings.toggleHaptic()} />
          </View>
        </Card>

        {/* Biometric Lock */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔒</Text>
              <Text style={styles.settingLabel}>{t('profile.settings.biometricLock')}</Text>
              <Text style={styles.settingDesc}>{t('profile.settings.biometricLockDesc')}</Text>
            </View>
            <Toggle value={settings.biometricLock} onValueChange={() => settings.toggleBiometricLock()} />
          </View>
        </Card>

        {/* Notification Settings Link */}
        <Link href="/(tabs)/profile/notifications" asChild>
          <Card style={styles.linkCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={styles.settingLabel}>{t('profile.settings.notifications')}</Text>
            </View>
            <Text style={styles.linkArrow}>→</Text>
          </Card>
        </Link>

        {/* About Link */}
        <Link href="/(tabs)/profile/about" asChild>
          <Card style={styles.linkCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>ℹ️</Text>
              <Text style={styles.settingLabel}>{t('profile.settings.about')}</Text>
            </View>
            <Text style={styles.linkArrow}>→</Text>
          </Card>
        </Link>
      </ScreenLayout>
    </>
  );
}

const useSettingsStyles = createStyles((theme) =>
  StyleSheet.create({
    settingCard: { marginBottom: theme.spacing.md, paddingVertical: theme.spacing.md },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    settingInfo: { flex: 1 },
    settingIcon: { fontSize: 20, marginBottom: 2 },
    settingLabel: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    settingDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary },
    sectionLabel: { ...theme.typography.labelMedium.style, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
    chipRow: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
    linkCard: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: theme.spacing.md, marginBottom: theme.spacing.sm,
    },
    linkArrow: { ...theme.typography.bodyLarge.style, color: theme.colors.textTertiary },
  }),
);
