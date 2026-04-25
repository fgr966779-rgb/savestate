/**
 * Screen 12 — Deposit Screen
 *
 * Bottom-sheet style deposit flow with large AmountInput, quick amount chips,
 * category selector, optional note, dual-goal allocation slider,
 * coin fly animation preview, and deposit confirmation.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  triggerImpact,
  spacing,
  typography,
  fontFamilies,
  semanticRadii,
} from '@/constants/theme';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { getIncomeCategories } from '@/constants/categories';
import { useLocalized } from '@/hooks/useLocalized';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Slider } from '@/components/ui/Slider';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

// ── Constants ──────────────────────────────────────────────────────

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

// ── Component ─────────────────────────────────────────────────────

export default function VaultDeposit() {
  const theme = useTheme();
  const styles = useDepositStyles(theme);
  const c = theme.colors;
  const toast = useToast();
  const { t } = useLocalized();

  const { goals, activeGoalId, createTransaction } = useSavingsStore();
  const { addXP, updateStreak, advanceQuest } = useQuestStore();

  const [amount, setAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [goalAllocation, setGoalAllocation] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeGoals = goals.filter((g) => g.status === 'active');
  const hasDualGoals = activeGoals.length >= 2;

  const incomeCategories = getIncomeCategories();

  const coinAnimY = useSharedValue(0);
  const coinAnimOpacity = useSharedValue(0);

  // ── Validation ──────────────────────────────────────────────────
  const canSubmit = useMemo(() => {
    return amount > 0 && activeGoalId !== null;
  }, [amount, activeGoalId]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleQuickAmount = useCallback((value: number) => {
    triggerHaptic('buttonPress');
    setAmount(value);
  }, []);

  const handleCategorySelect = useCallback((id: string) => {
    triggerHaptic('buttonPress');
    setSelectedCategory((prev) => (prev === id ? null : id));
  }, []);

  const runCoinAnimation = useCallback(() => {
    coinAnimY.value = withSequence(
      withTiming(-120, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 300 }),
    );
    coinAnimOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 400, delay: 400 }),
    );
  }, [coinAnimY, coinAnimOpacity]);

  const coinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: coinAnimY.value }],
    opacity: coinAnimOpacity.value,
  }));

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isSubmitting) return;

    const targetGoalId = activeGoalId ?? activeGoals[0]?.id;
    if (!targetGoalId) return;

    setIsSubmitting(true);
    triggerHaptic('depositConfirm');
    triggerImpact('light');
    runCoinAnimation();

    try {
      const result = await createTransaction({
        goalId: targetGoalId,
        type: 'deposit',
        amount,
        category: selectedCategory,
        note: note || undefined,
      });

      // XP and streak updates
      addXP(result.xpEarned);
      advanceQuest('firstStep', 1);
      const streakResult = await updateStreak();
      if (streakResult.streakUpdated) {
        toast.success(t('vault.deposit.streakMessage', { days: streakResult.newStreak }), '🔥');
      }

      toast.success(
        t('vault.deposit.successMessage', { amount: formatCurrency(amount), xp: result.xpEarned }),
        '🪙',
      );

      router.back();
    } catch {
      toast.error(t('vault.deposit.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canSubmit, isSubmitting, activeGoalId, activeGoals,
    amount, selectedCategory, note, createTransaction,
    addXP, updateStreak, advanceQuest, toast, runCoinAnimation, t,
  ]);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <ScreenLayout scrollable withBottomTabBar>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          {/* ── Title ──────────────────────────────────────────────── */}
          <Text style={styles.screenTitle}>{t('vault.deposit.title')}</Text>
          <Text style={styles.screenSubtitle}>
            {t('vault.deposit.subtitle')}
          </Text>

          {/* ── Coin Animation Preview ────────────────────────────── */}
          <View style={styles.coinAnimContainer}>
            <Animated.Text style={[styles.coinAnimEmoji, coinAnimatedStyle]}>
              🪙
            </Animated.Text>
          </View>

          {/* ── Amount Input ───────────────────────────────────────── */}
          <AmountInput
            value={amount}
            onChangeAmount={setAmount}
            currency="₴"
            label={t('vault.deposit.amount')}
          />

          {/* ── Quick Amounts ─────────────────────────────────────── */}
          <View style={styles.quickAmountsRow}>
            {QUICK_AMOUNTS.map((val) => (
              <Pressable
                key={val}
                style={[
                  styles.quickAmountChip,
                  {
                    backgroundColor: amount === val
                      ? c.accentBlue
                      : c.bgTertiary,
                  },
                ]}
                onPress={() => handleQuickAmount(val)}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    { color: amount === val ? c.textPrimary : c.textSecondary },
                  ]}
                >
                  ₴{val}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Category Selector ──────────────────────────────────── */}
          <Text style={styles.sectionLabel}>{t('vault.deposit.category')}</Text>
          <View style={styles.categoryGrid}>
            {incomeCategories.slice(0, 8).map((cat) => (
              <Chip
                key={cat.id}
                label={cat.nameUk}
                selected={selectedCategory === cat.id}
                onPress={() => handleCategorySelect(cat.id)}
              />
            ))}
          </View>

          {/* ── Note Input ─────────────────────────────────────────── */}
          <Input
            label={t('vault.deposit.note')}
            placeholder={t('vault.deposit.notePlaceholder')}
            value={note}
            onChangeText={setNote}
            maxLength={100}
          />

          {/* ── Goal Allocation (Dual Goals) ───────────────────────── */}
          {hasDualGoals ? (
            <Card variant="outlined" style={styles.allocationCard}>
              <Text style={styles.allocationTitle}>
                {t('vault.deposit.allocation')}
              </Text>
              <View style={styles.allocationLabels}>
                <Text style={styles.allocationGoalName}>
                  {activeGoals[0]?.title ?? `${t('vault.deposit.goalDefault')} 1`} — {goalAllocation}%
                </Text>
                <Text style={styles.allocationGoalName}>
                  {activeGoals[1]?.title ?? `${t('vault.deposit.goalDefault')} 2`} — {100 - goalAllocation}%
                </Text>
              </View>
              <Slider
                value={goalAllocation}
                onValueChange={setGoalAllocation}
                min={0}
                max={100}
                step={5}
                label={t('vault.deposit.allocationLabel')}
              />
              <View style={styles.allocationPreview}>
                <Text style={styles.allocationPreviewText}>
                  ₴{Math.round(amount * goalAllocation / 100)} → {activeGoals[0]?.title}
                </Text>
                <Text style={styles.allocationPreviewText}>
                  ₴{Math.round(amount * (100 - goalAllocation) / 100)} → {activeGoals[1]?.title}
                </Text>
              </View>
            </Card>
          ) : null}

          {/* ── XP Preview ─────────────────────────────────────────── */}
          {amount > 0 ? (
            <Card variant="glowing" style={styles.xpPreviewCard}>
              <View style={styles.xpPreviewRow}>
                <Text style={styles.xpIcon}>⚡</Text>
                <Text style={styles.xpText}>
                  {t('vault.deposit.xpPreview', { xp: Math.floor(Math.sqrt(amount) * 2) })}
                </Text>
              </View>
            </Card>
          ) : null}

          {/* ── Submit Button ──────────────────────────────────────── */}
          <View style={styles.submitSection}>
            <Button
              variant="primary"
              size="lg"
              label={t('vault.deposit.putButton', { amount: formatCurrency(amount) })}
              onPress={handleSubmit}
              disabled={!canSubmit}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Styles ─────────────────────────────────────────────────────────

const useDepositStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    keyboardAvoid: {
      flex: 1,
    },
    screenTitle: {
      ...theme.typography.headingSmall.style,
      color: theme.colors.textPrimary,
    },
    screenSubtitle: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    coinAnimContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      position: 'relative' as const,
    },
    coinAnimEmoji: {
      fontSize: 32,
      opacity: 0,
    },
    quickAmountsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    quickAmountChip: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.semanticRadii.chipRadius,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    quickAmountText: {
      ...theme.typography.labelMedium.style,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
      fontSize: 13,
    },
    sectionLabel: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.sm,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    allocationCard: {
      marginTop: theme.spacing.sm,
    },
    allocationTitle: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
    },
    allocationLabels: {
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    allocationGoalName: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      fontFamily: theme.fontFamilies.mono,
    },
    allocationPreview: {
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: theme.semanticRadii.buttonRadius,
      padding: theme.spacing.sm,
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    allocationPreviewText: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
      fontFamily: theme.fontFamilies.mono,
    },
    xpPreviewCard: {
      marginTop: theme.spacing.sm,
    },
    xpPreviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    xpIcon: {
      fontSize: 24,
    },
    xpText: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.accentGreen,
      fontWeight: '700',
    },
    submitSection: {
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
  }),
);
