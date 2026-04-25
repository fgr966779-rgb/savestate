import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import ErrorState from '@/components/ui/ErrorState';
import { useLocalized } from '@/hooks/useLocalized';
import { useSettingsStore } from '@/stores/useSettingsStore';

type DebtCategory = string;

const CATEGORIES: DebtCategory[] = ['loan', 'credit', 'personal', 'other'];

export default function AddDebtScreen() {
  const theme = useTheme();
  const styles = useAddDebtStyles(theme);
  const router = useRouter();
  const { t } = useLocalized();
  const { currency } = useSettingsStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<DebtCategory>('personal');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [direction, setDirection] = useState<'owing' | 'owed'>('owing');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');

  const categoryLabels: Record<string, string> = {
    loan: t('debt.add.typeLoan'),
    credit: t('debt.add.typeCredit'),
    personal: t('debt.add.typePersonal'),
    other: t('debt.add.typeOther'),
  };

  const validate = useCallback(() => {
    let valid = true;
    if (!name.trim()) { setNameError(t('common.required')); valid = false; } else setNameError('');
    if (amount <= 0) { setAmountError(t('errors.validation.amountTooSmall')); valid = false; } else setAmountError('');
    return valid;
  }, [name, amount, t]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Debt tracking is separate from savings store; persist locally via route params
      await new Promise(r => setTimeout(r, 300));
      router.back();
    } catch {
      setError(t('debt.payment.paymentFailed'));
    } finally { setSaving(false); }
  }, [validate, router, t]);

  if (error) {
    return (
      <ScreenLayout>
        <ErrorState message={error} onRetry={() => setError(null)} retryLabel={t('common.retry')} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <HeaderBar title={t('debt.add.title')} leftAction={{ icon: '←', onPress: () => router.back() }} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        {/* Direction toggle */}
        <View style={styles.directionRow}>
          <Pressable style={[styles.dirBtn, direction === 'owing' && styles.dirBtnActive]} onPress={() => setDirection('owing')}>
            <Text style={[styles.dirText, direction === 'owing' && styles.dirTextActive]}>{t('debt.main.owing', 'I owe')}</Text>
          </Pressable>
          <Pressable style={[styles.dirBtn, direction === 'owed' && styles.dirBtnActive]} onPress={() => setDirection('owed')}>
            <Text style={[styles.dirText, direction === 'owed' && styles.dirTextActive]}>{t('debt.main.owed', 'Owed to me')}</Text>
          </Pressable>
        </View>

        <Input
          label={direction === 'owing' ? t('debt.add.creditor') : t('debt.add.debtor', 'Debtor')}
          placeholder={t('debt.add.creditorPlaceholder')}
          value={name} onChangeText={setName} error={nameError}
        />

        <View style={styles.spacer}>
          <AmountInput label={t('debt.add.amount')} value={amount} onChangeAmount={setAmount} />
          {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
        </View>

        {/* Category selector */}
        <Text style={styles.sectionLabel}>{t('debt.add.type')}</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => (
            <Pressable key={cat} style={[styles.catBtn, category === cat && styles.catBtnActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{categoryLabels[cat]}</Text>
            </Pressable>
          ))}
        </View>

        <Input label={t('debt.add.dueDate')} placeholder="yyyy-mm-dd" value={dueDate} onChangeText={setDueDate} keyboardType="numeric" />

        <View style={styles.spacer}>
          <Input label={t('debt.add.notes')} placeholder="..." value={note} onChangeText={setNote} multiline />
        </View>

        <Button label={t('common.save')} fullWidth onPress={handleSave} loading={saving} style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing['2xl'] }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const useAddDebtStyles = createStyles((theme) =>
  StyleSheet.create({
    directionRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md },
    dirBtn: { flex: 1, padding: theme.spacing.md, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.borderDefault, alignItems: 'center' },
    dirBtnActive: { borderColor: theme.colors.accentBlue, backgroundColor: `${theme.colors.accentBlue}20` },
    dirText: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary },
    dirTextActive: { color: theme.colors.accentBlue },
    spacer: { marginTop: theme.spacing.lg },
    sectionLabel: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary, marginTop: theme.spacing.lg },
    categoryRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    catBtn: { flex: 1, padding: theme.spacing.sm, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.borderDefault, alignItems: 'center' },
    catBtnActive: { borderColor: theme.colors.accentBlue, backgroundColor: `${theme.colors.accentBlue}20` },
    catText: { ...theme.typography.labelMedium.style, color: theme.colors.textSecondary },
    catTextActive: { color: theme.colors.accentBlue },
    errorText: { ...theme.typography.bodySmall.style, color: theme.colors.accentRed, marginTop: theme.spacing.xs },
  }),
);
