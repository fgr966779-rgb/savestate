/**
 * Screen 46 — Tutorial Overlay
 *
 * Full-screen modal overlay that walks the user through 5 key UI areas
 * of the Home Dashboard. Each step shows an animated spotlight circle
 * and a tooltip bubble with explanation. Supports "Don't show again",
 * auto-save of current step, haptic feedback on step change, and a
 * completion badge unlock (+200 XP mock).
 *
 * Ukrainian language · Dark theme · createStyles
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles, triggerHaptic, triggerNotification, triggerHapticSequence } from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { MMKV } from 'react-native-mmkv';
import { useQuestStore } from '@/stores/useQuestStore';

// ── MMKV for tutorial persistence ────────────────────────────────
const mmkv = new MMKV();

const TUTORIAL_STEP_KEY = 'SaveState-tutorial-step';
const TUTORIAL_DISMISSED_KEY = 'SaveState-tutorial-dismissed';

// ── Types ────────────────────────────────────────────────────────

interface TutorialStep {
  id: number;
  icon: string;
  title: string;
  description: string;
  /** Spotlight position as fraction of screen */
  spotX: number;
  spotY: number;
  spotSize: number;
  /** Tooltip placement relative to spotlight */
  tooltipBelow: boolean;
}

// ── Step Definitions ─────────────────────────────────────────────

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const TOTAL_STEPS = 5;

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    icon: '📊',
    title: 'Твій прогрес',
    description:
      'Кругова діаграма показує, скільки ти вже зберіг. Натисни, щоб побачити деталі цілі та термін.',
    spotX: SCREEN_W * 0.5,
    spotY: SCREEN_H * 0.26,
    spotSize: 100,
    tooltipBelow: true,
  },
  {
    id: 2,
    icon: '⚡',
    title: 'Швидкі дії',
    description:
      'Поповни скарбничку або зніни кошти одним натиском. Доступні кнопки «Поповнити» та «Зняти».',
    spotX: SCREEN_W * 0.3,
    spotY: SCREEN_H * 0.50,
    spotSize: 90,
    tooltipBelow: false,
  },
  {
    id: 3,
    icon: '🏆',
    title: 'Квести та XP',
    description:
      'Виконуй щоденні квести, заробляй XP та піднімай рівень. Більше квестів — ближче до цілі!',
    spotX: SCREEN_W * 0.5,
    spotY: SCREEN_H * 0.68,
    spotSize: 80,
    tooltipBelow: false,
  },
  {
    id: 4,
    icon: '🔥',
    title: 'Стрік',
    description:
      'Підтримуй щоденну активність, щоб зберігати вогонь стріку. Що довший стрік — то більший бонус!',
    spotX: SCREEN_W * 0.72,
    spotY: SCREEN_H * 0.055,
    spotSize: 48,
    tooltipBelow: true,
  },
  {
    id: 5,
    icon: '⚙️',
    title: 'Налаштування',
    description:
      'Тут ти знайдеш профіль, тему, мову та інші параметри. Налаштуй додаток під себе!',
    spotX: SCREEN_W * 0.9,
    spotY: SCREEN_H * 0.055,
    spotSize: 48,
    tooltipBelow: true,
  },
];

// ── Animated Spotlight Ring ───────────────────────────────────────

function SpotlightRing({
  x,
  y,
  size,
}: {
  x: number;
  y: number;
  size: number;
}) {
  const pulse = useSharedValue(0);
  const opacity = useSharedValue(0.9);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - size / 2 },
      { translateY: y - size / 2 },
      { scale: 1 + pulse.value * 0.12 },
    ],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - (size + 20) / 2 },
      { translateY: y - (size + 20) / 2 },
      { scale: 1 + pulse.value * 0.18 },
    ],
    opacity: 0.3 + pulse.value * 0.15,
  }));

  return (
    <>
      {/* Outer glow */}
      <Animated.View
        pointerEvents="none"
        style={[glowStyle, styles.spotlightGlow]}
      />
      {/* Main circle */}
      <Animated.View pointerEvents="none" style={[ringStyle, styles.spotlightCircle]} />
      {/* Bright center */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', left: x - size * 0.3 / 2, top: y - size * 0.3 / 2 },
          styles.spotlightCenter,
        ]}
      />
    </>
  );
}

// ── Tooltip Bubble ────────────────────────────────────────────────

function TooltipBubble({
  step,
  stepIndex,
  total,
}: {
  step: TutorialStep;
  stepIndex: number;
  total: number;
}) {
  const theme = useTheme();
  const styles = useTooltipStyles(theme);

  return (
    <Animated.View
      entering={FadeIn.duration(350).springify()}
      exiting={FadeOut.duration(150)}
      style={[
        styles.tooltip,
        step.tooltipBelow
          ? { top: step.spotY + step.spotSize / 2 + 16 }
          : { bottom: SCREEN_H - step.spotY + step.spotSize / 2 + 16 },
      ]}
    >
      {/* Arrow */}
      <View
        style={[
          styles.tooltipArrow,
          step.tooltipBelow ? styles.arrowUp : styles.arrowDown,
        ]}
      />
      {/* Content */}
      <View style={styles.tooltipContent}>
        <Text style={styles.tooltipIcon}>{step.icon}</Text>
        <View style={styles.tooltipTextBlock}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipTitle}>{step.title}</Text>
            <Text style={styles.tooltipStepBadge}>
              {stepIndex + 1}/{total}
            </Text>
          </View>
          <Text style={styles.tooltipDescription}>{step.description}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Progress Dots ─────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={progressDotsStyles.container}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            progressDotsStyles.dot,
            i === current
              ? progressDotsStyles.dotActive
              : progressDotsStyles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const progressDotsStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#00AAFF',
    width: 24,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

// ── Completion Card ───────────────────────────────────────────────

function CompletionCard({
  onDismiss,
  onDontShowAgain,
}: {
  onDismiss: () => void;
  onDontShowAgain: () => void;
}) {
  const theme = useTheme();
  const styles = useCompletionStyles(theme);
  const { addXP } = useQuestStore();

  useEffect(() => {
    triggerHapticSequence([
      { key: 'achievementUnlock', delayMs: 200 },
      { key: 'coinSpin', delayMs: 600 },
    ]);
    addXP(200);
  }, [addXP]);

  return (
    <View style={styles.completionOverlay}>
      <Animated.View entering={FadeIn.duration(500).springify()} style={styles.completionCard}>
        <Text style={styles.badgeIcon}>🏅</Text>
        <Text style={styles.badgeTitle}>Першокурсник</Text>
        <Text style={styles.badgeSubtitle}>Бадж розблоковано!</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+200 XP</Text>
        </View>
        <Text style={styles.completionDescription}>
          Ти пройшов навчання! Тепер знаєш основи SaveState. Успіхів у заощадженнях!
        </Text>

        <Pressable
          style={styles.dontShowRow}
          onPress={onDontShowAgain}
          accessibilityLabel="Не показувати знову"
          accessibilityRole="switch"
        >
          <View style={styles.checkbox} />
          <Text style={styles.dontShowLabel}>Не показувати знову</Text>
        </Pressable>

        <Button
          variant="primary"
          size="lg"
          label="Чудово!"
          fullWidth
          onPress={onDismiss}
        />
      </Animated.View>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function TutorialOverlay() {
  const theme = useTheme();
  const styles = useOverlayStyles(theme);

  const savedStep = Number(mmkv.getString(TUTORIAL_STEP_KEY) ?? '0');
  const [currentStep, setCurrentStep] = useState(savedStep);
  const [isComplete, setIsComplete] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(
    mmkv.getBoolean(TUTORIAL_DISMISSED_KEY) ?? false,
  );

  const step = useMemo(() => TUTORIAL_STEPS[currentStep], [currentStep]);
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOTAL_STEPS - 1;

  // ── Persist step on change ─────────────────────────────────────
  useEffect(() => {
    mmkv.set(TUTORIAL_STEP_KEY, String(currentStep));
  }, [currentStep]);

  // ── Handle step change with haptic ─────────────────────────────
  const goNext = useCallback(() => {
    if (isLast) {
      triggerNotification('success');
      setIsComplete(true);
    } else {
      triggerHaptic('tabSwitch');
      setCurrentStep((s) => s + 1);
    }
  }, [isLast]);

  const goPrev = useCallback(() => {
    if (!isFirst) {
      triggerHaptic('tabSwitch');
      setCurrentStep((s) => s - 1);
    }
  }, [isFirst]);

  const skipAll = useCallback(() => {
    triggerHaptic('buttonPress');
    setIsComplete(true);
  }, []);

  const dismiss = useCallback(() => {
    if (dontShowAgain) {
      mmkv.set(TUTORIAL_DISMISSED_KEY, 'true');
    }
    mmkv.set(TUTORIAL_STEP_KEY, String(TOTAL_STEPS));
    // Use router back or just unmount
    // Since this is a modal overlay, we dismiss via Stack
  }, [dontShowAgain]);

  const toggleDontShowAgain = useCallback(() => {
    setDontShowAgain((v) => !v);
  }, []);

  const handleDontShowAndDismiss = useCallback(() => {
    setDontShowAgain(true);
    mmkv.set(TUTORIAL_DISMISSED_KEY, 'true');
    mmkv.set(TUTORIAL_STEP_KEY, String(TOTAL_STEPS));
  }, []);

  // ── Dismiss on tap outside tooltip area ────────────────────────
  const handleBackdropTap = useCallback(
    (evt: any) => {
      // Only dismiss if tap is far from the spotlight
      const { locationX, locationY } = evt.nativeEvent;
      const dx = locationX - step.spotX;
      const dy = locationY - step.spotY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > step.spotSize) {
        triggerHaptic('buttonPress');
        skipAll();
      }
    },
    [step, skipAll],
  );

  // ── Completion state ───────────────────────────────────────────
  if (isComplete) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false, presentation: 'transparentModal' }} />
        <CompletionCard onDismiss={dismiss} onDontShowAgain={handleDontShowAndDismiss} />
      </>
    );
  }

  // ── Tutorial steps ─────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'transparentModal' }} />

      <Pressable style={styles.backdrop} onPress={handleBackdropTap}>
        {/* Dark overlay */}
        <View style={styles.overlayBg} />

        {/* Spotlight ring */}
        <SpotlightRing x={step.spotX} y={step.spotY} size={step.spotSize} />

        {/* Tooltip */}
        <TooltipBubble step={step} stepIndex={currentStep} total={TOTAL_STEPS} />
      </Pressable>

      {/* Bottom controls */}
      <Animated.View
        entering={FadeIn.delay(200).duration(300)}
        style={styles.bottomControls}
        pointerEvents="box-none"
      >
        {/* Progress dots */}
        <ProgressDots current={currentStep} total={TOTAL_STEPS} />

        {/* Nav buttons */}
        <View style={styles.navRow}>
          <Button
            variant="ghost"
            size="sm"
            label="Назад"
            icon={<Text style={styles.btnIcon}>←</Text>}
            onPress={goPrev}
            disabled={isFirst}
          />
          <Button
            variant="ghost"
            size="sm"
            label="Пропустити все"
            onPress={skipAll}
          />
        </View>

        {/* Don't show again toggle */}
        <Pressable style={styles.dontShowRow} onPress={toggleDontShowAgain}>
          <View
            style={[
              styles.checkbox,
              dontShowAgain && styles.checkboxActive,
            ]}
          >
            {dontShowAgain && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.dontShowLabel}>Не показувати знову</Text>
        </Pressable>
      </Animated.View>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const useOverlayStyles = createStyles((theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 9999,
    },
    overlayBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#0A0A0F',
      opacity: 0.85,
    },
    bottomControls: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: 48,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      zIndex: 10001,
    },
    navRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    btnIcon: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    dontShowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.colors.borderDefault,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxActive: {
      backgroundColor: theme.colors.accentBlue,
      borderColor: theme.colors.accentBlue,
    },
    checkmark: {
      fontSize: 12,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    dontShowLabel: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
    },
  }),
);

const useTooltipStyles = createStyles((theme) =>
  StyleSheet.create({
    tooltip: {
      position: 'absolute',
      left: 20,
      right: 20,
      zIndex: 10000,
    },
    tooltipArrow: {
      width: 0,
      height: 0,
      borderLeftWidth: 12,
      borderRightWidth: 12,
      borderBottomWidth: 12,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: theme.colors.bgTertiary,
      alignSelf: 'center',
    },
    arrowUp: {
      borderBottomWidth: 12,
      borderTopWidth: 0,
      borderBottomColor: theme.colors.bgTertiary,
    },
    arrowDown: {
      borderBottomWidth: 0,
      borderTopWidth: 12,
      borderTopColor: theme.colors.bgTertiary,
    },
    tooltipContent: {
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderDefault,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 12,
    },
    tooltipIcon: {
      fontSize: 32,
      alignSelf: 'center',
    },
    tooltipTextBlock: {
      gap: theme.spacing.xs,
    },
    tooltipHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tooltipTitle: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
    },
    tooltipStepBadge: {
      ...theme.typography.code.style,
      color: theme.colors.accentBlueLight,
      backgroundColor: 'rgba(0,112,209,0.2)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.radii.sm,
      overflow: 'hidden',
    },
    tooltipDescription: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
  }),
);

const useCompletionStyles = createStyles((theme) =>
  StyleSheet.create({
    completionOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10,10,15,0.92)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      paddingHorizontal: theme.spacing.xl,
    },
    completionCard: {
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.borderDefault,
      padding: theme.spacing.xl,
      alignItems: 'center',
      gap: theme.spacing.md,
      width: '100%',
      maxWidth: 360,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.6,
      shadowRadius: 32,
      elevation: 16,
    },
    badgeIcon: {
      fontSize: 72,
    },
    badgeTitle: {
      ...theme.typography.headingLarge.style,
      color: theme.colors.accentGold,
      textAlign: 'center',
    },
    badgeSubtitle: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    xpBadge: {
      backgroundColor: 'rgba(0,255,136,0.15)',
      borderRadius: theme.radii.full,
      borderWidth: 1,
      borderColor: theme.colors.accentGreen,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
    },
    xpText: {
      ...theme.typography.labelLarge.style,
      color: theme.colors.accentGreen,
      fontWeight: '700',
    },
    completionDescription: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    dontShowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.colors.borderDefault,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dontShowLabel: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
    },
  }),
);

// ── Shared static styles for spotlight ────────────────────────────

const styles = StyleSheet.create({
  spotlightCircle: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: '#00AAFF',
    backgroundColor: 'transparent',
    shadowColor: '#00AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  spotlightGlow: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(0,170,255,0.3)',
    backgroundColor: 'rgba(0,170,255,0.08)',
  },
  spotlightCenter: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(0,170,255,0.06)',
  },
});
