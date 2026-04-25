/**
 * Screen 13 — Withdrawal Screen
 *
 * Withdrawal flow with warning banner, amount input (max = balance),
 * reason selector (Emergency / Planned / Other), penalty display,
 * double-tap confirm, and haptic warnings.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
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
import { useLocalized } from '@/hooks/useLocalized';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

// ── Types ──────────────────────────────────────────────────────────

type WithdrawReason = 'emergency' | 'planned' | 'other';

interface ReasonOption {
  key: WithdrawReason;
  labelKey: string;
  descriptionKey: string;
  penaltyDays: number;
}

// ── Constants ──────────────────────────────────────────────────────

const REASONS: ReasonOption[] = [
  {
    key: 'emergency',
    labelKey: 'vault.withdraw.reasonEmergency',
    descriptionKey: 'vault.withdraw.reasonEmergencyDesc',
    penaltyDays: 3,
  },
  {
    key: 'planned',
    labelKey: 'vault.withdraw.reasonPlanned',
    descriptionKey: 'vault.withdraw.reasonPlannedDesc',
    penaltyDays: 1,
  },
  {
    key: 'other',
    labelKey: 'vault.withdraw.reasonOther',
    descriptionKey: 'vault.withdraw.reasonOtherDesc',
    penaltyDays: 2,
  },
];

// ── Component ─────────────────────────────────────────────────────

export default function VaultWithdraw() {
  const theme = useTheme();
  const styles = useWithdrawStyles(theme);
  const c = theme.colors;
  const toast = useToast();
  const { t } = useLocalized();

  const { activeGoalId, goals, createTransaction, getTotalBalance } = useSavingsStore();
  const { addXP } = useQuestStore();

  const [amount, setAmount] = useState(0);
  const [selectedReason, setSelectedReason] = useState<WithdrawReason | null>(null);
  const [confirmTaps, setConfirmTaps] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxBalance = getTotalBalance();
  const activeGoal = goals.find((g) => g.id === activeGoalId);

  const penalty = useMemo(() => {
    if (!selectedReason || amount <= 0) return { xp: 0, days: 0 };
    const reason = REASONS.find((r) => r.key === selectedReason);
    const xpPenalty = Math.floor(Math.sqrt(amount) * 3);
    return { xp: Math.min(xpPenalty, 200), days: reason?.penaltyDays ?? 0 };
  }, [selectedReason, amount]);

  // Warning animation
  const warningOpacity = useSharedValue(0.8);
  useEffect(() => {
    triggerHaptic('withdrawalWarn');
    warningOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.6, { duration: 800 }),
      ),
      -1,
      true,
    );
    return () => { cancelAnimation(warningOpacity.value); };
  }, [warningOpacity]);

  const warningAnimatedStyle = useAnimatedStyle(() => ({
    opacity: warningOpacity.value,
  }));

  const canSubmit = useMemo(() => {
    return amount > 0 && amount <= maxBalance && selectedReason !== null;
  }, [amount, maxBalance, selectedReason]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleReasonSelect = useCallback((key: WithdrawReason) => {
    triggerHaptic('buttonPress');
    setSelectedReason(key);
    setConfirmTaps(0);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!canSubmit || isSubmitting) return;

    if (confirmTaps === 0) {
      setConfirmTaps(1);
      triggerHaptic('withdrawalWarn');
      return;
    }

    // Second tap — execute
    Alert.alert(
      t('vault.withdraw.confirmTitle'),
      t('vault.withdraw.confirmMessage', { xp: penalty.xp, days: penalty.days }),
      [
        { text: t('vault.withdraw.cancel'), style: 'cancel', onPress: () => setConfirmTaps(0) },
        {
          text: t('vault.withdraw.confirmAction'),
          style: 'destructive',
          onPress: () => executeWithdrawal(),
        },
      ],
    );
  }, [canSubmit, isSubmitting, confirmTaps, penalty, t]);

  const executeWithdrawal = useCallback(async () => {
    const targetGoalId = activeGoalId ?? activeGoal?.id;
    if (!targetGoalId) return;

    setIsSubmitting(true);
    triggerImpact('heavy');

    try {
      await createTransaction({
        goalId: targetGoalId,
        type: 'withdrawal',
        amount,
      });

      // Apply XP penalty
      if (penalty.xp > 0) {
        addXP(-penalty.xp);
      }

      toast.warning(
        t('vault.withdraw.successMessage', { amount: formatCurrency(amount) }),
        '💸',
      );
      router.back();
    } catch {
      toast.error(t('vault.withdraw.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  }, [activeGoalId, activeGoal, amount, createTransaction, toast, penalty.xp, addXP, t]);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <ScreenLayout scrollable withBottomTabBar>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          {/* ── Title ──────────────────────────────────────────────── */}
          <Text style={styles.screenTitle}>{t('vault.withdraw.screenTitle')}</Text>

          {/* ── Warning Banner ─────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.warningBanner,
              { backgroundColor: `${c.accentRed}18`, borderColor: c.accentRed },
              warningAnimatedStyle,
            ]}
          >
            <Text style={[styles.warningEmoji, { color: c.accentRed }]}>⚠️</Text>
            <Text style={[styles.warningText, { color: c.accentRed }]}>
              {t('vault.withdraw.warningText')}
            </Text>
          </Animated.View>

          {/* ── Current Balance ────────────────────────────────────── */}
          <Card variant="outlined" style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>{t('vault.withdraw.availableBalance')}</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(maxBalance)} ₴
            </Text>
            <Text style={styles.balanceGoal}>
              {activeGoal?.title ?? t('vault.withdraw.activeGoal')}
            </Text>
          </Card>

          {/* ── Amount Input ───────────────────────────────────────── */}
          <AmountInput
            value={amount}
            onChangeAmount={setAmount}
            maxValue={maxBalance}
            currency="₴"
            label={t('vault.withdraw.amount')}
          />

          {amount > maxBalance && maxBalance > 0 ? (
            <Text style={styles.errorText}>
              {t('vault.withdraw.insufficientFunds')}
            </Text>
          ) : null}

          {/* ── Reason Selector ────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>{t('vault.withdraw.reasonLabel')}</Text>
          {REASONS.map((reason) => (
            <Pressable
              key={reason.key}
              style={[
                styles.reasonCard,
                {
                  backgroundColor: selectedReason === reason.key
                    ? `${c.accentBlue}15`
                    : c.bgSurface,
                  borderColor: selectedReason === reason.key
                    ? c.borderAccent
                    : c.borderSubtle,
                },
              ]}
              onPress={() => handleReasonSelect(reason.key)}
            >
              <Text style={styles.reasonLabel}>{t(reason.labelKey)}</Text>
              <Text style={styles.reasonDescription}>{t(reason.descriptionKey)}</Text>
              <Text style={styles.reasonPenalty}>
                -{Math.floor(Math.sqrt(amount) * 3)} XP + {reason.penaltyDays} {t('vault.withdraw.daysShort')}
              </Text>
            </Pressable>
          ))}

          {/* ── Penalty Display ────────────────────────────────────── */}
          {selectedReason && amount > 0 ? (
            <Card variant="outlined" style={styles.penaltyCard}>
              <Text style={styles.penaltyTitle}>{t('vault.withdraw.penaltyTitle')}</Text>
              <View style={styles.penaltyRow}>
                <Text style={styles.penaltyIcon}>⚡</Text>
                <Text style={[styles.penaltyValue, { color: c.accentRed }]}>
                  {t('vault.withdraw.penaltyXp', { xp: penalty.xp })}
                </Text>
              </View>
              <View style={styles.penaltyRow}>
                <Text style={styles.penaltyIcon}>📅</Text>
                <Text style={[styles.penaltyValue, { color: c.accentOrange }]}>
                  {t('vault.withdraw.penaltyDays', { days: penalty.days })}
                </Text>
              </View>
            </Card>
          ) : null}

          {/* ── Confirm Button ─────────────────────────────────────── */}
          <View style={styles.submitSection}>
            {confirmTaps === 1 && (
              <Text style={styles.confirmHint}>
                {t('vault.withdraw.confirmHint')}
              </Text>
            )}
            <Button
              variant="danger"
              size="lg"
              label={
                confirmTaps === 1
                  ? t('vault.withdraw.confirmButton')
                  : t('vault.withdraw.withdrawButton', { amount: formatCurrency(amount) })
              }
              onPress={handleConfirm}
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

const useWithdrawStyles = createStyles((theme) =>
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
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.semanticRadii.cardRadius,
      borderWidth: 1,
    },
    warningEmoji: {
      fontSize: 20,
    },
    warningText: {
      ...theme.typography.labelMedium.style,
      fontWeight: '700',
    },
    balanceCard: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    balanceLabel: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
    },
    balanceValue: {
      fontFamily: theme.fontFamilies.mono,
      fontSize: 32,
      fontWeight: '800',
      color: theme.colors.accentGold,
      marginTop: theme.spacing.xs,
    },
    balanceGoal: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    errorText: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.accentRed,
      marginTop: theme.spacing.xs,
    },
    sectionLabel: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.sm,
    },
    reasonCard: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.semanticRadii.cardRadius,
      borderWidth: 1,
      marginBottom: theme.spacing.sm,
      gap: 2,
    },
    reasonLabel: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
    },
    reasonDescription: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
    },
    reasonPenalty: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
      fontFamily: theme.fontFamilies.mono,
      marginTop: 2,
    },
    penaltyCard: {
      marginTop: theme.spacing.sm,
    },
    penaltyTitle: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
    },
    penaltyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    penaltyIcon: {
      fontSize: 18,
    },
    penaltyValue: {
      ...theme.typography.bodyMedium.style,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
    },
    submitSection: {
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    confirmHint: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.accentRed,
      fontWeight: '700',
    },
  }),
);
