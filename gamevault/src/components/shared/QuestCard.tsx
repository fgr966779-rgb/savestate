/**
 * QuestCard — Displays a quest item with progress bar and rewards.
 *
 * Features: difficulty indicator colors, progress bar, completion state,
 * haptic feedback on press, XP and coin reward display.
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  applyShadow,
  spacing,
} from '@/constants/theme';
import { difficultyConfig } from '@/constants/quests';

// ── Types ──────────────────────────────────────────────────────
export type QuestType = 'daily' | 'weekly' | 'story';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  coinReward?: number;
  type: QuestType;
  completed: boolean;
  difficulty?: QuestDifficulty;
  iconName?: string;
  onPress?: (id: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────
const DIFFICULTY_COLORS: Record<QuestDifficulty, string> = {
  easy: difficultyConfig.easy.color,
  medium: difficultyConfig.medium.color,
  hard: difficultyConfig.hard.color,
  legendary: '#FFD700',
};

const TYPE_LABELS: Record<QuestType, string> = {
  daily: 'Щоденний',
  weekly: 'Тижневий',
  story: 'Сюжетний',
};

const DIFFICULTY_LABELS: Record<QuestDifficulty, string> = {
  easy: difficultyConfig.easy.label,
  medium: difficultyConfig.medium.label,
  hard: difficultyConfig.hard.label,
  legendary: 'Легендарний',
};

function getProgressFraction(progress: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.max(progress / target, 0), 1);
}

// ── Component ──────────────────────────────────────────────────
export function QuestCard({
  id,
  title,
  description,
  progress,
  target,
  xpReward,
  coinReward,
  type,
  completed,
  difficulty = 'easy',
  iconName,
  onPress,
}: QuestCardProps) {
  const theme = useTheme();
  const styles = useQuestCardStyles(theme);
  const progressFraction = getProgressFraction(progress, target);
  const diffColor = DIFFICULTY_COLORS[difficulty];

  const handlePress = useCallback(() => {
    triggerHaptic(completed ? 'questComplete' : 'buttonPress');
    onPress?.(id);
  }, [completed, id, onPress]);

  return (
    <Pressable
      style={[
        styles.container,
        completed && styles.containerCompleted,
        { borderLeftColor: diffColor },
      ]}
      onPress={handlePress}
      android_ripple={{ color: theme.colors.borderSubtle, borderless: false }}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: completed ? `${theme.colors.accentGreen}20` : `${diffColor}20` },
          ]}
        >
          <Text style={[styles.iconText, { color: completed ? theme.colors.accentGreen : diffColor }]}>
            {completed ? '✓' : iconName === undefined ? '⚔' : ''}
          </Text>
        </View>

        {/* Title + type badge */}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, completed && styles.titleCompleted]} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: `${diffColor}20` }]}>
              <Text style={[styles.typeBadgeText, { color: diffColor }]}>
                {TYPE_LABELS[type]}
              </Text>
            </View>
            {difficulty !== 'easy' ? (
              <View style={[styles.typeBadge, { backgroundColor: `${diffColor}12` }]}>
                <Text style={[styles.typeBadgeText, { color: diffColor }]}>
                  {DIFFICULTY_LABELS[difficulty]}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={[styles.description, completed && styles.descriptionCompleted]} numberOfLines={2}>
        {description}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressFraction * 100}%`,
                backgroundColor: completed ? theme.colors.accentGreen : diffColor,
              },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {progress} / {target}
        </Text>
      </View>

      {/* Rewards */}
      <View style={styles.rewardsRow}>
        <View style={styles.rewardChip}>
          <Text style={[styles.rewardIcon, { color: theme.colors.accentGreen }]}>⚡</Text>
          <Text style={[styles.rewardText, { color: theme.colors.accentGreen }]}>
            +{xpReward} XP
          </Text>
        </View>
        {coinReward != null && coinReward > 0 ? (
          <View style={styles.rewardChip}>
            <Text style={[styles.rewardIcon, { color: theme.colors.accentGold }]}>🪙</Text>
            <Text style={[styles.rewardText, { color: theme.colors.accentGold }]}>
              +{coinReward}
            </Text>
          </View>
        ) : null}
        {completed ? (
          <View style={[styles.completedBadge]}>
            <Text style={styles.completedText}>Виконано</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useQuestCardStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.bgSurface,
      borderRadius: theme.semanticRadii.cardRadius,
      padding: theme.semanticSpacing.cardPadding,
      borderLeftWidth: 4,
      ...applyShadow('elevation1'),
    } as any,
    containerCompleted: {
      opacity: 0.75,
      borderLeftColor: theme.colors.accentGreen,
    } as any,
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    } as any,
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.semanticRadii.buttonRadius,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    } as any,
    iconText: {
      fontSize: 18,
      fontWeight: '700',
    } as any,
    titleBlock: {
      flex: 1,
      gap: 4,
    } as any,
    title: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
    } as any,
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: theme.colors.textTertiary,
    } as any,
    badgeRow: {
      flexDirection: 'row',
      gap: 6,
    } as any,
    typeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.semanticRadii.chipRadius,
    } as any,
    typeBadgeText: {
      ...theme.typography.caption.style,
      fontWeight: '700',
    } as any,
    description: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    } as any,
    descriptionCompleted: {
      color: theme.colors.textDisabled,
    } as any,
    progressSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    } as any,
    progressTrack: {
      flex: 1,
      height: 6,
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: theme.semanticRadii.progressBarRadius,
      overflow: 'hidden',
    } as any,
    progressFill: {
      height: '100%',
      borderRadius: theme.semanticRadii.progressBarRadius,
    } as any,
    progressLabel: {
      ...theme.typography.code.style,
      color: theme.colors.textTertiary,
      fontSize: 10,
      minWidth: 48,
      textAlign: 'right',
    } as any,
    rewardsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    } as any,
    rewardChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.semanticRadii.chipRadius,
      backgroundColor: theme.colors.bgTertiary,
    } as any,
    rewardIcon: {
      fontSize: 12,
    } as any,
    rewardText: {
      ...theme.typography.labelSmall.style,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
    } as any,
    completedBadge: {
      marginLeft: 'auto',
      backgroundColor: `${theme.colors.accentGreen}20`,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: theme.semanticRadii.chipRadius,
    } as any,
    completedText: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.accentGreen,
      fontWeight: '700',
    } as any,
  }),
);
