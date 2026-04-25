import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalized } from '@/hooks/useLocalized';

const ACCENT_COLORS = ['#6C5CE7', '#00AAFF', '#FF6B00', '#00FF88', '#FF3B8B', '#FFD700', '#9D4EDD', '#4ECDC4'];

export default function EditProfileScreen() {
  const theme = useTheme();
  const styles = useEditProfileStyles(theme);
  const { t } = useLocalized();
  const { user, updateProfile } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [selectedColor, setSelectedColor] = useState(user?.avatarColor ?? '#6C5CE7');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validateNickname = (name: string): boolean => {
    if (!name.trim()) { setError(t('profile.edit.errorEmpty')); return false; }
    if (name.trim().length < 2) { setError(t('profile.edit.errorMin')); return false; }
    if (name.trim().length > 20) { setError(t('profile.edit.errorMax')); return false; }
    setError(null);
    return true;
  };

  const handlePickAvatar = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        triggerHaptic('buttonPress');
      }
    } catch {}
  }, []);

  const handleSave = async () => {
    if (!validateNickname(nickname)) return;
    setIsSaving(true);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        avatarColor: selectedColor,
      });
      triggerHaptic('questComplete');
    } catch {}
    setIsSaving(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title={t('profile.edit.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Avatar
            size="lg"
            name={nickname}
            accentColor={selectedColor}
            variant="withLevelRing"
            level={user?.level ?? 1}
          />
          <Button label={t('profile.edit.changePhoto')} variant="ghost" size="sm" onPress={handlePickAvatar} />
        </View>

        {/* Nickname */}
        <Card style={styles.formCard}>
          <Text style={styles.formLabel}>{t('profile.edit.nickname')}</Text>
          <View style={styles.inputWrapper}>
            <Input
              value={nickname}
              onChangeText={(text) => { setNickname(text); if (error) validateNickname(text); }}
              placeholder={t('profile.edit.nicknamePlaceholder')}
              autoCapitalize="none"
              maxLength={20}
            />
          </View>
          <View style={styles.inputMeta}>
            <Text style={[styles.errorText, { opacity: error ? 1 : 0 }]}>{error ?? ' '}</Text>
            <Text style={styles.charCount}>{nickname.length}/20</Text>
          </View>
        </Card>

        {/* Color Accent */}
        <Card style={styles.formCard}>
          <Text style={styles.formLabel}>{t('profile.edit.accentColor')}</Text>
          <View style={styles.colorGrid}>
            {ACCENT_COLORS.map((color) => (
              <View
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorSelected,
                ]}
                onStartShouldSetResponder={() => { setSelectedColor(color); return true; }}
              >
                {selectedColor === color && <Text style={styles.checkmark}>✓</Text>}
              </View>
            ))}
          </View>
        </Card>

        {/* Preview */}
        <Card style={styles.previewCard}>
          <Text style={styles.previewLabel}>{t('profile.edit.preview')}</Text>
          <View style={styles.previewRow}>
            <Avatar size="md" name={nickname || t('profile.edit.defaultName')} accentColor={selectedColor} />
            <View>
              <Text style={styles.previewName}>{nickname || t('profile.edit.defaultName')}</Text>
              <Text style={styles.previewLevel}>{t('profile.main.levelBadge')} {user?.level ?? 1}</Text>
            </View>
          </View>
        </Card>

        {/* Save */}
        <Button
          label={t('profile.edit.saveChanges')}
          size="lg"
          fullWidth
          loading={isSaving}
          onPress={handleSave}
        />
      </ScreenLayout>
    </>
  );
}

const useEditProfileStyles = createStyles((theme) =>
  StyleSheet.create({
    avatarSection: { alignItems: 'center', marginVertical: theme.spacing.lg },
    formCard: { marginBottom: theme.spacing.md },
    formLabel: { ...theme.typography.labelMedium.style, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
    inputWrapper: {},
    inputMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs },
    errorText: { ...theme.typography.bodySmall.style, color: theme.colors.accentRed },
    charCount: { ...theme.typography.code.style, color: theme.colors.textTertiary, fontSize: 11 },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    colorOption: {
      width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    },
    colorSelected: { borderWidth: 3, borderColor: theme.colors.textPrimary },
    checkmark: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    previewCard: { marginBottom: theme.spacing.lg },
    previewLabel: { ...theme.typography.labelMedium.style, color: theme.colors.textTertiary, marginBottom: theme.spacing.sm },
    previewRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    previewName: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary },
    previewLevel: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary },
  }),
);
