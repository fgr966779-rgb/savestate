import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle, Path, Text as SvgText, G } from 'react-native-svg';
import { useTheme, createStyles, triggerImpact, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuestStore } from '@/stores/useQuestStore';

const SEGMENTS = [
  { label: '+25 XP', color: '#00AAFF', angle: 45 },
  { label: '+50 XP', color: '#00FF88', angle: 45 },
  { label: '+100 XP', color: '#FFD700', angle: 45 },
  { label: '+30 🪙', color: '#FF6B00', angle: 45 },
  { label: '+10 🪙', color: '#9D4EDD', angle: 45 },
  { label: '+75 XP', color: '#FF3B8B', angle: 45 },
  { label: '+20 🪙', color: '#00D4AA', angle: 45 },
  { label: '❄️', color: '#4ECDC4', angle: 45 },
];

const WHEEL_RADIUS = 120;
const WHEEL_CENTER = WHEEL_RADIUS + 20;
const WHEEL_SIZE = WHEEL_CENTER * 2;

export default function WheelScreen() {
  const theme = useTheme();
  const styles = useWheelStyles(theme);
  const { spinBonusWheel } = useQuestStore();

  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [cooldown, setCooldown] = useState(0);

  const rotation = useSharedValue(0);

  const rotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleSpin = useCallback(() => {
    if (isSpinning || cooldown > 0) return;
    setIsSpinning(true);
    setResult(null);
    triggerImpact('medium');

    const targetAngle = Math.floor(Math.random() * 360) + 360 * 3;
    rotation.value = withTiming(rotation.value + targetAngle, {
      duration: 3000,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        const { reward } = spinBonusWheel();
        setResult(reward.description);
        setHistory((prev) => [reward.description, ...prev].slice(0, 10));
        setIsSpinning(false);
        setCooldown(60);
        triggerHaptic('questComplete');
      }
    });
  }, [isSpinning, cooldown, rotation, spinBonusWheel]);

  const buildWheelPath = useCallback((startAngle: number, endAngle: number): string => {
    const r = WHEEL_RADIUS;
    const cx = WHEEL_CENTER;
    const cy = WHEEL_CENTER;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <ScreenLayout scrollable>
        <View style={styles.container}>
          <HeaderBar title="Бонусне колесо" />

          {/* Wheel */}
          <View style={styles.wheelWrapper}>
            <Animated.View style={rotStyle}>
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                {SEGMENTS.map((seg, i) => {
                  const start = i * 45;
                  const end = (i + 1) * 45;
                  return <Path key={i} d={buildWheelPath(start, end)} fill={seg.color} stroke={theme.colors.bgPrimary} strokeWidth={1} />;
                })}
                <Circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r={24} fill={theme.colors.bgPrimary} />
              </Svg>
            </Animated.View>
            {/* Center button */}
            <View style={styles.centerButton}>
              <Button label={isSpinning ? '...' : 'КРУТИТИ'} size="sm" onPress={handleSpin} disabled={isSpinning || cooldown > 0} />
            </View>
            {/* Pointer */}
            <View style={styles.pointer}>
              <Text style={styles.pointerText}>▼</Text>
            </View>
          </View>

          {/* Cooldown */}
          {cooldown > 0 && (
            <Text style={styles.cooldownText}>Наступне обертання через {cooldown}с</Text>
          )}

          {/* Result */}
          {result && (
            <Card variant="achievement" style={styles.resultCard}>
              <Text style={styles.resultLabel}>Ви виграли:</Text>
              <Text style={styles.resultText}>{result}</Text>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Історія</Text>
              {history.map((item, i) => (
                <Text key={i} style={styles.historyItem}>{i + 1}. {item}</Text>
              ))}
            </View>
          )}
        </View>
      </ScreenLayout>
    </>
  );
}

const useWheelStyles = createStyles((theme) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center' },
    wheelWrapper: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
    centerButton: { position: 'absolute', top: WHEEL_CENTER - 22, left: WHEEL_CENTER - 50, width: 100, alignItems: 'center' },
    pointer: { position: 'absolute', top: -8, alignItems: 'center' },
    pointerText: { fontSize: 24, color: theme.colors.accentRed },
    cooldownText: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary, marginBottom: theme.spacing.md },
    resultCard: { marginBottom: theme.spacing.lg, alignItems: 'center' },
    resultLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    resultText: { ...theme.typography.titleLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.xs },
    historySection: { width: '100%', padding: theme.spacing.md, backgroundColor: theme.colors.bgSecondary, borderRadius: theme.semanticRadii.cardRadius },
    historyTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    historyItem: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, paddingVertical: 2 },
  }),
);
