import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import { useLocalized } from '@/hooks/useLocalized';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  measure,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';

// ── Types ────────────────────────────────────────────────────────

interface FAQItem {
  qKey: string;
  aKey: string;
}

// ── Accordion Item Component ─────────────────────────────────────

function AccordionItem({ item, isOpen, onPress }: { item: FAQItem; isOpen: boolean; onPress: () => void }) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useLocalized();
  const contentHeight = useSharedValue(0);
  const animatedHeight = useSharedValue(0);
  const rotation = useSharedValue(0);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      contentHeight.value = e.nativeEvent.layout.height;
      if (isOpen) {
        animatedHeight.value = contentHeight.value;
      }
    },
    [contentHeight, isOpen, animatedHeight],
  );

  React.useEffect(() => {
    if (isOpen) {
      animatedHeight.value = withTiming(contentHeight.value, { duration: 300 });
      rotation.value = withTiming(90, { duration: 300 });
    } else {
      animatedHeight.value = withTiming(0, { duration: 250 });
      rotation.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen, animatedHeight, contentHeight, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: 'hidden',
  }));

  return (
    <Card style={styles.faqCard} onPress={onPress}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{t(item.qKey)}</Text>
        <Animated.Text style={[styles.faqChevron, chevronStyle]}>▸</Animated.Text>
      </View>
      <Animated.View style={contentStyle}>
        <Animated.View onLayout={handleLayout}>
          <Text style={styles.faqAnswer}>{t(item.aKey)}</Text>
        </Animated.View>
      </Animated.View>
    </Card>
  );
}

// ── Main Screen ──────────────────────────────────────────────────

export default function HelpSupportScreen() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useLocalized();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const FAQ_ITEMS: FAQItem[] = [
    { qKey: 'profile.help.faq0q', aKey: 'profile.help.faq0a' },
    { qKey: 'profile.help.faq1q', aKey: 'profile.help.faq1a' },
    { qKey: 'profile.help.faq2q', aKey: 'profile.help.faq2a' },
    { qKey: 'profile.help.faq3q', aKey: 'profile.help.faq3a' },
    { qKey: 'profile.help.faq4q', aKey: 'profile.help.faq4a' },
    { qKey: 'profile.help.faq5q', aKey: 'profile.help.faq5a' },
    { qKey: 'profile.help.faq6q', aKey: 'profile.help.faq6a' },
  ];

  const toggleFAQ = useCallback(
    (index: number) => {
      triggerHaptic('buttonPress');
      setExpandedIndex((prev) => (prev === index ? null : index));
    },
    [],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.help.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>❓ {t('profile.help.faqTitle')}</Text>
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            isOpen={expandedIndex === i}
            onPress={() => toggleFAQ(i)}
          />
        ))}

        <Divider style={styles.divider} />

        {/* Tutorial Replay */}
        <Text style={styles.sectionTitle}>🎓 {t('profile.help.tutorial')}</Text>
        <Card style={styles.actionCard}>
          <Text style={styles.cardDescription}>{t('profile.help.tutorialDesc')}</Text>
          <Button
            label={t('profile.help.restartOnboarding')}
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => triggerHaptic('buttonPress')}
          />
        </Card>

        <Divider style={styles.divider} />

        {/* Support Contact */}
        <Text style={styles.sectionTitle}>💬 {t('profile.help.contactUs')}</Text>
        <Card style={styles.actionCard}>
          <Text style={styles.cardDescription}>{t('profile.help.contactDesc')}</Text>
          <Button
            label={t('profile.help.inAppChat')}
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => triggerHaptic('buttonPress')}
          />
        </Card>

        <Divider style={styles.divider} />

        {/* Changelog */}
        <Text style={styles.sectionTitle}>{t('profile.help.updates')}</Text>
        <Card style={styles.linkCard} onPress={() => triggerHaptic('buttonPress')}>
          <Text style={styles.linkIcon}>📋</Text>
          <View style={styles.linkContent}>
            <Text style={styles.linkLabel}>{t('profile.help.changelog')}</Text>
            <Text style={styles.linkSublabel}>{t('profile.help.viewChangelog')}</Text>
          </View>
          <Text style={styles.linkArrow}>→</Text>
        </Card>
      </ScreenLayout>
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    sectionTitle: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    faqCard: {
      marginBottom: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    faqQuestion: {
      flex: 1,
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginRight: theme.spacing.sm,
    },
    faqChevron: {
      fontSize: 18,
      color: theme.colors.textTertiary,
      width: 20,
      textAlign: 'center',
    },
    faqAnswer: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      paddingTop: theme.spacing.sm,
    },
    divider: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    actionCard: {
      marginBottom: theme.spacing.sm,
    },
    cardDescription: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: theme.spacing.md,
    },
    linkCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
    },
    linkIcon: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    linkContent: {
      flex: 1,
    },
    linkLabel: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.accentBlue,
      fontWeight: '600',
    },
    linkSublabel: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    linkArrow: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textTertiary,
    },
  }),
);
