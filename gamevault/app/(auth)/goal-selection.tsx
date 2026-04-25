/**
 * SaveState — Goal Selection Screen (Screen 03)
 *
 * Lets users select saving goals: PS5 (blue border) and/or Monitor (purple border).
 * Multi-select enabled — selecting both shows "Dual Quest" badge.
 * Card selection triggers scale + glow effect.
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
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
import { useSettingsStore } from '@/stores/useSettingsStore';

// ── Types ────────────────────────────────────────────────────────
type GoalId = 'ps5' | 'monitor';

interface GoalOption {
  id: GoalId;
  title: string;
  subtitle: string;
  icon: string;
  priceHint: string;
  borderColor: string;
  glowColor: string;
}

// ── Constants ────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.lg;

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'ps5',
    title: 'PlayStation 5',
    subtitle: 'Digital Edition + 2 контролери',
    icon: '🎮',
    priceHint: 'від ₴22 000',
    borderColor: colors.accentBlue,
    glowColor: colors.glowBlue,
  },
  {
    id: 'monitor',
    title: 'Ігровий монітор',
    subtitle: '27" 144Hz 1ms IPS',
    icon: '🖥️',
    priceHint: 'від ₴12 000',
    borderColor: colors.accentPurple,
    glowColor: 'rgba(157, 78, 221, 0.25)',
  },
];

export default function GoalSelectionScreen() {
  const router = useRouter();
  const setSelectedGoals = useSettingsStore((s) => s.setSelectedGoals);

  const [selectedGoals, setSelectedGoalsState] = useState<GoalId[]>([]);

  const isDualQuest = selectedGoals.length === 2;
  const canContinue = selectedGoals.length > 0;

  // ── Animated values for each card ──────────────────────────────
  const ps5Scale = useSharedValue(1);
  const monitorScale = useSharedValue(1);

  // ── Toggle goal selection ──────────────────────────────────────
  const handleGoalToggle = useCallback(
    (goalId: GoalId) => {
      triggerHaptic('buttonPress');

      setSelectedGoalsState((prev) => {
        if (prev.includes(goalId)) {
          return prev.filter((g) => g !== goalId);
        }
        return [...prev, goalId];
      });

      // Trigger scale animation
      const scaleVal = useGoalSelectionGoalScale(goalId);
      scaleVal.value = withSpring(1.03, { damping: 12, stiffness: 300, mass: 0.8 });
      setTimeout(() => {
        scaleVal.value = withSpring(1, { damping: 15, stiffness: 400, mass: 0.8 });
      }, 200);
    },
    [],
  );

  // Helper to get the right animated value (we inline this)
  function useGoalSelectionGoalScale(goalId: GoalId) {
    return goalId === 'ps5' ? ps5Scale : monitorScale;
  }

  // ── Animated styles ────────────────────────────────────────────
  const ps5AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ps5Scale.value }],
  }));

  const monitorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: monitorScale.value }],
  }));

  // ── Continue handler ───────────────────────────────────────────
  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    triggerHaptic('buttonPress');
    setSelectedGoals(selectedGoals);
    router.push('/(auth)/target-amount');
  }, [canContinue, selectedGoals, setSelectedGoals, router]);

  // ── Back handler ───────────────────────────────────────────────
  const handleBack = useCallback(() => {
    triggerHaptic('buttonPress');
    router.back();
  }, [router]);

  // ── Card glow shadow based on selection ────────────────────────
  const getCardGlow = (goalId: GoalId): object => {
    if (!selectedGoals.includes(goalId)) return {};
    const option = GOAL_OPTIONS.find((g) => g.id === goalId);
    return {
      shadowColor: option?.glowColor ?? colors.glowBlue,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 8,
    };
  };

  return (
    <ScreenLayout scrollable>
      {/* Header */}
      <HeaderBar
        title="Обери свою ціль"
        leftAction={{
          icon: '←',
          onPress: handleBack,
        }}
      />

      {/* Title section */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.titleSection}>
        <Text style={styles.screenTitle}>Обери свою ціль</Text>
        <Text style={styles.screenSubtitle}>
          Можеш обрати одну або обидві цілі
        </Text>
      </Animated.View>

      {/* Dual Quest badge */}
      {isDualQuest && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.badgeContainer}
        >
          <Badge variant="achievement" text="⚔️ Dual Quest" />
        </Animated.View>
      )}

      {/* Goal cards */}
      <View style={styles.cardsContainer}>
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          const animatedStyle = goal.id === 'ps5' ? ps5AnimatedStyle : monitorAnimatedStyle;

          return (
            <Animated.View
              key={goal.id}
              entering={FadeIn.delay(goal.id === 'ps5' ? 100 : 250).duration(500)}
              style={[styles.cardWrapper, animatedStyle]}
            >
              <Card
                variant="outlined"
                selected={isSelected}
                onPress={() => handleGoalToggle(goal.id)}
                accessibilityLabel={`${goal.title}${isSelected ? ' — обрано' : ''}`}
                style={[
                  styles.goalCard,
                  {
                    borderColor: isSelected ? goal.borderColor : colors.borderDefault,
                  },
                  getCardGlow(goal.id),
                ]}
              >
                <View style={styles.cardContent}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.cardIconContainer,
                      {
                        backgroundColor: isSelected
                          ? `${goal.borderColor}20`
                          : colors.bgTertiary,
                      },
                    ]}
                  >
                    <Text style={styles.cardIcon}>{goal.icon}</Text>
                  </View>

                  {/* Text content */}
                  <View style={styles.cardTextContainer}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: isSelected ? goal.borderColor : colors.textPrimary },
                      ]}
                    >
                      {goal.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{goal.subtitle}</Text>
                  </View>

                  {/* Price hint */}
                  <View style={styles.priceHintContainer}>
                    <Text style={styles.priceHint}>{goal.priceHint}</Text>
                  </View>

                  {/* Selection indicator */}
                  {isSelected && (
                    <View
                      style={[
                        styles.checkmark,
                        { backgroundColor: goal.borderColor },
                      ]}
                    >
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </Card>
            </Animated.View>
          );
        })}
      </View>

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
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  screenSubtitle: {
    ...typography.bodyMedium.style,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardsContainer: {
    gap: CARD_GAP,
    marginBottom: spacing['2xl'],
  },
  cardWrapper: {
    width: '100%',
  },
  goalCard: {
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    ...typography.headingSmall.style,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    ...typography.bodySmall.style,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 16,
  },
  priceHintContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.bgTertiary,
  },
  priceHint: {
    ...typography.labelSmall.style,
    color: colors.accentGold,
    fontSize: 11,
    fontFamily: fontFamilies.mono,
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
});
