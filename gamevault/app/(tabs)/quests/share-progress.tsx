import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Share, Clipboard } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { router } from 'expo-router';

type TemplateKey = 'minimal' | 'gaming' | 'achievement' | 'milestone';

const TEMPLATES: { key: TemplateKey; label: string }[] = [
  { key: 'minimal', label: 'Minimal' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'achievement', label: 'Achievement' },
  { key: 'milestone', label: 'Milestone' },
];

export default function ShareProgressScreen() {
  const theme = useTheme();
  const styles = useShareStyles(theme);
  const [template, setTemplate] = useState<TemplateKey>('minimal');

  // ── Read from stores instead of MOCK ──────────────────────────
  const user = useAuthStore((s) => s.user);
  const totalBalance = useSavingsStore((s) => s.getTotalBalance());
  const activeGoal = useSavingsStore((s) => s.getActiveGoal());
  const currentStreak = useQuestStore((s) => s.currentStreak);
  const achievements = useQuestStore((s) => s.achievements.filter((a) => a.unlocked));

  const MOCK = {
    avatar: '🦊',
    username: user?.nickname ?? 'GameSaver',
    goal: activeGoal?.targetAmount ?? 0,
    current: activeGoal?.currentAmount ?? totalBalance,
    streak: currentStreak,
    achievements: achievements.length,
    level: user?.level ?? 1,
  };

  const percentage = pct(MOCK.current, MOCK.goal);

  const shareMessage = `${MOCK.username} зберіг ${fmt(MOCK.current)} з ${fmt(MOCK.goal)} (${percentage}%) 🔥 Стріка: ${MOCK.streak} днів | Рівень ${MOCK.level} | SaveState 🎮`;

  const handleShare = useCallback(async (method: string) => {
    triggerHaptic('questComplete');
    if (method === 'copy') {
      await Clipboard.setStringAsync(shareMessage);
      return;
    }
    try {
      await Share.share({
        message: shareMessage,
        title: 'Мій прогрес у SaveState 🎮',
      });
    } catch { /* user cancelled */ }
  }, [shareMessage]);

  const handleSave = useCallback(() => {
    triggerHaptic('achievementUnlock');
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar
        title="Поділитись прогресом"
        leftAction={{ icon: '←', onPress: () => router.back() }}
      />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Template Chips */}
        <View style={styles.chipRow}>
          {TEMPLATES.map((t) => (
            <Pressable
              key={t.key}
              style={[styles.chip, template === t.key && styles.chipActive]}
              onPress={() => { triggerHaptic('buttonPress'); setTemplate(t.key); }}
            >
              <Text style={[styles.chipText, template === t.key && styles.chipTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Preview Card */}
        <Animated.View layout={Layout.springify().damping(20)} entering={FadeIn} exiting={FadeOut}>
          {template === 'minimal' && <MinimalCard styles={styles} theme={theme} percentage={percentage} />}
          {template === 'gaming' && <GamingCard styles={styles} theme={theme} percentage={percentage} />}
          {template === 'achievement' && <AchievementCardTpl styles={styles} theme={theme} percentage={percentage} />}
          {template === 'milestone' && <MilestoneCard styles={styles} theme={theme} percentage={percentage} />}
        </Animated.View>

        {/* Share Buttons */}
        <View style={styles.shareRow}>
          {[
            { key: 'instagram', icon: '📷', label: 'Instagram' },
            { key: 'telegram', icon: '✈️', label: 'Telegram' },
            { key: 'copy', icon: '📋', label: 'Копіювати' },
            { key: 'save', icon: '💾', label: 'Зберегти' },
          ].map((btn) => (
            <Pressable
              key={btn.key}
              style={styles.shareBtn}
              onPress={() => btn.key === 'save' ? handleSave() : handleShare(btn.key)}
              android_ripple={{ color: theme.colors.borderSubtle, borderless: false }}
            >
              <Text style={styles.shareIcon}>{btn.icon}</Text>
              <Text style={styles.shareLabel}>{btn.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScreenLayout>
    </>
  );
}

/* ── Minimal Template ──────────────────────────────────────── */
function MinimalCard({ styles, theme, percentage }: any) {
  return (
    <View style={[styles.card, styles.cardMinimal]}>
      <View style={styles.cardTop}>
        <Text style={styles.avatar}>{MOCK.avatar}</Text>
        <Text style={styles.username}>{MOCK.username}</Text>
      </View>
      <Text style={styles.amountRow}>{fmt(MOCK.current)} / {fmt(MOCK.goal)}</Text>
      <View style={styles.barBg}><View style={[styles.barFill, { width: `${percentage}%` }]} /></View>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>🔥 {MOCK.streak} дн</Text>
        <Text style={styles.stat}>🏆 {MOCK.achievements}</Text>
        <Text style={styles.stat}>⭐ Рів.{MOCK.level}</Text>
      </View>
      <Text style={styles.brand}>SaveState 🎮</Text>
    </View>
  );
}

/* ── Gaming Template ───────────────────────────────────────── */
function GamingCard({ styles, theme, percentage }: any) {
  return (
    <View style={[styles.card, styles.cardGaming]}>
      <View style={styles.neonTop}>
        <Text style={styles.gamingTitle}>⚡ МІЙ ПРОГРЕС ⚡</Text>
      </View>
      <View style={styles.cardTop}>
        <Text style={styles.avatar}>{MOCK.avatar}</Text>
        <Text style={[styles.username, { color: theme.colors.accentBlueLight }]}>{MOCK.username}</Text>
      </View>
      <Text style={[styles.amountRow, { color: theme.colors.accentGreen }]}>{fmt(MOCK.current)} / {fmt(MOCK.goal)}</Text>
      <View style={[styles.barBg, { borderColor: theme.colors.accentBlueLight }]}>
        <View style={[styles.barFill, styles.barGlow, { width: `${percentage}%` }]} />
      </View>
      <View style={styles.statsRow}>
        <Text style={[styles.stat, { color: theme.colors.accentOrange }]}>🔥 {MOCK.streak} дн</Text>
        <Text style={[styles.stat, { color: theme.colors.accentGold }]}>🏆 {MOCK.achievements}</Text>
        <Text style={[styles.stat, { color: theme.colors.accentPurple }]}>⭐ Рів.{MOCK.level}</Text>
      </View>
      <Text style={[styles.brand, { color: theme.colors.accentBlueLight }]}>SaveState 🎮</Text>
    </View>
  );
}

/* ── Achievement Template ──────────────────────────────────── */
function AchievementCardTpl({ styles, theme, percentage }: any) {
  return (
    <View style={[styles.card, styles.cardAchievement]}>
      <View style={styles.badgeRow}>
        <Text style={styles.badgeIcon}>🏅</Text>
        <View style={styles.badgeInfo}>
          <Text style={styles.badgeTitle}>Майстер накопичень</Text>
          <Text style={styles.badgeSub}>Рівень {MOCK.level}</Text>
        </View>
      </View>
      <View style={styles.cardTop}>
        <Text style={styles.avatar}>{MOCK.avatar}</Text>
        <Text style={styles.username}>{MOCK.username}</Text>
      </View>
      <Text style={[styles.amountRow, { color: theme.colors.accentGold }]}>{fmt(MOCK.current)} / {fmt(MOCK.goal)}</Text>
      <View style={styles.barBg}><View style={[styles.barFill, styles.barGold, { width: `${percentage}%` }]} /></View>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>🔥 {MOCK.streak} дн</Text>
        <Text style={styles.stat}>🏆 {MOCK.achievements} досягнень</Text>
      </View>
      <Text style={styles.brand}>SaveState 🎮</Text>
    </View>
  );
}

/* ── Milestone Template ────────────────────────────────────── */
function MilestoneCard({ styles, theme, percentage }: any) {
  return (
    <View style={[styles.card, styles.cardMilestone]}>
      <Text style={styles.milestonePct}>{percentage}%</Text>
      <Text style={styles.milestoneLabel}>до цілі</Text>
      <View style={styles.cardTop}>
        <Text style={styles.avatar}>{MOCK.avatar}</Text>
        <Text style={styles.username}>{MOCK.username}</Text>
      </View>
      <Text style={styles.amountRow}>{fmt(MOCK.current)}</Text>
      <Text style={styles.goalText}>Ціль: {fmt(MOCK.goal)}</Text>
      <View style={styles.barBg}><View style={[styles.barFill, styles.barMilestone, { width: `${percentage}%` }]} /></View>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>🔥 {MOCK.streak} дн</Text>
        <Text style={styles.stat}>🏆 {MOCK.achievements}</Text>
        <Text style={styles.stat}>⭐ Рів.{MOCK.level}</Text>
      </View>
      <Text style={styles.brand}>SaveState 🎮</Text>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────── */
const useShareStyles = createStyles((theme) =>
  StyleSheet.create({
    chipRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      flexWrap: 'wrap',
    },
    chip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.semanticRadii.buttonRadius,
      backgroundColor: theme.colors.bgTertiary,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    chipActive: {
      backgroundColor: theme.colors.accentBlue,
      borderColor: theme.colors.accentBlue,
    },
    chipText: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textSecondary,
    },
    chipTextActive: { color: '#FFFFFF' },
    /* ── Card Base ── */
    card: {
      borderRadius: theme.semanticRadii.cardRadius,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      backgroundColor: theme.colors.bgSecondary,
    },
    cardMinimal: { backgroundColor: theme.colors.bgSurface },
    cardGaming: {
      backgroundColor: theme.colors.bgTertiary,
      borderColor: theme.colors.accentBlueLight,
      borderWidth: 2,
    },
    cardAchievement: {
      backgroundColor: theme.colors.bgSurface,
      borderColor: theme.colors.accentGold,
      borderWidth: 1,
    },
    cardMilestone: {
      backgroundColor: theme.colors.bgSecondary,
      borderColor: theme.colors.accentGreen,
      borderWidth: 1,
    },
    neonTop: { alignItems: 'center', marginBottom: theme.spacing.md },
    gamingTitle: {
      ...theme.typography.labelLarge.style,
      color: theme.colors.accentBlueLight,
      letterSpacing: 3,
    },
    /* ── Card Content ── */
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
    avatar: { fontSize: 36 },
    username: { ...theme.typography.titleMedium.style, color: theme.colors.textPrimary, fontWeight: '700' },
    amountRow: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    goalText: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
    barBg: {
      height: 8, borderRadius: 4, backgroundColor: theme.colors.bgTertiary, marginBottom: theme.spacing.md, overflow: 'hidden', borderWidth: 1, borderColor: 'transparent',
    },
    barFill: { height: '100%', borderRadius: 4, backgroundColor: theme.colors.accentBlue },
    barGlow: { backgroundColor: theme.colors.accentGreen },
    barGold: { backgroundColor: theme.colors.accentGold },
    barMilestone: { backgroundColor: theme.colors.accentGreen },
    statsRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md },
    stat: { ...theme.typography.labelMedium.style, color: theme.colors.textSecondary },
    brand: { ...theme.typography.caption.style, color: theme.colors.textTertiary, textAlign: 'center' },
    /* ── Badge Section ── */
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
    badgeIcon: { fontSize: 32 },
    badgeInfo: { flex: 1 },
    badgeTitle: { ...theme.typography.titleMedium.style, color: theme.colors.accentGold, fontWeight: '700' },
    badgeSub: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
    /* ── Milestone ── */
    milestonePct: {
      ...theme.typography.displayLarge.style,
      color: theme.colors.accentGreen,
      textAlign: 'center',
      fontWeight: '800',
    },
    milestoneLabel: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    /* ── Share Buttons ── */
    shareRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    shareBtn: {
      flex: 1,
      minWidth: 70,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.semanticRadii.buttonRadius,
      backgroundColor: theme.colors.bgTertiary,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      gap: theme.spacing.xs,
    },
    shareIcon: { fontSize: 24 },
    shareLabel: { ...theme.typography.caption.style, color: theme.colors.textSecondary },
  }),
);
