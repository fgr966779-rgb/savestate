import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, Linking, Share } from 'react-native';
import { Stack, router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { useTheme, createStyles, triggerHaptic, durations, stagger } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { useToast } from '@/components/ui/Toast';
import { useLocalized } from '@/hooks/useLocalized';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { database } from '@/db';
import type Transaction from '@/db/models/Transaction';

const EXPORT_OPTIONS = [
  { key: 'pdf', icon: '📄', titleKey: 'profile.privacy.pdfReport', descKey: 'profile.privacy.pdfReportDesc' },
  { key: 'csv', icon: '📊', titleKey: 'profile.privacy.csvExport', descKey: 'profile.privacy.csvExportDesc' },
];

function useSectionAnim(index: number) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(20);
  useEffect(() => {
    const d = stagger.baseDelay + index * stagger.dashboardCard;
    opacity.value = withDelay(d, withTiming(1, { duration: durations.gentle, easing: Easing.out(Easing.quad) }));
    ty.value = withDelay(d, withTiming(0, { duration: durations.gentle, easing: Easing.out(Easing.quad) }));
  }, [opacity, ty, index]);
  return useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: ty.value }] }));
}

export default function DataPrivacyScreen() {
  const theme = useTheme();
  const s = useStyles(theme);
  const { t } = useLocalized();
  const toast = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const anim0 = useSectionAnim(0);
  const anim1 = useSectionAnim(1);
  const anim2 = useSectionAnim(2);

  // Fix 2c: Export handler — uses Share.share() with actual transaction data
  const handleExport = useCallback(async (key: string) => {
    setExporting(key);
    triggerHaptic('buttonPress');
    try {
      const transactions = useSavingsStore.getState().transactions;
      const goals = useSavingsStore.getState().goals;

      if (key === 'csv') {
        let csv = 'Type,Amount,Goal,Category,Note,XP,Date\n';
        for (const tx of transactions) {
          const goal = goals.find((g) => g.id === tx.goalId);
          csv += `${tx.type},${tx.amount},"${goal?.title ?? ''}","${tx.category ?? ''}","${tx.note ?? ''}",${tx.xpEarned},"${tx.createdAt instanceof Date ? tx.createdAt.toISOString() : String(tx.createdAt)}"\n`;
        }
        await Share.share({ message: csv, title: 'SaveState Transactions Export' });
      } else {
        const totalBalance = goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const totalDeposits = transactions.filter((tx) => tx.type === 'deposit').length;
        const text = `SaveState — Data Export\n${'─'.repeat(30)}\nTotal Balance: ${totalBalance} UAH\nTotal Transactions: ${transactions.length}\nDeposits: ${totalDeposits}\nGoals: ${goals.length}\n${'─'.repeat(30)}\n\nRecent transactions:\n${transactions.slice(0, 20).map((tx) => `• ${tx.type} ${tx.amount} UAH (XP +${tx.xpEarned})`).join('\n')}`;
        await Share.share({ message: text, title: 'SaveState Data Export' });
      }
      triggerHaptic('success');
    } catch {
      toast.error(t('common.error'));
    } finally {
      setExporting(null);
    }
  }, [t, toast]);

  // Fix 2a: Clear transactions handler — actually deletes from database
  const handleClear = useCallback(() => {
    triggerHaptic('withdrawalWarn');
    Alert.alert(
      t('profile.privacy.clearTransactions'),
      t('profile.privacy.clearTransactionsWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              const txCol = database.get<Transaction>('transactions');
              const allTx = await txCol.query().fetch();
              await database.write(async () => {
                for (const tx of allTx) {
                  await tx.markAsDeleted();
                }
              });
              useSavingsStore.setState({ transactions: [] });
              triggerHaptic('success');
              toast.success(t('profile.privacy.dataCleared'));
            } catch {
              toast.error(t('common.error'));
            }
          },
        },
      ],
    );
  }, [t, toast]);

  // Fix 2b: Delete account handler — signs out and redirects
  const handleDelete = useCallback(() => {
    triggerHaptic('withdrawalWarn');
    Alert.alert(
      t('profile.settings.deleteAccount'),
      t('profile.settings.deleteAccountWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await useAuthStore.getState().signOut();
              router.replace('/(auth)/welcome');
            } catch {
              toast.error(t('common.error'));
            }
          },
        },
      ],
    );
  }, [t, toast]);

  // Fix 2d: Legal links — open URLs
  const handleOpenPrivacy = useCallback(() => {
    triggerHaptic('buttonPress');
    Linking.openURL('https://SaveState.app/privacy').catch(() => {});
  }, []);

  const handleOpenTerms = useCallback(() => {
    triggerHaptic('buttonPress');
    Linking.openURL('https://SaveState.app/terms').catch(() => {});
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.privacy.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Export */}
        <Animated.View style={anim0}>
          <Text style={s.sectionTitle}>{t('profile.privacy.exportData')}</Text>
          {EXPORT_OPTIONS.map((opt, i) => (
            <View key={opt.key} style={i > 0 && s.exportGap}>
              <Card style={s.exportCard}>
                <View style={s.exportInfo}>
                  <Text style={s.exportIcon}>{opt.icon}</Text>
                  <View>
                    <Text style={s.exportTitle}>{t(opt.titleKey)}</Text>
                    <Text style={s.exportDesc}>{t(opt.descKey)}</Text>
                  </View>
                </View>
                <Button label={t('profile.privacy.export')} size="sm" variant="secondary" onPress={() => handleExport(opt.key)} />
              </Card>
            </View>
          ))}
          {exporting !== null && (
            <View style={s.exportIndicator}>
              <Text style={s.exportIndicatorText}>{t('profile.privacy.exporting')} {exporting.toUpperCase()}…</Text>
            </View>
          )}
        </Animated.View>

        <Divider style={s.dividerSpacing} />

        {/* Danger Zone */}
        <Animated.View style={anim1}>
          <Text style={[s.sectionTitle, s.dangerTitle]}>{t('profile.privacy.dangerZone')}</Text>
          <Card style={s.dangerCard}>
            <Button label={t('profile.privacy.clearTransactions')} size="lg" fullWidth onPress={handleClear} />
            <View style={s.dangerGap} />
            <Button label={t('profile.settings.deleteAccount')} size="lg" fullWidth onPress={handleDelete} />
            <Text style={s.dangerWarning}>{t('profile.privacy.irreversibleWarning')}</Text>
          </Card>
        </Animated.View>

        <Divider style={s.dividerSpacing} />

        {/* Legal — Fix 2d: Linking.openURL instead of Alert */}
        <Animated.View style={anim2}>
          <Text style={s.sectionTitle}>{t('profile.privacy.legalInfo')}</Text>
          <Pressable
            style={s.legalLink}
            onPress={handleOpenPrivacy}
            android_ripple={{ color: theme.colors.borderSubtle, borderless: false }}
          >
            <Text style={s.legalIcon}>📜</Text>
            <Text style={s.legalLabel}>{t('profile.about.privacyPolicy')}</Text>
            <Text style={s.legalArrow}>→</Text>
          </Pressable>
          <Pressable
            style={s.legalLink}
            onPress={handleOpenTerms}
            android_ripple={{ color: theme.colors.borderSubtle, borderless: false }}
          >
            <Text style={s.legalIcon}>📜</Text>
            <Text style={s.legalLabel}>{t('profile.about.termsOfService')}</Text>
            <Text style={s.legalArrow}>→</Text>
          </Pressable>
        </Animated.View>

        <View style={s.footerSpacing} />
      </ScreenLayout>
    </>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    exportCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.md },
    exportGap: { marginTop: theme.spacing.sm },
    exportInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: theme.spacing.md },
    exportIcon: { fontSize: 24 },
    exportTitle: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary, fontWeight: '600' },
    exportDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, marginTop: 2 },
    exportIndicator: { marginTop: theme.spacing.sm, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.base, backgroundColor: theme.colors.bgTertiary, borderRadius: theme.radii.sm, alignItems: 'center' },
    exportIndicatorText: { ...theme.typography.bodySmall.style, color: theme.colors.accentBlue },
    dividerSpacing: { marginVertical: theme.spacing.lg },
    dangerTitle: { color: theme.colors.accentRed },
    dangerCard: { paddingVertical: theme.spacing.lg, borderColor: 'rgba(255,59,59,0.25)', borderWidth: theme.borderWidths.medium },
    dangerGap: { marginTop: theme.spacing.md },
    dangerWarning: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary, textAlign: 'center', marginTop: theme.spacing.md },
    legalLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgSecondary, borderRadius: theme.radii.lg, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: theme.borderWidths.thin, borderColor: theme.colors.borderSubtle },
    legalIcon: { fontSize: 20, marginRight: theme.spacing.md },
    legalLabel: { flex: 1, ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary },
    legalArrow: { ...theme.typography.bodyLarge.style, color: theme.colors.textTertiary },
    footerSpacing: { height: theme.spacing['2xl'] },
  }),
);
