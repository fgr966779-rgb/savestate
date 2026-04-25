import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Badge } from '@/components/ui/Badge';
import Animated, { FadeInDown, withRepeat, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useLocalized } from '@/hooks/useLocalized';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { getAdvice, type AICoachAdvice } from '@/services/aiCoach';
import { formatCurrency } from '@/utils/formatters';

// ── Helpers ──────────────────────────────────────────────────────
function getWeekRange(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const locale = 'uk-UA';
  const label = `${start.toLocaleDateString(locale, { day: 'numeric', month: 'long' })} – ${end.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  return { start, end, label };
}

// ── Loading Brain ───────────────────────────────────────────────
function LoadingBrain({ thinkingText }: { thinkingText: string }) {
  const theme = useTheme();
  const styles = useLocalStyles(theme);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 600 }),
      -1,
      true,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={animatedStyle}>
        <Text style={styles.brainEmoji}>🧠</Text>
      </Animated.View>
      <Text style={styles.loadingText}>{thinkingText}</Text>
    </View>
  );
}

// ── Typewriter Text ─────────────────────────────────────────────
function TypewriterText({ text, style }: { text: string; style?: any }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <Text style={style} numberOfLines={6}>
      {displayed}
      {displayed.length < text.length && displayed.length > 0 ? (
        <Text style={{ opacity: 0.6 }}>|</Text>
      ) : null}
    </Text>
  );
}

// ── Main Screen ─────────────────────────────────────────────────
export default function AICoachScreen() {
  const theme = useTheme();
  const styles = useLocalStyles(theme);
  const { t } = useLocalized();
  const { goals, transactions, loadGoals, loadTransactions } = useSavingsStore();
  const user = useAuthStore((s) => s.user);
  const { quests, currentStreak, loadQuests, loadStreak } = useQuestStore();
  const currency = useSettingsStore((s) => s.currency);

  const [isLoading, setIsLoading] = useState(true);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [challengeSkipped, setChallengeSkipped] = useState(false);
  const [advice, setAdvice] = useState<AICoachAdvice | null>(null);

  // ── Fetch data and generate report ────────────────────────────
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setAdvice(null);
    try {
      // Ensure data is loaded
      await Promise.all([loadGoals(), loadTransactions(), loadQuests(), loadStreak()]);

      // Call real AI Coach service
      const goalProgress = goals.map((g) => ({
        goalId: g.id,
        title: g.title,
        currentAmount: g.currentAmount,
        targetAmount: g.targetAmount,
        strategy: g.strategy ?? '',
      }));

      const recentTx = transactions.slice(0, 20).map((tx) => ({
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
      }));

      const userId = user?.id ?? 'local_user';
      const result = await getAdvice(userId, goalProgress, recentTx);
      setAdvice(result);
    } catch (error) {
      console.error('[AICoach] fetchReport error:', error);
      setAdvice({ tips: [{ title: t('common.error'), description: t('stats.aiCoach.errorFallback'), priority: 'low' }] });
    }
    setIsLoading(false);
  }, [goals, transactions, user, loadGoals, loadTransactions, loadQuests, loadStreak, t]);

  useEffect(() => {
    fetchReport();
  }, []);

  const handleNewReport = useCallback(() => {
    triggerHaptic('buttonPress');
    setChallengeAccepted(false);
    setChallengeSkipped(false);
    fetchReport();
  }, [fetchReport]);

  const handleAccept = useCallback(() => {
    triggerHaptic('achievementUnlock');
    setChallengeAccepted(true);
  }, []);

  const handleSkip = useCallback(() => {
    triggerHaptic('buttonPress');
    setChallengeSkipped(true);
  }, []);

  // ── Dynamic data computation ──────────────────────────────────
  const weekRange = getWeekRange();

  const weeklyDeposits = transactions
    .filter((tx) => {
      const d = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
      return tx.type === 'deposit' && d >= weekRange.start && d <= weekRange.end;
    });
  const weeklyDepositTotal = weeklyDeposits.reduce((sum, tx) => sum + tx.amount, 0);
  const weeklyXP = weeklyDeposits.reduce((sum, tx) => sum + tx.xpEarned, 0);

  // Previous week for comparison
  const prevWeekStart = new Date(weekRange.start);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekDepositsTotal = transactions
    .filter((tx) => {
      const d = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
      return tx.type === 'deposit' && d >= prevWeekStart && d < weekRange.start;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
  const weeklyChangePercent = prevWeekDepositsTotal > 0 ? Math.round(((weeklyDepositTotal - prevWeekDepositsTotal) / prevWeekDepositsTotal) * 100) : 0;

  const activeQuests = quests.filter((q) => q.status === 'active');
  const completedQuestsCount = quests.filter((q) => q.status === 'completed').length;
  const totalQuestsCount = quests.length;

  const wins = [
    ...(currentStreak > 0 ? [{ icon: '🏆', text: t('stats.aiCoach.streakWin', { count: currentStreak }) }] : []),
    ...(weeklyDepositTotal > 0 ? [{ icon: '📈', text: t('stats.aiCoach.weeklySavingsWin', { amount: formatCurrency(weeklyDepositTotal, currency), percent: weeklyChangePercent > 0 ? weeklyChangePercent : 0 }) }] : []),
    ...(totalQuestsCount > 0 ? [{ icon: '🎯', text: t('stats.aiCoach.questsWin', { completed: completedQuestsCount, total: totalQuestsCount }) }] : []),
  ];

  // Weekly challenge based on goals
  const activeGoal = goals.find((g) => g.status === 'active');
  const challengeTarget = activeGoal ? Math.ceil((activeGoal.targetAmount - activeGoal.currentAmount) / 12) : 300;
  const challengeCurrent = activeGoal
    ? weeklyDeposits.reduce((s, tx) => {
        // Find deposits matching this goal
        return s + tx.amount;
      }, 0)
    : 0;
  const challengeXPReward = Math.max(100, Math.floor(challengeTarget * 2));

  const progressPercent = challengeTarget > 0 ? Math.min((challengeCurrent / challengeTarget) * 100, 100) : 0;

  // Advice text from AI service
  const adviceText = advice?.tips?.map((tip) => `${tip.title}: ${tip.description}`).join('\n') ?? t('stats.aiCoach.noData');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('stats.aiCoach.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {isLoading ? (
          <LoadingBrain thinkingText={t('stats.aiCoach.thinking')} />
        ) : (
          <>
            {/* Weekly Report Header */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.reportHeader}>
              <Text style={styles.reportEmoji}>🧠</Text>
              <Text style={styles.reportTitle}>{t('stats.aiCoach.weeklyReport')}</Text>
              <Text style={styles.reportDate}>{weekRange.label}</Text>
            </Animated.View>

            {/* Section 1 — What went well */}
            {wins.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Card variant="elevated" style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionIcon}>✅</Text>
                    <Text style={styles.sectionTitle}>{t('stats.aiCoach.whatWentWell')}</Text>
                  </View>
                  {wins.map((item, i) => (
                    <View key={i} style={styles.winRow}>
                      <Text style={styles.winEmoji}>{item.icon}</Text>
                      <Text style={styles.winText}>{item.text}</Text>
                    </View>
                  ))}
                </Card>
              </Animated.View>
            )}

            {/* Section 2 — AI Advice */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <Card variant="elevated" style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>💡</Text>
                  <Text style={styles.sectionTitle}>{t('stats.aiCoach.adviceTitle')}</Text>
                  <Badge variant="xp" text="AI" />
                </View>
                <View style={styles.adviceBox}>
                  {advice?.tips && advice.tips.length > 0 ? (
                    advice.tips.map((tip, i) => (
                      <View key={i} style={{ marginBottom: i < advice.tips.length - 1 ? theme.spacing.md : 0 }}>
                        <TypewriterText
                          text={tip.description}
                          style={styles.adviceText}
                        />
                      </View>
                    ))
                  ) : (
                    <TypewriterText
                      text={t('stats.aiCoach.noData')}
                      style={styles.adviceText}
                    />
                  )}
                </View>
              </Card>
            </Animated.View>

            {/* Section 3 — Weekly Challenge */}
            {activeGoal && (
              <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                <Card variant="elevated" style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionIcon}>⚔️</Text>
                    <Text style={styles.sectionTitle}>{t('stats.aiCoach.weeklyChallenge')}</Text>
                    <Badge variant="achievement" text={`+${challengeXPReward} XP`} />
                  </View>
                  <Text style={styles.challengeText}>
                    {t('stats.aiCoach.challengeTemplate', { amount: formatCurrency(challengeTarget, currency), xp: challengeXPReward })}
                  </Text>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>{formatCurrency(challengeCurrent, currency)}/{formatCurrency(challengeTarget, currency)}</Text>
                    <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
                  </View>
                  <LinearProgress
                    progress={progressPercent}
                    color={theme.colors.accentGold}
                    height={8}
                  />
                  {!challengeAccepted && !challengeSkipped ? (
                    <View style={styles.challengeButtons}>
                      <View style={styles.btnFlex}>
                        <Button label={t('stats.aiCoach.accept')} variant="primary" size="md" fullWidth onPress={handleAccept} />
                      </View>
                      <View style={styles.btnFlex}>
                        <Button label={t('stats.aiCoach.skip')} variant="ghost" size="md" fullWidth onPress={handleSkip} />
                      </View>
                    </View>
                  ) : challengeAccepted ? (
                    <View style={styles.acceptedRow}>
                      <Badge variant="status" text={t('stats.aiCoach.accepted')} status="success" />
                    </View>
                  ) : (
                    <View style={styles.acceptedRow}>
                      <Badge variant="status" text={t('stats.aiCoach.skipped')} status="warning" />
                    </View>
                  )}
                </Card>
              </Animated.View>
            )}

            {/* New Report Button */}
            <Animated.View entering={FadeInDown.delay(800).duration(500)}>
              <Button
                label={t('stats.aiCoach.newReport')}
                variant="secondary"
                size="lg"
                fullWidth
                onPress={handleNewReport}
              />
            </Animated.View>
          </>
        )}
      </ScreenLayout>
    </>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const useLocalStyles = createStyles((theme) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 80,
    },
    brainEmoji: {
      fontSize: 64,
      marginBottom: theme.spacing.lg,
    },
    loadingText: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textSecondary,
    },
    reportHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    reportEmoji: {
      fontSize: 40,
      marginBottom: theme.spacing.xs,
    },
    reportTitle: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
    },
    reportDate: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    sectionCard: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    sectionIcon: {
      fontSize: 22,
    },
    sectionTitle: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    winRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    winEmoji: {
      fontSize: 20,
      lineHeight: 24,
    },
    winText: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textPrimary,
      flex: 1,
      lineHeight: 22,
    },
    adviceBox: {
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accentBlue,
    },
    adviceText: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      minHeight: 66,
    },
    challengeText: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      lineHeight: 22,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    progressLabel: {
      ...theme.typography.code.style,
      color: theme.colors.accentGold,
      fontWeight: '700',
    },
    progressPercent: {
      ...theme.typography.code.style,
      color: theme.colors.textTertiary,
      fontWeight: '600',
    },
    challengeButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    btnFlex: {
      flex: 1,
    },
    acceptedRow: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
  }),
);
