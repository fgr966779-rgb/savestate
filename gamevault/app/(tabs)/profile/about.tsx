import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocalized } from '@/hooks/useLocalized';

interface FAQItem {
  qKey: string;
  aKey: string;
}

export default function AboutScreen() {
  const theme = useTheme();
  const styles = useAboutStyles(theme);
  const { t } = useLocalized();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const FAQ: FAQItem[] = [
    { qKey: 'profile.about.faq0q', aKey: 'profile.about.faq0a' },
    { qKey: 'profile.about.faq1q', aKey: 'profile.about.faq1a' },
    { qKey: 'profile.about.faq2q', aKey: 'profile.about.faq2a' },
    { qKey: 'profile.about.faq3q', aKey: 'profile.about.faq3a' },
    { qKey: 'profile.about.faq4q', aKey: 'profile.about.faq4a' },
    { qKey: 'profile.about.faq5q', aKey: 'profile.about.faq5a' },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.about.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* App Identity */}
        <Card variant="elevated" style={styles.appCard}>
          <Text style={styles.appIcon}>💰</Text>
          <Text style={styles.appName}>SaveState</Text>
          <Text style={styles.appVersion}>{t('profile.about.versionInfo')}</Text>
          <Text style={styles.appTagline}>{t('profile.about.tagline')}</Text>
        </Card>

        {/* Credits */}
        <Card style={styles.creditsCard}>
          <Text style={styles.sectionTitle}>{t('profile.about.developers')}</Text>
          <Text style={styles.creditsText}>{t('profile.about.creditsText')}</Text>
        </Card>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>{t('profile.about.faq')}</Text>
        {FAQ.map((item, i) => (
          <Card key={i} style={styles.faqCard} onPress={() => setExpandedFAQ(expandedFAQ === i ? null : i)}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{t(item.qKey)}</Text>
              <Text style={styles.faqArrow}>{expandedFAQ === i ? '▲' : '▼'}</Text>
            </View>
            {expandedFAQ === i && (
              <Text style={styles.faqAnswer}>{t(item.aKey)}</Text>
            )}
          </Card>
        ))}

        {/* Links */}
        <Text style={styles.sectionTitle}>{t('profile.about.contacts')}</Text>
        <Card style={styles.linkCard} onPress={() => Linking.openURL('mailto:support@SaveState.app')}>
          <Text style={styles.linkIcon}>📧</Text>
          <Text style={styles.linkLabel}>support@SaveState.app</Text>
        </Card>
        <Card style={styles.linkCard} onPress={() => Linking.openURL('https://SaveState.app/privacy')}>
          <Text style={styles.linkIcon}>🔒</Text>
          <Text style={styles.linkLabel}>{t('profile.about.privacyPolicy')}</Text>
        </Card>
        <Card style={styles.linkCard} onPress={() => Linking.openURL('https://SaveState.app/terms')}>
          <Text style={styles.linkIcon}>📋</Text>
          <Text style={styles.linkLabel}>{t('profile.about.termsOfService')}</Text>
        </Card>

        {/* Rate */}
        <View style={styles.rateSection}>
          <Button label={t('profile.settings.rateApp')} variant="secondary" size="lg" fullWidth onPress={() => {}} />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>{t('profile.about.footer')}</Text>
      </ScreenLayout>
    </>
  );
}

const useAboutStyles = createStyles((theme) =>
  StyleSheet.create({
    appCard: { alignItems: 'center', marginBottom: theme.spacing.lg, paddingVertical: theme.spacing['2xl'] },
    appIcon: { fontSize: 48, marginBottom: theme.spacing.sm },
    appName: { ...theme.typography.headingSmall.style, color: theme.colors.textPrimary },
    appVersion: { ...theme.typography.code.style, color: theme.colors.textTertiary, marginTop: theme.spacing.xs },
    appTagline: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
    creditsCard: { marginBottom: theme.spacing.lg },
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    creditsText: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, lineHeight: 22 },
    faqCard: { marginBottom: theme.spacing.sm },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestion: { flex: 1, ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary, fontWeight: '600' },
    faqArrow: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary, marginLeft: theme.spacing.sm },
    faqAnswer: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, lineHeight: 22 },
    linkCard: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, paddingVertical: theme.spacing.md },
    linkIcon: { fontSize: 20, marginRight: theme.spacing.md },
    linkLabel: { ...theme.typography.bodyLarge.style, color: theme.colors.accentBlue },
    rateSection: { marginTop: theme.spacing.lg },
    footer: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, textAlign: 'center', marginTop: theme.spacing['2xl'] },
  }),
);
