/**
 * SaveState — Savings Strategy Screen (Screen 05)
 *
 * 4 strategy cards: Speed Run, Daily Grind, Quest Mode, Custom.
 * Single selection with example calculations for each strategy.
 * Auto-sets notification schedule based on chosen strategy.
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// ── Types ────────────────────────────────────────────────────────
type StrategyId = 'speedRun' | 'dailyGrind' | 'questMode' | 'custom';

interface StrategyOption {
  id: StrategyId;
  icon: string;
  name: string;
  description: string;
  example: string;
  frequency: string;
  accentColor: string;
  notificationSchedule: string;
}

// ── Constants ────────────────────────────────────────────────────
const STRATEGIES: StrategyOption[] = [
  {
    id: 'speedRun',
    icon: '🚀',
    name: 'Speed Run',
    description: 'Максимальні внески — досягни цілі якомога швидше',
    example: '₴2 000/тижд → 3 міс',
    frequency: 'Щоденні нагадування',
    accentColor: colors.accentRed,
    notificationSchedule: 'daily',
  },
  {
    id: 'dailyGrind',
    icon: '🎮',
    name: 'Daily Grind',
    description: 'Щоденні невеликі внески — стабільний прогрес',
    example: '₴500/тижд → 10 міс',
    frequency: 'Щоденні квести',
    accentColor: colors.accentBlue,
    notificationSchedule: 'daily',
  },
  {
    id: 'questMode',
    icon: '📦',
    name: 'Quest Mode',
    description: 'Тижневі квести з бонусами за виконання',
    example: '₴700/тижд → 7 міс',
    frequency: 'Щотижневі квести',
    accentColor: colors.accentGold,
    notificationSchedule: 'weekly',
  },
  {
    id: 'custom',
    icon: '⚙️',
    name: 'Свій ритм',
    description: 'Встанов власний графік і суми накопичень',
    example: 'Вільний графік',
    frequency: 'Нагадування за бажанням',
    accentColor: colors.accentGreen,
    notificationSchedule: 'custom',
  },
];

export default function SavingsStrategyScreen() {
  const router = useRouter();
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId | null>(null);

  const canContinue = selectedStrategy !== null;

  // ── Select strategy ────────────────────────────────────────────
  const handleSelectStrategy = useCallback(
    (strategyId: StrategyId) => {
      triggerHaptic('buttonPress');
      setSelectedStrategy((prev) => (prev === strategyId ? null : strategyId));
    },
    [],
  );

  // ── Continue handler ───────────────────────────────────────────
  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    triggerHaptic('buttonPress');

    const strategy = STRATEGIES.find((s) => s.id === selectedStrategy);
    if (strategy) {
      // Auto-configure notification preferences based on strategy
      console.log(`[Strategy] Notification schedule set to: ${strategy.notificationSchedule}`);
    }

    router.push('/(auth)/account-setup');
  }, [canContinue, selectedStrategy, router]);

  // ── Back handler ───────────────────────────────────────────────
  const handleBack = useCallback(() => {
    triggerHaptic('buttonPress');
    router.back();
  }, [router]);

  return (
    <ScreenLayout scrollable>
      <HeaderBar
        title="Стратегія накопичення"
        leftAction={{
          icon: '←',
          onPress: handleBack,
        }}
      />

      {/* Title section */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.titleSection}>
        <Text style={styles.screenTitle}>Обери стратегію</Text>
        <Text style={styles.screenSubtitle}>
          Як ти хочеш накопичувати? Кожна стратегія має свої квести та нагороди
        </Text>
      </Animated.View>

      {/* Strategy cards */}
      <View style={styles.strategiesContainer}>
        {STRATEGIES.map((strategy, index) => {
          const isSelected = selectedStrategy === strategy.id;

          return (
            <Animated.View
              key={strategy.id}
              entering={FadeIn.delay(index * 100).duration(400)}
            >
              <Card
                variant="elevated"
                selected={isSelected}
                onPress={() => handleSelectStrategy(strategy.id)}
                accessibilityLabel={`${strategy.name}${isSelected ? ' — обрано' : ''}`}
                style={[
                  styles.strategyCard,
                  isSelected && {
                    borderColor: strategy.accentColor,
                    borderWidth: 2,
                    shadowColor: strategy.accentColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 6,
                  },
                ]}
              >
                <View style={styles.strategyHeader}>
                  <Text style={styles.strategyIcon}>{strategy.icon}</Text>
                  <View style={styles.strategyTitleContainer}>
                    <Text
                      style={[
                        styles.strategyName,
                        { color: isSelected ? strategy.accentColor : colors.textPrimary },
                      ]}
                    >
                      {strategy.name}
                    </Text>
                    <Text style={styles.frequencyLabel}>{strategy.frequency}</Text>
                  </View>

                  {/* Selection indicator */}
                  {isSelected && (
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: strategy.accentColor },
                      ]}
                    >
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.strategyDescription}>
                  {strategy.description}
                </Text>

                {/* Example calculation */}
                <View style={styles.exampleRow}>
                  <View style={styles.exampleDot} />
                  <Text style={styles.exampleText}>{strategy.example}</Text>
                </View>
              </Card>
            </Animated.View>
          );
        })}
      </View>

      {/* Selected strategy summary */}
      {selectedStrategy && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.summarySection}>
          <Card variant="default" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Нагадування:</Text>
              <Text style={styles.summaryValue}>
                {STRATEGIES.find((s) => s.id === selectedStrategy)?.frequency}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Приблизна швидкість:</Text>
              <Text style={styles.summaryValue}>
                {STRATEGIES.find((s) => s.id === selectedStrategy)?.example}
              </Text>
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Continue button */}
      <Animated.View
        entering={FadeIn.delay(500).duration(400)}
        style={styles.buttonContainer}
      >
        <Button
          label="Далі"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canContinue}
          onPress={handleContinue}
        />
      </Animated.View>
    </ScreenLayout>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  titleSection: {
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
  strategiesContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  strategyCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  strategyIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  strategyTitleContainer: {
    flex: 1,
  },
  strategyName: {
    ...typography.headingSmall.style,
    fontSize: 17,
    fontWeight: '700',
  },
  frequencyLabel: {
    ...typography.labelSmall.style,
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 1,
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  strategyDescription: {
    ...typography.bodyMedium.style,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgTertiary,
    borderRadius: 8,
  },
  exampleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentBlue,
  },
  exampleText: {
    ...typography.labelSmall.style,
    color: colors.textSecondary,
    fontFamily: fontFamilies.mono,
    fontSize: 13,
  },
  summarySection: {
    marginBottom: spacing.lg,
  },
  summaryCard: {
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.bodyMedium.style,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.labelMedium.style,
    color: colors.textPrimary,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
});
