/**
 * SaveState — Account Setup Screen (Screen 06)
 *
 * Google sign-in, email sign-in, nickname input with validation,
 * avatar selection grid (12 pixel-art characters), color selection (8 accents),
 * live profile preview card, and final CTA button.
 */

import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  useTheme,
  colors,
  spacing,
  typography,
  fontFamilies,
  triggerHaptic,
} from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

// ── Types ────────────────────────────────────────────────────────
type AuthStep = 'method' | 'email' | 'profile';

// ── Constants ────────────────────────────────────────────────────
const PIXEL_AVATARS = [
  { id: 'knight', emoji: '⚔️' },
  { id: 'wizard', emoji: '🧙' },
  { id: 'archer', emoji: '🏹' },
  { id: 'rogue', emoji: '🗡️' },
  { id: 'healer', emoji: '💚' },
  { id: 'mage', emoji: '🔮' },
  { id: 'dragon', emoji: '🐉' },
  { id: 'phoenix', emoji: '🔥' },
  { id: 'robot', emoji: '🤖' },
  { id: 'alien', emoji: '👾' },
  { id: 'ninja', emoji: '🥷' },
  { id: 'pirate', emoji: '🏴‍☠️' },
];

const ACCENT_COLORS = [
  { id: 'blue', color: colors.accentBlue },
  { id: 'gold', color: colors.accentGold },
  { id: 'green', color: colors.accentGreen },
  { id: 'purple', color: colors.accentPurple },
  { id: 'red', color: colors.accentRed },
  { id: 'orange', color: colors.accentOrange },
  { id: 'cyan', color: colors.accentBlueLight },
  { id: 'pink', color: '#FF69B4' },
];

const NICKNAME_MIN_LENGTH = 3;
const NICKNAME_MAX_LENGTH = 16;

// Simulated taken nicknames for uniqueness validation
const TAKEN_NICKNAMES = ['admin', 'SaveState', 'test', 'user', 'player'];

export default function AccountSetupScreen() {
  const router = useRouter();
  const authStore = useAuthStore();
  const setOnboarded = useSettingsStore((s) => s.setOnboarded);

  const [step, setStep] = useState<AuthStep>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(ACCENT_COLORS[0].color);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Validate nickname uniqueness ───────────────────────────────
  const validateNickname = useCallback((name: string): string | null => {
    if (name.length < NICKNAME_MIN_LENGTH) {
      return `Мінімум ${NICKNAME_MIN_LENGTH} символи`;
    }
    if (name.length > NICKNAME_MAX_LENGTH) {
      return `Максимум ${NICKNAME_MAX_LENGTH} символів`;
    }
    if (TAKEN_NICKNAMES.includes(name.toLowerCase())) {
      return 'Цей нікнейм вже зайнятий';
    }
    if (!/^[a-zA-Z0-9_а-яА-ЯіІїЇєЄґҐ]+$/.test(name)) {
      return 'Тільки літери, цифри та _';
    }
    return null;
  }, []);

  // Live validation on nickname change
  useEffect(() => {
    if (nickname.length > 0) {
      setNicknameError(validateNickname(nickname));
    } else {
      setNicknameError(null);
    }
  }, [nickname, validateNickname]);

  // ── Validate email ─────────────────────────────────────────────
  const validateEmail = useCallback((mail: string): string | null => {
    if (!mail) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      return 'Невірний формат email';
    }
    return null;
  }, []);

  useEffect(() => {
    if (email.length > 0) {
      setEmailError(validateEmail(email));
    } else {
      setEmailError(null);
    }
  }, [email, validateEmail]);

  // ── Auth handlers ──────────────────────────────────────────────
  const handleGoogleSignIn = useCallback(async () => {
    triggerHaptic('buttonPress');
    setIsSubmitting(true);
    try {
      await authStore.signInWithGoogle();
      if (authStore.isAuthenticated) {
        setStep('profile');
      }
    } catch {
      Alert.alert('Помилка', 'Не вдалося увійти через Google');
    } finally {
      setIsSubmitting(false);
    }
  }, [authStore]);

  const handleEmailContinue = useCallback(() => {
    triggerHaptic('buttonPress');
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setStep('email');
  }, [email, validateEmail]);

  const handleEmailSignIn = useCallback(async () => {
    triggerHaptic('buttonPress');
    if (!email || !password) {
      Alert.alert('Помилка', 'Заповни всі поля');
      return;
    }
    setIsSubmitting(true);
    try {
      await authStore.signUp(email, password, nickname || email.split('@')[0]);
      setStep('profile');
    } catch {
      Alert.alert('Помилка', 'Не вдалося зареєструватися');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, nickname, authStore]);

  // ── Avatar selection ───────────────────────────────────────────
  const handleAvatarSelect = useCallback((avatarId: string) => {
    triggerHaptic('buttonPress');
    setSelectedAvatar((prev) => (prev === avatarId ? null : avatarId));
  }, []);

  // ── Color selection ────────────────────────────────────────────
  const handleColorSelect = useCallback((color: string) => {
    triggerHaptic('buttonPress');
    setSelectedColor(color);
  }, []);

  // ── Final submit ───────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    triggerHaptic('buttonPress');
    const nickError = validateNickname(nickname);
    if (nickError || !nickname) {
      setNicknameError(nickError || 'Обери нікнейм');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update profile with nickname, avatar, and color
      await authStore.updateProfile({
        nickname,
        avatarId: selectedAvatar,
        avatarColor: selectedColor,
      });

      // Mark onboarding complete
      setOnboarded();

      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Помилка', 'Не вдалося зберегти профіль');
    } finally {
      setIsSubmitting(false);
    }
  }, [nickname, selectedAvatar, selectedColor, authStore, setOnboarded, router, validateNickname]);

  // ── Back handler ───────────────────────────────────────────────
  const handleBack = useCallback(() => {
    triggerHaptic('buttonPress');
    if (step === 'profile') {
      setStep('method');
    } else if (step === 'email') {
      setStep('method');
    } else {
      router.back();
    }
  }, [step, router]);

  const isProfileComplete = nickname.length >= NICKNAME_MIN_LENGTH && !nicknameError;

  return (
    <ScreenLayout scrollable>
      <HeaderBar
        title="Налаштування акаунту"
        leftAction={{
          icon: '←',
          onPress: handleBack,
        }}
      />

      {/* Step: Auth method selection */}
      {step === 'method' && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
          <Text style={styles.screenTitle}>Створи акаунт</Text>
          <Text style={styles.screenSubtitle}>
            Увійди щоб зберегти прогрес та здобутки
          </Text>

          {/* Google sign-in */}
          <Card variant="elevated" style={styles.authCard}>
            <Button
              label="Увійти через Google"
              variant="secondary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              onPress={handleGoogleSignIn}
              icon={<Text style={styles.googleIcon}>G</Text>}
            />
          </Card>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>або</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email input */}
          <Input
            label="Email"
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.emailButtonContainer}>
            <Button
              label="Продовжити з email"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!email || !!emailError}
              onPress={handleEmailContinue}
            />
          </View>
        </Animated.View>
      )}

      {/* Step: Email password */}
      {step === 'email' && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
          <Text style={styles.screenTitle}>Створення акаунту</Text>
          <Text style={styles.screenSubtitle}>
            Введи пароль для акаунту {email}
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            disabled
          />

          <View style={styles.fieldSpacing}>
            <Input
              label="Пароль"
              placeholder="Мінімум 8 символів"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.emailButtonContainer}>
            <Button
              label="Зареєструватися"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={password.length < 8}
              onPress={handleEmailSignIn}
            />
          </View>
        </Animated.View>
      )}

      {/* Step: Profile setup */}
      {step === 'profile' && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
          <Text style={styles.screenTitle}>Твій профіль</Text>
          <Text style={styles.screenSubtitle}>
            Обери нікнейм, аватар та колір
          </Text>

          {/* Live profile preview */}
          <Card variant="elevated" style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Avatar
                size="lg"
                name={nickname || 'Гравець'}
                accentColor={selectedColor}
              />
              <View style={styles.previewInfo}>
                <Text style={styles.previewNickname}>
                  {nickname || 'Гравець'}
                </Text>
                <Badge variant="level" text="LVL 1" />
              </View>
            </View>
          </Card>

          {/* Nickname input */}
          <View style={styles.sectionSpacing}>
            <Input
              label="Нікнейм"
              placeholder="Твій ігровий нікнейм"
              value={nickname}
              onChangeText={setNickname}
              error={nicknameError}
              maxLength={NICKNAME_MAX_LENGTH}
              autoCapitalize="none"
            />
          </View>

          {/* Avatar selection grid */}
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionLabel}>Обери аватар</Text>
            <View style={styles.avatarGrid}>
              {PIXEL_AVATARS.map((avatar) => (
                <Pressable
                  key={avatar.id}
                  onPress={() => handleAvatarSelect(avatar.id)}
                  style={[
                    styles.avatarItem,
                    selectedAvatar === avatar.id && {
                      borderColor: selectedColor,
                      borderWidth: 2,
                      backgroundColor: `${selectedColor}15`,
                    },
                  ]}
                  accessibilityLabel={avatar.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedAvatar === avatar.id }}
                >
                  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Color selection */}
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionLabel}>Колір профілю</Text>
            <View style={styles.colorGrid}>
              {ACCENT_COLORS.map((accent) => (
                <Pressable
                  key={accent.id}
                  onPress={() => handleColorSelect(accent.color)}
                  style={[
                    styles.colorItem,
                    selectedColor === accent.color && styles.colorItemSelected,
                  ]}
                  accessibilityLabel={accent.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedColor === accent.color }}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: accent.color },
                    ]}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View style={styles.finishButtonContainer}>
            <Button
              label="Почати"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={!isProfileComplete}
              onPress={handleFinish}
            />
          </View>
        </Animated.View>
      )}
    </ScreenLayout>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  screenTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  screenSubtitle: {
    ...typography.bodyMedium.style,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  authCard: {
    marginBottom: spacing.lg,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  dividerText: {
    ...typography.labelSmall.style,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
  },
  emailButtonContainer: {
    marginTop: spacing.md,
  },
  fieldSpacing: {
    marginTop: spacing.md,
  },
  previewCard: {
    marginBottom: spacing.lg,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewNickname: {
    ...typography.headingSmall.style,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sectionSpacing: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.labelMedium.style,
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  avatarItem: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorItem: {
    padding: spacing.xs,
    borderRadius: 20,
  },
  colorItemSelected: {
    backgroundColor: `${colors.bgTertiary}`,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  finishButtonContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});
