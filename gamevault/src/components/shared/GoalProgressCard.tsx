/**
 * GoalProgressCard — Shows progress for a savings goal.
 *
 * Features: circular progress indicator (64px), formatted amounts,
 * percentage, estimated date, animated spring update via Reanimated.
 */

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useTheme, createStyles, applyShadow } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
export interface GoalProgressCardProps {
  goalId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  estimatedDate?: string;
  onPress?: (goalId: string) => void;
}

// ── Constants ──────────────────────────────────────────────────
const CIRCLE_SIZE = 64;
const STROKE_WIDTH = 5;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── Helpers ────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getProgressFraction(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.max(current / target, 0), 1);
}

function formatEstimatedDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Мета досягнута!';
  if (diffDays <= 30) return `~${diffDays} дн.`;
  const diffMonths = Math.ceil(diffDays / 30);
  if (diffMonths <= 12) return `~${diffMonths} міс.`;
  const diffYears = Math.floor(diffMonths / 12);
  return `~${diffYears} р.`;
}

// ── Component ──────────────────────────────────────────────────
export function GoalProgressCard({
  goalId,
  title,
  targetAmount,
  currentAmount,
  icon,
  color,
  estimatedDate,
  onPress,
}: GoalProgressCardProps) {
  const theme = useTheme();
  const styles = useGoalProgressCardStyles(theme);
  const progress = getProgressFraction(currentAmount, targetAmount);

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withDelay(
      150,
      withSpring(progress, {
        damping: 15,
        stiffness: 120,
        mass: 1,
      }),
    );
  }, [progress, animatedProgress]);

  const strokeDashoffset = useSharedValue(CIRCUMFERENCE);

  useEffect(() => {
    strokeDashoffset.value = CIRCUMFERENCE * (1 - animatedProgress.value);
  }, [animatedProgress, strokeDashoffset]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  const percentage = Math.round(progress * 100);
  const remaining = Math.max(targetAmount - currentAmount, 0);

  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress?.(goalId)}
      android_ripple={{ color: theme.colors.borderSubtle, borderless: false }}
    >
      {/* Circular progress */}
      <View style={styles.circleContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          {/* Background track */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={theme.colors.bgTertiary}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeLinecap="round"
            animatedProps={animatedCircleProps}
            rotation="-90"
            originX={CIRCLE_SIZE / 2}
            originY={CIRCLE_SIZE / 2}
          />
        </Svg>
        {/* Center icon */}
        <View style={styles.circleIconOverlay}>
          <Text style={styles.circleIcon}>{icon}</Text>
        </View>
      </View>

      {/* Text content */}
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.currentAmount, { color }]}>
            {formatCurrency(currentAmount)}
          </Text>
          <Text style={styles.amountSeparator}>/</Text>
          <Text style={styles.targetAmount}>
            {formatCurrency(targetAmount)}
          </Text>
        </View>
        {remaining > 0 ? (
          <Text style={styles.remaining}>
            Залишилось: {formatCurrency(remaining)}
          </Text>
        ) : (
          <Text style={[styles.remaining, { color: theme.colors.accentGreen }]}>
            Мета досягнута!
          </Text>
        )}
      </View>

      {/* Percentage + estimated date */}
      <View style={styles.rightBlock}>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
        {estimatedDate ? (
          <Text style={styles.estimatedDate}>
            {formatEstimatedDate(estimatedDate)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useGoalProgressCardStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bgSurface,
      borderRadius: theme.semanticRadii.cardRadius,
      padding: theme.semanticSpacing.cardPadding,
      gap: theme.spacing.md,
      ...applyShadow('elevation1'),
    } as any,
    circleContainer: {
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    } as any,
    circleIconOverlay: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    } as any,
    circleIcon: {
      fontSize: 20,
    } as any,
    textBlock: {
      flex: 1,
      gap: 3,
    } as any,
    title: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
    } as any,
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    } as any,
    currentAmount: {
      ...theme.typography.titleMedium.style,
      fontFamily: theme.fontFamilies.mono,
      fontWeight: '700',
    } as any,
    amountSeparator: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
    } as any,
    targetAmount: {
      ...theme.typography.bodySmall.style,
      fontFamily: theme.fontFamilies.mono,
      color: theme.colors.textTertiary,
    } as any,
    remaining: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      fontFamily: theme.fontFamilies.mono,
      fontSize: 10,
    } as any,
    rightBlock: {
      alignItems: 'flex-end',
      gap: 4,
      minWidth: 56,
    } as any,
    percentage: {
      ...theme.typography.statSmall.style,
      fontSize: 20,
      fontWeight: '800',
    } as any,
    estimatedDate: {
      ...theme.typography.bodyTiny.style,
      color: theme.colors.textTertiary,
      fontFamily: theme.fontFamilies.mono,
    } as any,
  }),
);
