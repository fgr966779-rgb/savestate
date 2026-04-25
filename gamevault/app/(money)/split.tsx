import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Share } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import ErrorState from '@/components/ui/ErrorState';
import { useLocalized } from '@/hooks/useLocalized';
import { formatCurrency } from '@/utils/formatters';

interface Participant {
  id: string;
  name: string;
}

export default function SplitScreen() {
  const theme = useTheme();
  const styles = useSplitStyles(theme);
  const { t } = useLocalized();

  const [totalAmount, setTotalAmount] = useState(0);
  const [peopleCount, setPeopleCount] = useState(2);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '' },
    { id: '2', name: '' },
  ]);
  const [error, setError] = useState<string | null>(null);

  const perPerson = peopleCount > 0 ? totalAmount / peopleCount : 0;

  const handlePeopleChange = useCallback((text: string) => {
    const num = parseInt(text, 10);
    if (isNaN(num) || num < 2) return;
    setPeopleCount(num);
    const newParts: Participant[] = [{ id: '1', name: participants[0]?.name ?? '' }];
    for (let i = 1; i < num; i++) {
      newParts.push({ id: String(i + 1), name: participants[i]?.name ?? '' });
    }
    setParticipants(newParts);
  }, [participants]);

  const updateParticipantName = useCallback((id: string, name: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }, []);

  const handleShare = useCallback(async () => {
    if (totalAmount <= 0 || peopleCount < 2) {
      Alert.alert(t('common.error'), t('money.split.enterAmountAndPeople'));
      return;
    }
    const text = participants.map((p, i) =>
      `${p.name || t('money.split.participant', { index: i + 1 })}: ${formatCurrency(perPerson)}`
    ).join('\n')
      + `\n\n${t('money.split.total')}: ${formatCurrency(totalAmount)}`;
    try { await Share.share({ message: text }); } catch { /* cancelled */ }
  }, [totalAmount, peopleCount, participants, perPerson, t]);

  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout>
      <HeaderBar title={t('money.split.title')} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        <AmountInput label={t('money.split.totalAmount')} value={totalAmount} onChangeAmount={setTotalAmount} />

        <View style={{ marginTop: theme.spacing.lg }}>
          <Input
            label={t('money.split.peopleCount')}
            placeholder="2"
            value={String(peopleCount)}
            onChangeText={handlePeopleChange}
            keyboardType="numeric"
          />
        </View>

        {/* Per person display */}
        <Card style={styles.perPersonCard}>
          <Text style={styles.perPersonLabel}>{t('money.split.perPerson')}</Text>
          <Text style={styles.perPersonAmount}>{formatCurrency(perPerson)}</Text>
        </Card>

        {/* Participants */}
        <Text style={styles.sectionLabel}>{t('money.split.participants')}</Text>
        <View style={styles.participantsList}>
          {participants.map((p, idx) => (
            <View key={p.id} style={styles.participantRow}>
              <Text style={styles.participantNum}>{idx + 1}.</Text>
              <Input
                placeholder={t('money.split.participant', { index: idx + 1 })}
                value={p.name}
                onChangeText={(txt) => updateParticipantName(p.id, txt)}
                style={styles.participantInput}
              />
              <Text style={styles.participantAmount}>{formatCurrency(perPerson)}</Text>
            </View>
          ))}
        </View>

        {/* Add participant */}
        <Button
          label={t('money.split.addParticipant')}
          variant="secondary"
          size="sm"
          onPress={() => {
            const newId = String(participants.length + 1);
            setParticipants(prev => [...prev, { id: newId, name: '' }]);
            setPeopleCount(prev => prev + 1);
          }}
          style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-start' }}
        />

        <Button
          label={t('money.split.shareResult')}
          fullWidth
          onPress={handleShare}
          disabled={totalAmount <= 0 || peopleCount < 2}
          style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing['2xl'] }}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const useSplitStyles = createStyles((theme) =>
  StyleSheet.create({
    perPersonCard: { marginTop: theme.spacing.lg, alignItems: 'center', padding: theme.spacing.lg },
    perPersonLabel: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary },
    perPersonAmount: { ...theme.typography.headingLarge.style, color: theme.colors.accentGold, marginTop: theme.spacing.sm },
    sectionLabel: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary, marginTop: theme.spacing.xl },
    participantsList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    participantRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    participantNum: { ...theme.typography.bodyMedium.style, color: theme.colors.textTertiary, width: 24 },
    participantInput: { flex: 1 },
    participantAmount: { ...theme.typography.bodySmall.style, color: theme.colors.accentGreen, fontWeight: '600', width: 100, textAlign: 'right' },
  }),
);
