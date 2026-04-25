/**
 * Screen 15 — Import / Sync Screen
 *
 * Import and sync options: bank integration (Monobank, PrivatBank),
 * photo receipt scanning, CSV file import, and manual batch entry.
 * Each option rendered as a Card with icon, description, and action.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  useTheme,
  createStyles,
  triggerHaptic,
  triggerImpact,
  spacing,
  typography,
  fontFamilies,
} from '@/constants/theme';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLocalized } from '@/hooks/useLocalized';
import { useToast } from '@/components/ui/Toast';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// ── Types ──────────────────────────────────────────────────────────

interface ImportOption {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  badgeKey?: string;
  connected?: boolean;
}

// ── Component ─────────────────────────────────────────────────────

export default function VaultImport() {
  const theme = useTheme();
  const styles = useImportStyles(theme);
  const c = theme.colors;
  const toast = useToast();
  const { t } = useLocalized();

  const connectedBanks = useSettingsStore((s) => s.connectedBanks);
  const setConnectedBanks = useSettingsStore((s) => s.setConnectedBanks);
  const [importing, setImporting] = useState<string | null>(null);

  // ── Derived bank options (i18n) ────────────────────────────────
  const BANK_OPTIONS: ImportOption[] = [
    {
      id: 'monobank',
      icon: '🏦',
      titleKey: 'Monobank',
      descriptionKey: t('vault.import.monobankDesc'),
      badgeKey: t('vault.import.recommended'),
    },
    {
      id: 'privatbank',
      icon: '💳',
      titleKey: 'PrivatBank',
      descriptionKey: t('vault.import.privatbankDesc'),
    },
  ];

  const OTHER_OPTIONS: ImportOption[] = [
    {
      id: 'receipt',
      icon: '📷',
      titleKey: t('vault.import.receiptTitle'),
      descriptionKey: t('vault.import.receiptDesc'),
    },
    {
      id: 'csv',
      icon: '📄',
      titleKey: t('vault.import.csvTitle'),
      descriptionKey: t('vault.import.csvDesc'),
    },
    {
      id: 'batch',
      icon: '📝',
      titleKey: t('vault.import.batchTitle'),
      descriptionKey: t('vault.import.batchDesc'),
    },
  ];

  // ── Bank Connection ─────────────────────────────────────────────
  const handleBankConnect = useCallback(
    (bankId: string) => {
      triggerHaptic('buttonPress');
      const bankName = bankId === 'monobank' ? 'Monobank' : 'PrivatBank';

      Alert.alert(
        t('vault.import.connectBank'),
        t('vault.import.connectQuestion', { bank: bankName }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('vault.import.connectBtn'),
            onPress: () => {
              triggerImpact('medium');
              if (!connectedBanks.includes(bankId)) {
                setConnectedBanks([...connectedBanks, bankId]);
              }
              toast.success(
                t('vault.import.bankConnected', { bank: bankName }),
                '🏦',
              );
            },
          },
        ],
      );
    },
    [toast, t, connectedBanks, setConnectedBanks],
  );

  const handleBankDisconnect = useCallback(
    (bankId: string) => {
      triggerHaptic('buttonPress');
      setConnectedBanks(connectedBanks.filter((b) => b !== bankId));
      toast.warning(t('vault.import.bankDisconnected'), '⚠️');
    },
    [toast, t, connectedBanks, setConnectedBanks],
  );

  // ── Photo Receipt ───────────────────────────────────────────────
  const handleReceiptPhoto = useCallback(async () => {
    triggerHaptic('buttonPress');

    Alert.alert(t('vault.import.receiptTitle'), t('vault.import.receiptSource'), [
      { text: t('vault.import.camera'), onPress: () => pickImage('camera') },
      { text: t('vault.import.gallery'), onPress: () => pickImage('gallery') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  }, [t]);

  const pickImage = useCallback(
    async (source: 'camera' | 'gallery') => {
      setImporting('receipt');
      try {
        const result =
          source === 'camera'
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
              })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
              });

        if (!result.canceled && result.assets.length > 0) {
          triggerImpact('light');
          toast.warning(t('common.comingSoon'), '🚧');
          setImporting(null);
        } else {
          setImporting(null);
        }
      } catch {
        toast.error(t('vault.import.cameraError'));
        setImporting(null);
      }
    },
    [toast, t],
  );

  // ── CSV Import ──────────────────────────────────────────────────
  const handleCSVImport = useCallback(async () => {
    triggerHaptic('buttonPress');
    setImporting('csv');

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setImporting(null);
        return;
      }

      triggerImpact('light');
      toast.warning(t('common.comingSoon'), '🚧');
      setImporting(null);
    } catch {
      toast.error(t('vault.import.csvError'));
      setImporting(null);
    }
  }, [toast, t]);

  // ── Manual Batch ────────────────────────────────────────────────
  const handleBatchEntry = useCallback(() => {
    triggerHaptic('buttonPress');
    Alert.alert(
      t('vault.import.batchAlert'),
      t('vault.import.batchAlertMsg'),
      [{ text: t('common.ok') }],
    );
  }, [t]);

  // ── Render Bank Card ────────────────────────────────────────────
  const renderBankCard = (option: ImportOption) => {
    const isConnected = connectedBanks.includes(option.id);
    const isLoading = importing === option.id;

    return (
      <Card
        key={option.id}
        variant={isConnected ? 'glowing' : 'default'}
        onPress={() =>
          isConnected
            ? handleBankDisconnect(option.id)
            : handleBankConnect(option.id)
        }
        style={styles.importCard}
        accessibilityLabel={option.titleKey}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{option.icon}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{option.titleKey}</Text>
            <Text style={styles.cardDescription}>{option.descriptionKey}</Text>
          </View>
          {option.badgeKey && (
            <Badge variant="achievement" text={option.badgeKey} />
          )}
        </View>
        <View style={styles.cardAction}>
          <Button
            variant={isConnected ? 'ghost' : 'secondary'}
            size="sm"
            label={isConnected ? t('vault.import.disconnectBtn') : t('vault.import.connectBtn')}
            onPress={() =>
              isConnected
                ? handleBankDisconnect(option.id)
                : handleBankConnect(option.id)
            }
            loading={isLoading}
          />
          {isConnected && (
            <Badge variant="status" status="success" text={t('vault.import.connected')} />
          )}
        </View>
      </Card>
    );
  };

  // ── Render Other Option ─────────────────────────────────────────
  const renderOtherOption = (option: ImportOption) => {
    const isLoading = importing === option.id;

    return (
      <Card
        key={option.id}
        variant="default"
        onPress={() => {
          switch (option.id) {
            case 'receipt':
              return handleReceiptPhoto();
            case 'csv':
              return handleCSVImport();
            case 'batch':
              return handleBatchEntry();
          }
        }}
        style={styles.importCard}
        accessibilityLabel={option.titleKey}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{option.icon}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{option.titleKey}</Text>
            <Text style={styles.cardDescription}>{option.descriptionKey}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenLayout scrollable withBottomTabBar>
      <View style={styles.container}>
        {/* ── Title ──────────────────────────────────────────────── */}
        <Text style={styles.screenTitle}>{t('vault.import.screenTitle')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('vault.import.screenSubtitle')}
        </Text>

        {/* ── Bank Integrations ──────────────────────────────────── */}
        <Text style={styles.sectionLabel}>🏦 {t('vault.import.bankIntegration')}</Text>
        {BANK_OPTIONS.map(renderBankCard)}

        {/* ── Other Import Methods ───────────────────────────────── */}
        <Text style={styles.sectionLabel}>📦 {t('vault.import.otherMethods')}</Text>
        {OTHER_OPTIONS.map(renderOtherOption)}

        {/* ── Info Card ──────────────────────────────────────────── */}
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>🔒</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                {t('vault.import.securityTitle')}
              </Text>
              <Text style={styles.infoText}>
                {t('vault.import.securityDesc')}
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScreenLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const useImportStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    screenTitle: {
      ...theme.typography.headingSmall.style,
      color: theme.colors.textPrimary,
    },
    screenSubtitle: {
      ...theme.typography.bodyMedium.style,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    sectionLabel: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    importCard: {
      marginBottom: theme.spacing.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    cardIcon: {
      fontSize: 36,
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      ...theme.typography.titleMedium.style,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    cardDescription: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 18,
    },
    cardAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    infoCard: {
      marginTop: theme.spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },
    infoEmoji: {
      fontSize: 24,
      marginTop: 2,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    infoText: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  }),
);
