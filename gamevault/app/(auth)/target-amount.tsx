/**
 * SaveState — Target Amount Screen (Screen 04)
 *
 * For each selected goal: AmountInput component with ₴ symbol.
 * Recommended price hint, slider from min to max, accessory toggle +15%,
 * and preview calculation (₴/week → months estimate).
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  useTheme,
  colors,
  spacing,
  typography,
  fontFamilies,
  triggerHaptic,
} from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { AmountInput } from '@/components/ui/AmountInput';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSettingsStore } from '@/stores/useSettingsStore';

// ── Types ────────────────────────────────────────────────────────
type GoalId = 'ps5' | 'monitor';

interface GoalAmount {
  goalId: GoalId;
  amount: number;
  includeAccessories: boolean;
}

interface GoalConfig {
  id: GoalId;
  title: string;
  icon: string;
  minPrice: number;
  maxPrice: number;
  recommendedPrice: number;
  accessoryLabel: string;
  color: string;
}

// ── Constants ────────────────────────────────────────────────────
const GOAL_CONFIGS: GoalConfig[] = [
  {
    id: 'ps5',
    title: 'PlayStation 5',
    icon: '🎮',
    minPrice: 18000,
    maxPrice: 40000,
    recommendedPrice: 25000,
    accessoryLabel: '+ 2 контролери',
    color: colors.accentBlue,
  },
  {
    id: 'monitor',
    title: 'Ігровий монітор',
    icon: '🖥️',
    minPrice: 8000,
    maxPrice: 30000,
    recommendedPrice: 15000,
    accessoryLabel: '+ кріплення та кабель',
    color: colors.accentPurple,
  },
];

const ACCESSORY_MULTIPLIER = 1.15;

export default function TargetAmountScreen() {
  const router = useRouter();
  const selectedGoals = useSettingsStore((s) => s.selectedGoals);
  const [goalAmounts, setGoalAmounts] = useState<GoalAmount[]>(() =>
    selectedGoals.map((g) => ({
      goalId: g,
      amount: GOAL_CONFIGS.find((c) => c.id === g)?.recommendedPrice ?? 20000,
      includeAccessories: false,
    })),
  );
  const [isCalculating, setIsCalculating] = useState(false);

  const configs = useMemo(
    () => GOAL_CONFIGS.filter((c) => selectedGoals.includes(c.id)),
    [selectedGoals],
  );

  // ── Handlers ───────────────────────────────────────────────────
  const handleAmountChange = useCallback((goalId: GoalId, amount: number) => {
    setGoalAmounts((prev) =>
      prev.map((g) => (g.goalId === goalId ? { ...g, amount } : g)),
    );
  }, []);

  const handleAccessoryToggle = useCallback((goalId: GoalId, enabled: boolean) => {
    triggerHaptic('buttonPress');
    setGoalAmounts((prev) =>
      prev.map((g) => (g.goalId === goalId ? { ...g, includeAccessories: enabled } : g)),
    );
  }, []);

  // ── Calculations ───────────────────────────────────────────────
  const calculations = useMemo(() => {
    return goalAmounts.map((ga) => {
      const config = GOAL_CONFIGS.find((c) => c.id === ga.goalId);
      if (!config) return null;
      const baseAmount = ga.amount;
      const total = ga.includeAccessories
        ? Math.round(baseAmount * ACCESSORY_MULTIPLIER)
        : baseAmount;
      const weeklyAmount = Math.round(total / 40);
      const monthsEstimate = Math.ceil(total / (weeklyAmount * 4.33));
      return {
        goalId: ga.goalId,
        baseAmount,
        total,
        weeklyAmount,
        monthsEstimate,
      };
    }).filter(Boolean) as NonNullable<ReturnType<typeof calculations>[number]>[];
  }, [goalAmounts]);

  const totalTarget = useMemo(
    () => calculations.reduce((sum, c) => sum + c.total, 0),
    [calculations],
  );

  const totalWeekly = useMemo(
    () => calculations.reduce((sum, c) => sum + c.weeklyAmount, 0),
    [calculations],
  );

  const maxMonths = useMemo(
    () => Math.max(...calculations.map((c) => c.monthsEstimate), 1),
    [calculations],
  );

  // ── Continue handler ───────────────────────────────────────────
  const handleContinue = useCallback(() => {
    triggerHaptic('buttonPress');
    setIsCalculating(true);
    setTimeout(() => {
      router.push('/(auth)/savings-strategy');
    }, 300);
  }, [router]);

  const handleBack = useCallback(() => {
    triggerHaptic('buttonPress');
    router.back();
  }, [router]);

  // ── Recommended price handler ──────────────────────────────────
  const handleUseRecommended = useCallback(
    (goalId: GoalId) => {
      triggerHaptic('buttonPress');
      const config = GOAL_CONFIGS.find((c) => c.id === goalId);
      if (config) {
        handleAmountChange(goalId, config.recommendedPrice);
      }
    },
    [handleAmountChange],
  );

  return (
    <ScreenLayout scrollable>
      <HeaderBar
        title="Цільова сума"
        leftAction={{
          icon: '←',
          onPress: handleBack,
        }}
      />

      <Animated.View entering={FadeIn.duration(400)} style={styles.headerSection}>
        <Text style={styles.screenTitle}>Встанови цільову суму</Text>
        <Text style={styles.screenSubtitle}>
          Обери скільки хочеш накопичити на кожну ціль
        </Text>
      </Animated.View>

      {/* Goal amount cards */}
      {configs.map((config, index) => {
        const goalAmount = goalAmounts.find((g) => g.goalId === config.id);
        if (!goalAmount) return null;

        return (
          <Animated.View
            key={config.id}
            entering={FadeIn.delay(index * 150).duration(400)}
            style={styles.goalSection}
          >
            <Card variant="elevated" style={styles.goalCard}>
              {/* Goal header */}
              <View style={styles.goalHeader}>
                <Text style={styles.goalIcon}>{config.icon}</Text>
                <View style={styles.goalTitleContainer}>
                  <Text style={[styles.goalTitle, { color: config.color }]}>
                    {config.title}
                  </Text>
                  <Text style={styles.recommendedHint} onPress={() => handleUseRecommended(config.id)}>
                    Рекомендовано: ₴{config.recommendedPrice.toLocaleString('uk-UA')}
                  </Text>
                </View>
              </View>

              {/* Amount input */}
              <AmountInput
                value={goalAmount.amount}
                onChangeAmount={(val) => handleAmountChange(config.id, val)}
                currency="₴"
                maxValue={config.maxPrice}
                label="Цільова сума"
              />

              {/* Slider */}
              <Slider
                value={goalAmount.amount}
                onValueChange={(val) => handleAmountChange(config.id, val)}
                min={config.minPrice}
                max={config.maxPrice}
                step={500}
                label="Сума"
              />

              {/* Accessory toggle */}
              <View style={styles.accessoryRow}>
                <View style={styles.accessoryInfo}>
                  <Text style={styles.accessoryTitle}>Включити аксесуари</Text>
                  <Text style={styles.accessorySubtitle}>
                    {config.accessoryLabel} +15%
                  </Text>
                </View>
                <Toggle
                  value={goalAmount.includeAccessories}
                  onValueChange={(val) => handleAccessoryToggle(config.id, val)}
                />
              </View>
            </Card>
          </Animated.View>
        );
      })}

      {/* Preview calculation */}
      <Animated.View
        entering={FadeIn.delay(300).duration(400)}
        style={styles.previewSection}
      >
        <Card variant="glowing" style={styles.previewCard}>
          <Text style={styles.previewTitle}>Прогноз накопичень</Text>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Загальна сума:</Text>
            <Text style={styles.calculationValue}>
              ₴{totalTarget.toLocaleString('uk-UA')}
            </Text>
          </View>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Щотижня:</Text>
            <Text style={[styles.calculationValue, { color: colors.accentGreen }]}>
              ₴{totalWeekly.toLocaleString('uk-UA')}/тижд
            </Text>
          </View>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Час:</Text>
            <Text style={styles.calculationValue}>
              ~{maxMonths} міс
            </Text>
          </View>
        </Card>
      </Animated.View>

      {/* Continue button */}
      <Animated.View
        entering={FadeIn.delay(400).duration(400)}
        style={styles.buttonContainer}
      >
        <Button
          label="Далі"
          variant="primary"
          size="lg"
          fullWidth
          loading={isCalculating}
          onPress={handleContinue}
        />
      </Animated.View>
    </ScreenLayout>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  headerSection: {
    marginBottom: spacing.lg,
  },
  screenTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  screenSubtitle: {
    ...typography.bodyMedium.style,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  goalSection: {
    marginBottom: spacing.lg,
  },
  goalCard: {
    overflow: 'hidden',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  goalIcon: {
    fontSize: 32,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalTitle: {
    ...typography.headingSmall.style,
    fontSize: 18,
    fontWeight: '700',
  },
  recommendedHint: {
    ...typography.labelSmall.style,
    color: colors.accentGold,
    fontSize: 12,
    marginTop: 2,
  },
  accessoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  accessoryInfo: {
    flex: 1,
  },
  accessoryTitle: {
    ...typography.labelMedium.style,
    color: colors.textPrimary,
    fontSize: 14,
  },
  accessorySubtitle: {
    ...typography.bodySmall.style,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  previewSection: {
    marginBottom: spacing.lg,
  },
  previewCard: {
    overflow: 'hidden',
  },
  previewTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  calculationLabel: {
    ...typography.bodyMedium.style,
    color: colors.textSecondary,
  },
  calculationValue: {
    ...typography.labelLarge.style,
    color: colors.accentGold,
    fontFamily: fontFamilies.mono,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
});
