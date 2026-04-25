import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Chip } from '@/components/ui/Chip';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';

interface NotificationSetting {
  key: string;
  labelKey: string;
  icon: string;
  descKey: string;
}

const WARNING_HOURS = [1, 2, 4, 6, 12, 24];

export default function NotificationsScreen() {
  const theme = useTheme();
  const styles = useNotificationsStyles(theme);
  const settings = useSettingsStore();
  const { t } = useLocalized();
  const [warningHours, setWarningHours] = useState(2);
  const [quietFrom, setQuietFrom] = useState(22);
  const [quietTo, setQuietTo] = useState(8);
  const [quietEnabled, setQuietEnabled] = useState(false);

  const NOTIFICATION_CHANNELS: NotificationSetting[] = useMemo(() => [
    { key: 'quests', labelKey: 'profile.notifications.channelQuests', icon: '⚔️', descKey: 'profile.notifications.channelQuestsDesc' },
    { key: 'achievements', labelKey: 'profile.notifications.channelAchievements', icon: '🏆', descKey: 'profile.notifications.channelAchievementsDesc' },
    { key: 'reminders', labelKey: 'profile.notifications.channelReminders', icon: '⏰', descKey: 'profile.notifications.channelRemindersDesc' },
    { key: 'social', labelKey: 'profile.notifications.channelSocial', icon: '👥', descKey: 'profile.notifications.channelSocialDesc' },
    { key: 'streak', labelKey: 'profile.notifications.channelStreak', icon: '🔥', descKey: 'profile.notifications.channelStreakDesc' },
  ], []);

  const handleToggle = (key: string, value: boolean) => {
    settings.updateNotifications({ [key]: value });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.notifications.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Notification Channels */}
        <Text style={styles.sectionTitle}>{t('profile.notifications.channels')}</Text>
        <Card style={styles.channelsCard}>
          {NOTIFICATION_CHANNELS.map((channel) => {
            const isEnabled = (settings.notifications as Record<string, boolean>)[channel.key] ?? true;
            return (
              <View key={channel.key} style={styles.channelRow}>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelIcon}>{channel.icon}</Text>
                  <View style={styles.channelText}>
                    <Text style={styles.channelLabel}>{t(channel.labelKey)}</Text>
                    <Text style={styles.channelDesc}>{t(channel.descKey)}</Text>
                  </View>
                </View>
                <Toggle
                  value={isEnabled}
                  onValueChange={(val) => handleToggle(channel.key, val)}
                />
              </View>
            );
          })}
        </Card>

        {/* Streak Warning */}
        <Text style={styles.sectionTitle}>{t('profile.notifications.streakWarningSection')}</Text>
        <Card style={styles.settingCard}>
          <Text style={styles.settingLabel}>{t('profile.notifications.remindBefore')}</Text>
          <View style={styles.hourRow}>
            {WARNING_HOURS.map((h) => (
              <Chip
                key={h}
                label={`${h}г`}
                selected={warningHours === h}
                onPress={() => setWarningHours(h)}
              />
            ))}
          </View>
          <Text style={styles.settingDesc}>
            {t('profile.notifications.streakWarningDesc', { hours: warningHours })}
          </Text>
        </Card>

        {/* Quiet Hours */}
        <Text style={styles.sectionTitle}>{t('profile.notifications.quietHours')}</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('profile.notifications.enableQuietHours')}</Text>
              <Text style={styles.settingDesc}>{t('profile.notifications.quietHoursDesc')}</Text>
            </View>
            <Toggle value={quietEnabled} onValueChange={setQuietEnabled} />
          </View>
          {quietEnabled && (
            <View style={styles.quietTimes}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>{t('profile.notifications.quietFrom')}</Text>
                <View style={styles.chipRow}>
                  {[20, 21, 22, 23, 0].map((h) => (
                    <Chip key={h} label={`${String(h).padStart(2, '0')}:00`} selected={quietFrom === h} onPress={() => setQuietFrom(h)} />
                  ))}
                </View>
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>{t('profile.notifications.quietTo')}</Text>
                <View style={styles.chipRow}>
                  {[6, 7, 8, 9, 10].map((h) => (
                    <Chip key={h} label={`${String(h).padStart(2, '0')}:00`} selected={quietTo === h} onPress={() => setQuietTo(h)} />
                  ))}
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Save */}
        <Button label={t('profile.notifications.saveSettings')} size="lg" fullWidth onPress={() => {}} />
      </ScreenLayout>
    </>
  );
}

const useNotificationsStyles = createStyles((theme) =>
  StyleSheet.create({
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    channelsCard: { marginBottom: theme.spacing.lg },
    channelRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1, borderBottomColor: theme.colors.borderSubtle,
    },
    channelInfo: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 },
    channelIcon: { fontSize: 20 },
    channelText: { flex: 1 },
    channelLabel: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    channelDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary },
    settingCard: { marginBottom: theme.spacing.md },
    settingLabel: { ...theme.typography.labelMedium.style, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
    settingDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, marginTop: theme.spacing.sm },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    settingInfo: { flex: 1 },
    hourRow: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
    quietTimes: { marginTop: theme.spacing.md, gap: theme.spacing.md },
    timeBlock: {},
    timeLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
    chipRow: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  }),
);
