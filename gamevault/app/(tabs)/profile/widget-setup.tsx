import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLocalized } from '@/hooks/useLocalized';

// ── Types ──────────────────────────────────────────────────────
type WidgetSize = 'small' | 'medium' | 'large';
type UpdateFrequency = 'hourly' | 'onOpen' | 'live';

interface WidgetSizeOption {
  key: WidgetSize;
  labelKey: string;
  dimensions: string;
}

interface FrequencyOption {
  key: UpdateFrequency;
  labelKey: string;
}

// ── Component ──────────────────────────────────────────────────
export default function WidgetSetupScreen() {
  const theme = useTheme();
  const styles = useWidgetStyles(theme);
  const { t } = useLocalized();

  const WIDGET_SIZES: WidgetSizeOption[] = [
    { key: 'small', labelKey: 'profile.widget.sizeSmall', dimensions: '1×1' },
    { key: 'medium', labelKey: 'profile.widget.sizeMedium', dimensions: '2×1' },
    { key: 'large', labelKey: 'profile.widget.sizeLarge', dimensions: '2×2' },
  ];

  const FREQUENCIES: FrequencyOption[] = [
    { key: 'hourly', labelKey: 'profile.widget.freqHourly' },
    { key: 'onOpen', labelKey: 'profile.widget.freqOnOpen' },
    { key: 'live', labelKey: 'profile.widget.freqLive' },
  ];

  const STEPS = [
    t('profile.widget.step1'),
    t('profile.widget.step2'),
    t('profile.widget.step3'),
    t('profile.widget.step4'),
  ];

  const [selectedSize, setSelectedSize] = useState<WidgetSize>('medium');
  const [selectedFreq, setSelectedFreq] = useState<UpdateFrequency>('hourly');

  const handleSizeSelect = useCallback((size: WidgetSize) => {
    triggerHaptic('buttonPress');
    setSelectedSize(size);
  }, []);

  const handleFreqSelect = useCallback((freq: UpdateFrequency) => {
    triggerHaptic('tabSwitch');
    setSelectedFreq(freq);
  }, []);

  const handleAddWidget = useCallback(() => {
    triggerHaptic('depositConfirm');
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.widget.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>

        {/* ── Widget Size Selector ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('profile.widget.selectSize')}</Text>
        <View style={styles.sizeGrid}>
          {WIDGET_SIZES.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => handleSizeSelect(item.key)}
              style={styles.sizeCardWrapper}
            >
              <Card
                variant="outlined"
                selected={selectedSize === item.key}
                style={[
                  styles.sizeCard,
                  selectedSize === item.key && styles.sizeCardSelected,
                ]}
              >
                {item.key === 'small' && <SmallWidgetPreview theme={theme} styles={styles} t={t} />}
                {item.key === 'medium' && <MediumWidgetPreview theme={theme} styles={styles} t={t} />}
                {item.key === 'large' && <LargeWidgetPreview theme={theme} styles={styles} t={t} />}
              </Card>
              <View style={styles.sizeLabelRow}>
                <Text style={styles.sizeName}>{t(item.labelKey)}</Text>
                <Text style={styles.sizeDims}>{item.dimensions}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Instructions ─────────────────────────────────────── */}
        <Card style={styles.instructionCard}>
          <Text style={styles.instructionHeader}>📱 {t('profile.widget.instruction')}</Text>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepDot, index === 0 && styles.stepDotFirst]}>
                <Text style={styles.stepDotText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
              {index < STEPS.length - 1 && <View style={styles.stepConnector} />}
            </View>
          ))}
        </Card>

        {/* ── Update Frequency ─────────────────────────────────── */}
        <Card style={styles.freqCard}>
          <Text style={styles.sectionLabel}>{t('profile.widget.frequency')}</Text>
          <View style={styles.chipRow}>
            {FREQUENCIES.map((freq) => (
              <Chip
                key={freq.key}
                label={t(freq.labelKey)}
                selected={selectedFreq === freq.key}
                onPress={() => handleFreqSelect(freq.key)}
              />
            ))}
          </View>
        </Card>

        {/* ── Add Widget Button ────────────────────────────────── */}
        <Button
          variant="primary"
          size="lg"
          label={t('profile.widget.addWidget')}
          fullWidth
          onPress={handleAddWidget}
        />

      </ScreenLayout>
    </>
  );
}

// ── Widget Previews ────────────────────────────────────────────

type ThemeType = ReturnType<typeof useTheme>;

function SmallWidgetPreview({ theme, styles, t }: { theme: ThemeType; styles: Record<string, unknown>; t: (key: string) => string }) {
  return (
    <View style={[styles.widgetPreview, styles.smallPreview]}>
      <View style={styles.smallIconRow}>
        <Text style={styles.smallIcon}>🎮</Text>
        <Text style={styles.smallTitle}>{t('profile.widget.previewGoal')}</Text>
      </View>
      <Text style={styles.smallPercent}>73%</Text>
      <View style={styles.smallBarBg}>
        <View style={[styles.smallBarFill, { width: '73%', backgroundColor: theme.colors.accentGreen }]} />
      </View>
    </View>
  );
}

function MediumWidgetPreview({ theme, styles, t }: { theme: ThemeType; styles: Record<string, unknown>; t: (key: string) => string }) {
  return (
    <View style={[styles.widgetPreview, styles.mediumPreview]}>
      <View style={styles.mediumHeader}>
        <View style={styles.mediumIconRow}>
          <Text style={styles.mediumIcon}>🎮</Text>
          <View>
            <Text style={styles.mediumTitle}>{t('profile.widget.previewSavings')}</Text>
            <Text style={styles.mediumSubtitle}>{t('profile.widget.goalTarget', { amount: '25 000' })} ₴</Text>
          </View>
        </View>
        <Text style={styles.mediumPercent}>73%</Text>
      </View>
      <View style={styles.mediumBarBg}>
        <View style={[styles.mediumBarFill, { width: '73%', backgroundColor: theme.colors.accentBlue }]} />
      </View>
      <View style={styles.mediumStatsRow}>
        <View style={styles.mediumStat}>
          <Text style={styles.mediumStatIcon}>🔥</Text>
          <Text style={styles.mediumStatValue}>12</Text>
          <Text style={styles.mediumStatLabel}>{t('profile.widget.days')}</Text>
        </View>
        <View style={styles.mediumStat}>
          <Text style={styles.mediumStatIcon}>💰</Text>
          <Text style={styles.mediumStatValue}>18 250 ₴</Text>
        </View>
      </View>
    </View>
  );
}

function LargeWidgetPreview({ theme, styles, t }: { theme: ThemeType; styles: Record<string, unknown>; t: (key: string) => string }) {
  return (
    <View style={[styles.widgetPreview, styles.largePreview]}>
      <View style={styles.largeHeader}>
        <Text style={styles.largeTitle}>🎮 {t('profile.widget.previewSavings')}</Text>
        <Badge variant="level" text={`LVL 12`} />
      </View>

      {/* Mini chart placeholder */}
      <View style={styles.largeChart}>
        {[40, 55, 48, 60, 72, 65, 80, 73].map((val, i) => (
          <View key={i} style={styles.largeChartCol}>
            <View
              style={[
                styles.largeChartBar,
                {
                  height: `${val}%`,
                  backgroundColor: i === 7 ? theme.colors.accentBlueLight : theme.colors.bgTertiary,
                },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.largeBarBg}>
        <View style={[styles.largeBarFill, { width: '73%', backgroundColor: theme.colors.accentGreen }]} />
        <View style={styles.largeBarLabel}>
          <Text style={styles.largeBarLabelText}>18 250 ₴ / 25 000 ₴</Text>
        </View>
      </View>

      <View style={styles.largeStatsGrid}>
        <View style={styles.largeStatItem}>
          <Text style={styles.largeStatIcon}>🔥</Text>
          <Text style={styles.largeStatValue}>12</Text>
          <Text style={styles.largeStatLabel}>{t('profile.widget.streak')}</Text>
        </View>
        <View style={styles.largeStatItem}>
          <Text style={styles.largeStatIcon}>⚡</Text>
          <Text style={styles.largeStatValue}>2 450</Text>
          <Text style={styles.largeStatLabel}>XP</Text>
        </View>
        <View style={styles.largeStatItem}>
          <Text style={styles.largeStatIcon}>🏆</Text>
          <Text style={styles.largeStatValue}>8</Text>
          <Text style={styles.largeStatLabel}>{t('profile.widget.achievements')}</Text>
        </View>
        <View style={styles.largeStatItem}>
          <Text style={styles.largeStatIcon}>📅</Text>
          <Text style={styles.largeStatValue}>45</Text>
          <Text style={styles.largeStatLabel}>{t('profile.widget.days')}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useWidgetStyles = createStyles((theme) =>
  StyleSheet.create({
    sectionLabel: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    sizeGrid: {
      gap: theme.spacing.base,
      marginBottom: theme.spacing['2xl'],
    },
    sizeCardWrapper: {
      gap: theme.spacing.sm,
    },
    sizeCard: {
      padding: theme.spacing.md,
    },
    sizeCardSelected: {
      borderColor: theme.colors.accentBlueLight,
    },
    sizeLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
    },
    sizeName: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
    },
    sizeDims: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.textTertiary,
      fontFamily: theme.fontFamilies.mono,
    },

    // ── Widget Preview Shared ─────────────────────────────────
    widgetPreview: {
      borderRadius: theme.radii.md,
      overflow: 'hidden',
    },

    // ── Small Widget ──────────────────────────────────────────
    smallPreview: {
      backgroundColor: theme.colors.bgTertiary,
      padding: theme.spacing.md,
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    smallIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    smallIcon: { fontSize: 18 },
    smallTitle: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.textPrimary,
    },
    smallPercent: {
      ...theme.typography.headingMedium.style,
      color: theme.colors.accentGreen,
      fontSize: 28,
      lineHeight: 32,
    },
    smallBarBg: {
      width: '100%',
      height: 6,
      borderRadius: theme.semanticRadii.progressBarRadius,
      backgroundColor: theme.colors.bgSurface,
    },
    smallBarFill: {
      height: '100%',
      borderRadius: theme.semanticRadii.progressBarRadius,
    },

    // ── Medium Widget ─────────────────────────────────────────
    mediumPreview: {
      backgroundColor: theme.colors.bgTertiary,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    mediumHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mediumIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    mediumIcon: { fontSize: 20 },
    mediumTitle: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
    },
    mediumSubtitle: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
    },
    mediumPercent: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.accentBlue,
      fontFamily: theme.fontFamilies.mono,
    },
    mediumBarBg: {
      width: '100%',
      height: 8,
      borderRadius: theme.semanticRadii.progressBarRadius,
      backgroundColor: theme.colors.bgSurface,
    },
    mediumBarFill: {
      height: '100%',
      borderRadius: theme.semanticRadii.progressBarRadius,
    },
    mediumStatsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    mediumStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    mediumStatIcon: { fontSize: 14 },
    mediumStatValue: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamilies.mono,
    },
    mediumStatLabel: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
    },

    // ── Large Widget ──────────────────────────────────────────
    largePreview: {
      backgroundColor: theme.colors.bgTertiary,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    largeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    largeTitle: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
    },
    largeChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
      height: 60,
      backgroundColor: theme.colors.bgSurface,
      borderRadius: theme.radii.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
    },
    largeChartCol: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: '100%',
    },
    largeChartBar: {
      width: '70%',
      borderRadius: 3,
    },
    largeBarBg: {
      position: 'relative',
      width: '100%',
      height: 10,
      borderRadius: theme.semanticRadii.progressBarRadius,
      backgroundColor: theme.colors.bgSurface,
      overflow: 'hidden',
    },
    largeBarFill: {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      borderRadius: theme.semanticRadii.progressBarRadius,
      opacity: 0.85,
    },
    largeBarLabel: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    largeBarLabelText: {
      ...theme.typography.caption.style,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamilies.mono,
      fontSize: 7,
      fontWeight: '700',
    },
    largeStatsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    largeStatItem: {
      alignItems: 'center',
      gap: 2,
      flex: 1,
    },
    largeStatIcon: { fontSize: 16 },
    largeStatValue: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamilies.mono,
      fontSize: 13,
      lineHeight: 16,
    },
    largeStatLabel: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
      fontSize: 9,
    },

    // ── Instructions ──────────────────────────────────────────
    instructionCard: {
      marginBottom: theme.spacing['2xl'],
      paddingVertical: theme.spacing.lg,
    },
    instructionHeader: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    stepRow: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    stepDot: {
      width: 28,
      height: 28,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.bgTertiary,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    stepDotFirst: {
      backgroundColor: theme.colors.accentBlue,
    },
    stepDotText: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamilies.mono,
      fontSize: 12,
      fontWeight: '700',
    },
    stepText: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    stepConnector: {
      position: 'absolute',
      left: 13,
      top: 28,
      bottom: 0,
      width: 2,
      backgroundColor: theme.colors.bgTertiary,
    },

    // ── Frequency ─────────────────────────────────────────────
    freqCard: {
      marginBottom: theme.spacing['2xl'],
      paddingVertical: theme.spacing.lg,
    },
    chipRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    },
  }),
);
