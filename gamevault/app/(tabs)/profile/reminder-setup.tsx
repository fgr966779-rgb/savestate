import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Chip } from '@/components/ui/Chip';
import { useLocalized } from '@/hooks/useLocalized';

// ── Component ──────────────────────────────────────────────────
export default function ReminderSetupScreen() {
  const theme = useTheme();
  const styles = useReminderStyles(theme);
  const { t } = useLocalized();

  const DAYS: { key: string; labelKey: string }[] = [
    { key: 'mon', labelKey: 'common.days.0' },
    { key: 'tue', labelKey: 'common.days.1' },
    { key: 'wed', labelKey: 'common.days.2' },
    { key: 'thu', labelKey: 'common.days.3' },
    { key: 'fri', labelKey: 'common.days.4' },
    { key: 'sat', labelKey: 'common.days.5' },
    { key: 'sun', labelKey: 'common.days.6' },
  ];

  const MESSAGE_TYPES: { key: string; labelKey: string; icon: string }[] = [
    { key: 'motivational', labelKey: 'profile.reminder.typeMotivational', icon: '💪' },
    { key: 'quest', labelKey: 'profile.reminder.typeQuest', icon: '⚔️' },
    { key: 'stats', labelKey: 'profile.reminder.typeStats', icon: '📊' },
  ];

  const [hour, setHour] = useState(19);
  const [minute, setMinute] = useState(0);
  const [colonVisible, setColonVisible] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    new Set(['mon', 'tue', 'wed', 'thu', 'fri']),
  );
  const [messageType, setMessageType] = useState('motivational');

  // Blink colon every 500ms
  useEffect(() => {
    const id = setInterval(() => setColonVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  const adjustHour = useCallback((delta: number) => {
    triggerHaptic('buttonPress');
    setHour((h) => (h + delta + 24) % 24);
  }, []);

  const adjustMinute = useCallback((delta: number) => {
    triggerHaptic('buttonPress');
    setMinute((m) => (m + delta + 60) % 60);
  }, []);

  const toggleDay = useCallback((key: string) => {
    triggerHaptic('buttonPress');
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectMessageType = useCallback((key: string) => {
    triggerHaptic('buttonPress');
    setMessageType(key);
  }, []);

  const handleSave = useCallback(() => {
    triggerHaptic('questComplete');
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  const getPreviewMessage = () => {
    if (messageType === 'motivational') return t('profile.reminder.previewMotivational');
    if (messageType === 'quest') return t('profile.reminder.previewQuest');
    return t('profile.reminder.previewStats');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.reminder.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>

        {/* Master toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{t('profile.reminder.enable')}</Text>
          <Toggle value={enabled} onValueChange={() => { triggerHaptic('buttonPress'); setEnabled((v) => !v); }} />
        </View>

        {/* ── Time Picker ──────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('profile.reminder.time')}</Text>
        <Card style={styles.timePickerCard}>
          <View style={styles.timePickerRow}>
            {/* Hour */}
            <View style={styles.timeColumn}>
              <TouchableOpacity
                style={styles.arrowBtn}
                onPress={() => adjustHour(1)}
                activeOpacity={0.6}
              >
                <Text style={styles.arrowText}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.timeDigit}>{pad(hour)}</Text>
              <TouchableOpacity
                style={styles.arrowBtn}
                onPress={() => adjustHour(-1)}
                activeOpacity={0.6}
              >
                <Text style={styles.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Blinking colon */}
            <Text style={[styles.colon, { opacity: colonVisible ? 1 : 0.2 }]}>:</Text>

            {/* Minute */}
            <View style={styles.timeColumn}>
              <TouchableOpacity
                style={styles.arrowBtn}
                onPress={() => adjustMinute(1)}
                activeOpacity={0.6}
              >
                <Text style={styles.arrowText}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.timeDigit}>{pad(minute)}</Text>
              <TouchableOpacity
                style={styles.arrowBtn}
                onPress={() => adjustMinute(-1)}
                activeOpacity={0.6}
              >
                <Text style={styles.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* ── Days of Week ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('profile.reminder.daysOfWeek')}</Text>
        <View style={styles.daysRow}>
          {DAYS.map((day) => (
            <Chip
              key={day.key}
              label={t(day.labelKey)}
              selected={selectedDays.has(day.key)}
              onPress={() => toggleDay(day.key)}
            />
          ))}
        </View>

        {/* ── Message Type ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('profile.reminder.messageType')}</Text>
        <Card style={styles.messageTypeCard}>
          {MESSAGE_TYPES.map((mt) => (
            <TouchableOpacity
              key={mt.key}
              style={styles.radioRow}
              onPress={() => selectMessageType(mt.key)}
              activeOpacity={0.6}
            >
              <Text style={styles.radioIcon}>
                {messageType === mt.key ? '◉' : '○'}
              </Text>
              <Text style={styles.radioEmoji}>{mt.icon}</Text>
              <Text
                style={[
                  styles.radioLabel,
                  messageType === mt.key && styles.radioLabelActive,
                ]}
              >
                {t(mt.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* ── Preview Notification ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('profile.reminder.preview')}</Text>
        <Card style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewAppIcon}>🎮</Text>
            <View style={styles.previewHeaderText}>
              <Text style={styles.previewAppName}>SaveState</Text>
              <Text style={styles.previewTime}>{t('profile.reminder.now')}</Text>
            </View>
          </View>
          <Text style={styles.previewBody}>{getPreviewMessage()}</Text>
          <View style={styles.previewFooter}>
            <Text style={styles.previewStreak}>{t('profile.reminder.streakPreview')}</Text>
          </View>
        </Card>

        {/* ── Save ─────────────────────────────────────────────── */}
        <Button
          label={t('profile.reminder.save')}
          size="lg"
          fullWidth
          onPress={handleSave}
        />
      </ScreenLayout>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const useReminderStyles = createStyles((theme) =>
  StyleSheet.create({
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    toggleLabel: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
    },
    sectionTitle: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    timePickerCard: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    timePickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    timeColumn: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    timeDigit: {
      ...theme.typography.statLarge.style,
      fontFamily: theme.fontFamilies.mono,
      color: theme.colors.accentBlueLight,
      width: 96,
      textAlign: 'center',
    },
    colon: {
      ...theme.typography.displayLarge.style,
      color: theme.colors.accentGold,
      marginTop: -theme.spacing['3xl'],
    },
    arrowBtn: {
      width: 64,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.bgTertiary,
    },
    arrowText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    daysRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      flexWrap: 'wrap',
    },
    messageTypeCard: {
      marginBottom: theme.spacing.lg,
    },
    radioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    radioIcon: {
      fontSize: 18,
      color: theme.colors.accentBlue,
      width: 22,
    },
    radioEmoji: {
      fontSize: 18,
    },
    radioLabel: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textTertiary,
    },
    radioLabelActive: {
      color: theme.colors.textPrimary,
    },
    previewCard: {
      marginBottom: theme.spacing.lg,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accentBlue,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    previewAppIcon: {
      fontSize: 20,
    },
    previewHeaderText: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    previewAppName: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
    },
    previewTime: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
    },
    previewBody: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      lineHeight: 22,
    },
    previewFooter: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderSubtle,
      paddingTop: theme.spacing.sm,
    },
    previewStreak: {
      ...theme.typography.labelSmall.style,
      color: theme.colors.accentGold,
    },
  }),
);
