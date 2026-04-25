/**
 * AchievementCard — Displays an achievement with rarity-based styling.
 *
 * Features: rarity border colors, locked/unlocked states, hidden achievements,
 * gold glow for unlocked, progress bar for incomplete.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  useTheme,
  createStyles,
  applyShadow,
} from '@/constants/theme';
import { rarityConfig, type AchievementRarity } from '@/constants/achievements';

// ── Types ──────────────────────────────────────────────────────
export interface AchievementCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlocked: boolean;
  unlockedAt?: string;
  xpBonus?: number;
  hidden?: boolean;
  progress?: number;
  onPress?: (id: string) => void;
}

// ── Component ──────────────────────────────────────────────────
export function AchievementCard({
  id,
  title,
  description,
  icon,
  rarity,
  unlocked,
  unlockedAt,
  xpBonus,
  hidden = false,
  progress,
  onPress,
}: AchievementCardProps) {
  const theme = useTheme();
  const styles = useAchievementCardStyles(theme);
  const rarityData = rarityConfig[rarity];

  const isHidden = hidden && !unlocked;
  const displayTitle = isHidden ? '???' : title;
  const displayDescription = isHidden ? 'Секретне досягнення' : description;
  const displayIcon = isHidden ? '🔒' : icon;
  const progressFraction = progress != null ? Math.min(Math.max(progress, 0), 1) : undefined;

  const unlockDateLabel = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : undefined;

  return (
    <Pressable
      style={[
        styles.container,
        unlocked && { borderColor: rarityData.color, ...applyShadow('glowGold') as any },
        !unlocked && styles.containerLocked,
      ]}
      onPress={() => onPress?.(id)}
      android_ripple={{ color: theme.colors.borderSubtle, borderless: false }}
    >
      {/* Rarity stripe */}
      <View style={[styles.rarityStripe, { backgroundColor: rarityData.color }]} />

      {/* Content */}
      <View style={styles.contentRow}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            unlocked
              ? { backgroundColor: rarityData.bgColor }
              : { backgroundColor: theme.colors.bgTertiary },
          ]}
        >
          <Text
            style={[
              styles.iconText,
              unlocked
                ? { color: rarityData.color }
                : { color: theme.colors.textDisabled },
            ]}
          >
            {displayIcon}
          </Text>
        </View>

        {/* Text block */}
        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                unlocked ? styles.titleUnlocked : styles.titleLocked,
              ]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            <View style={[styles.rarityBadge, { backgroundColor: rarityData.bgColor }]}>
              <Text style={[styles.rarityBadgeText, { color: rarityData.color }]}>
                {rarityData.labelUk}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.description,
              unlocked ? styles.descUnlocked : styles.descLocked,
            ]}
            numberOfLines={2}
          >
            {displayDescription}
          </Text>

          {/* XP bonus */}
          {!isHidden && xpBonus != null && xpBonus > 0 ? (
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>Нагорода:</Text>
              <Text style={styles.xpValue}>+{xpBonus} XP</Text>
            </View>
          ) : null}

          {/* Progress bar for locked achievements */}
          {!unlocked && progressFraction != null && !isHidden ? (
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressFraction * 100}%`,
                      backgroundColor: rarityData.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {Math.round(progressFraction * 100)}%
              </Text>
            </View>
          ) : null}

          {/* Unlock date */}
          {unlocked && unlockDateLabel ? (
            <Text style={styles.unlockDate}>
              Розблоковано: {unlockDateLabel}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Unlocked checkmark overlay */}
      {unlocked ? (
        <View style={[styles.checkOverlay, { backgroundColor: rarityData.bgColor }]}>
          <Text style={{ color: rarityData.color, fontSize: 14, fontWeight: '700' }}>✓</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useAchievementCardStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.bgSurface,
      borderRadius: theme.semanticRadii.cardRadius,
      borderWidth: theme.borderWidths.thin,
      borderColor: theme.colors.borderSubtle,
      overflow: 'hidden',
      ...applyShadow('elevation1'),
    } as any,
    containerLocked: {
      opacity: 0.6,
    } as any,
    rarityStripe: {
      height: 3,
      width: '100%',
    } as any,
    contentRow: {
      flexDirection: 'row',
      padding: theme.semanticSpacing.cardPadding,
      gap: theme.spacing.md,
    } as any,
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.semanticRadii.buttonRadius,
      justifyContent: 'center',
      alignItems: 'center',
    } as any,
    iconText: {
      fontSize: 22,
    } as any,
    textBlock: {
      flex: 1,
      gap: 4,
    } as any,
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    } as any,
    title: {
      ...theme.typography.titleLarge.style,
      flex: 1,
    } as any,
    titleUnlocked: {
      color: theme.colors.textPrimary,
    } as any,
    titleLocked: {
      color: theme.colors.textTertiary,
    } as any,
    rarityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.semanticRadii.chipRadius,
    } as any,
    rarityBadgeText: {
      ...theme.typography.caption.style,
      fontWeight: '700',
      textTransform: 'uppercase',
    } as any,
    description: {
      ...theme.typography.bodyMedium.style,
    } as any,
    descUnlocked: {
      color: theme.colors.textSecondary,
    } as any,
    descLocked: {
      color: theme.colors.textTertiary,
      fontStyle: 'italic',
    } as any,
    xpRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    } as any,
    xpLabel: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
    } as any,
    xpValue: {
      ...theme.typography.code.style,
      color: theme.colors.accentGreen,
      fontWeight: '700',
    } as any,
    progressSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: 4,
    } as any,
    progressTrack: {
      flex: 1,
      height: 5,
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: theme.semanticRadii.progressBarRadius,
      overflow: 'hidden',
    } as any,
    progressFill: {
      height: '100%',
      borderRadius: theme.semanticRadii.progressBarRadius,
    } as any,
    progressLabel: {
      ...theme.typography.caption.style,
      fontFamily: theme.fontFamilies.mono,
      color: theme.colors.textTertiary,
      minWidth: 36,
      textAlign: 'right',
    } as any,
    unlockDate: {
      ...theme.typography.bodyTiny.style,
      color: theme.colors.textTertiary,
      marginTop: 2,
    } as any,
    checkOverlay: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    } as any,
  }),
);
