import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme, createStyles, triggerHaptic, fontFamilies } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLocalized } from '@/hooks/useLocalized';
import { useAuthStore } from '@/stores/useAuthStore';

// ── Data ──────────────────────────────────────────────────────────
const MAX_REFERRALS = 20;

// ── Screen ────────────────────────────────────────────────────────
export default function ReferralRewardsScreen() {
  const theme = useTheme();
  const s = useReferralStyles(theme);
  const { t } = useLocalized();
  const user = useAuthStore((state) => state.user);

  const [copied, setCopied] = useState(false);

  // Dynamic promo code based on user data
  const promoCode = user?.id
    ? `GV-${user.id.slice(0, 4).toUpperCase()}-${user.nickname?.slice(0, 3).toUpperCase() ?? 'USR'}`
    : 'GV-GUEST-CODE';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(promoCode);
    triggerHaptic('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    triggerHaptic('buttonPress');
    if (Platform.OS === 'web') {
      Alert.alert(t('common.share'), `${t('profile.privacy.referral.promoCode')}: ${promoCode}`);
      return;
    }
    try {
      const { isAvailableAsync, shareAsync } = await import('expo-sharing');
      if (await isAvailableAsync()) {
        await shareAsync('', { title: 'SaveState — Запрошення', dialogTitle: t('common.share') });
      }
    } catch {
      Alert.alert(t('common.share'), `${t('profile.privacy.referral.promoCode')}: ${promoCode}`);
    }
  };

  const handleInvite = () => {
    triggerHaptic('buttonPress');
    Alert.alert(
      t('profile.privacy.referral.inviteFriend'),
      t('profile.referral.inviteAlert'),
      [
        { text: `📋 ${t('profile.privacy.referral.copy')}`, onPress: handleCopy },
        { text: `📤 ${t('profile.privacy.referral.share')}`, onPress: handleShare },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.privacy.referral.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar contentContainerStyle={s.scrollContent}>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🎁</Text>
          <Text style={s.heroText}>{t('profile.privacy.referral.heroText')}</Text>
        </View>

        {/* Coming Soon State */}
        <EmptyState
          icon="🚧"
          title={t('profile.privacy.referral.comingSoon')}
          description={t('profile.privacy.referral.comingSoonDesc')}
          ctaLabel={t('common.back')}
          onCta={() => router.back()}
        />

        {/* Promo Code (functional but minimal) */}
        <Card variant="elevated" style={s.mbLg}>
          <Text style={s.promoLabel}>{t('profile.privacy.referral.promoCode')}</Text>
          <View style={s.codeRow}>
            <Text style={s.codeText}>{promoCode}</Text>
          </View>
          <View style={s.promoButtons}>
            <TouchableOpacity style={s.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Text style={s.btnIcon}>📋</Text>
              <Text style={s.btnLabel}>{copied ? t('profile.privacy.referral.copied') : t('profile.privacy.referral.copy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.7}>
              <Text style={s.btnIcon}>📤</Text>
              <Text style={s.btnLabel}>{t('profile.privacy.referral.share')}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stats */}
        <View style={s.statsRow}>
          <Text style={s.statsText}>{t('profile.privacy.referral.invited')}: 0/{MAX_REFERRALS}</Text>
        </View>
        <View style={s.fabSpacer} />
      </ScreenLayout>

      {/* FAB */}
      <View style={s.fab}>
        <Button variant="fab" label="🚀" onPress={handleInvite} accessibilityLabel={t('profile.privacy.referral.inviteFriend')} />
      </View>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const useReferralStyles = createStyles((t) =>
  StyleSheet.create({
    scrollContent: { paddingBottom: t.spacing['5xl'] },
    hero: { alignItems: 'center', paddingVertical: t.spacing.lg, marginBottom: t.spacing.md },
    heroEmoji: { fontSize: 48, marginBottom: t.spacing.sm },
    heroText: { ...t.typography.titleLarge.style, color: t.colors.textPrimary, textAlign: 'center' },
    mbLg: { marginBottom: t.spacing.lg },
    promoLabel: { ...t.typography.labelSmall.style, color: t.colors.textSecondary, textTransform: 'uppercase', marginBottom: t.spacing.sm },
    codeRow: { backgroundColor: t.colors.bgTertiary, borderRadius: t.radii.md, padding: t.spacing.md, alignItems: 'center', marginBottom: t.spacing.md },
    codeText: { ...t.typography.code.style, fontSize: 20, fontWeight: '700', color: t.colors.accentBlueLight, letterSpacing: 2 },
    promoButtons: { flexDirection: 'row', gap: t.spacing.sm },
    copyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing.sm, paddingVertical: t.spacing.md, borderRadius: t.radii.md, backgroundColor: t.colors.bgTertiary },
    shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing.sm, paddingVertical: t.spacing.md, borderRadius: t.radii.md, backgroundColor: t.colors.accentBlue },
    btnIcon: { fontSize: 18 },
    btnLabel: { ...t.typography.labelMedium.style, color: t.colors.textPrimary },
    statsRow: { marginTop: t.spacing.md, gap: t.spacing.sm },
    statsText: { ...t.typography.bodyLarge.style, color: t.colors.textSecondary },
    fabSpacer: { height: t.spacing['3xl'] },
    fab: { position: 'absolute' as const, bottom: t.semanticSpacing.tabBarHeight + t.semanticSpacing.bottomSafeArea, right: t.semanticSpacing.screenPadding },
  }),
);
