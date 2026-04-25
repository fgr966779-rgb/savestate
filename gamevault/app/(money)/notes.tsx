import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useLocalized } from '@/hooks/useLocalized';

interface Note {
  id: string;
  title: string;
  body: string;
  date: string;
  pinned: boolean;
}

export default function NotesScreen() {
  const theme = useTheme();
  const styles = useNotesStyles(theme);
  const { t } = useLocalized();

  const [notes, setNotes] = useState<Note[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
  }, [notes, searchQuery]);

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const regularNotes = filteredNotes.filter(n => !n.pinned);

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const note: Note = {
      id: String(Date.now()),
      title: newTitle,
      body: newBody,
      date: new Date().toISOString().split('T')[0],
      pinned: false,
    };
    setNotes(prev => [note, ...prev]);
    setShowAdd(false);
    setNewTitle('');
    setNewBody('');
  };

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  if (loading) return <ScreenLayout loading />;
  if (error) return <ScreenLayout><ErrorState message={error} onRetry={() => setError(null)} /></ScreenLayout>;

  return (
    <ScreenLayout withBottomTabBar>
      <HeaderBar title={t('money.notes.title')} rightActions={[{ icon: '＋', onPress: () => setShowAdd(!showAdd) }]} />

      {/* Search */}
      <View style={{ marginTop: theme.spacing.md }}>
        <Input placeholder={t('money.notes.title')} value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pinned */}
        {pinnedNotes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📌 {t('money.notes.title')}</Text>
            <View style={styles.noteList}>
              {pinnedNotes.map(note => (
                <Card key={note.id} style={styles.noteCard} onPress={() => togglePin(note.id)}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <Badge variant="status" text="📌" status="info" />
                  </View>
                  <Text style={styles.noteBody} numberOfLines={3}>{note.body}</Text>
                  <View style={styles.noteFooter}>
                    <Text style={styles.noteDate}>{note.date}</Text>
                    <Button label={t('common.delete')} variant="ghost" size="sm" onPress={() => handleDelete(note.id)} />
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}

        {/* Regular */}
        {regularNotes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('money.notes.title')}</Text>
            <View style={styles.noteList}>
              {regularNotes.map(note => (
                <Card key={note.id} style={styles.noteCard} onPress={() => togglePin(note.id)}>
                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <Text style={styles.noteBody} numberOfLines={2}>{note.body}</Text>
                  <View style={styles.noteFooter}>
                    <Text style={styles.noteDate}>{note.date}</Text>
                    <Button label={t('common.delete')} variant="ghost" size="sm" onPress={() => handleDelete(note.id)} />
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}

        {filteredNotes.length === 0 && (
          <EmptyState icon="📝" title={t('money.notes.noNotes')} description={t('money.notes.addNote')} />
        )}

        {/* Add note */}
        {showAdd && (
          <Card style={styles.addCard}>
            <Text style={styles.addTitle}>{t('money.notes.addNote')}</Text>
            <Input label={t('common.name')} placeholder={t('money.notes.title')} value={newTitle} onChangeText={setNewTitle} />
            <Input label={t('money.notes.title')} placeholder={t('money.notes.addNote')} value={newBody} onChangeText={setNewBody} style={{ marginTop: theme.spacing.md }} />
            <View style={styles.addButtons}>
              <Button label={t('common.cancel')} variant="ghost" size="sm" onPress={() => setShowAdd(false)} />
              <Button label={t('common.add')} size="sm" onPress={handleCreate} disabled={!newTitle.trim()} />
            </View>
          </Card>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const useNotesStyles = createStyles((theme) =>
  StyleSheet.create({
    sectionTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textSecondary, marginTop: theme.spacing.lg },
    noteList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
    noteCard: { padding: theme.spacing.md },
    noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    noteTitle: { ...theme.typography.bodyLarge.style, color: theme.colors.textPrimary, fontWeight: '600', flex: 1 },
    noteBody: { ...theme.typography.bodyMedium.style, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, lineHeight: 20 },
    noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.sm },
    noteDate: { ...theme.typography.caption.style, color: theme.colors.textTertiary },
    addCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg },
    addTitle: { ...theme.typography.labelLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    addButtons: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md, justifyContent: 'flex-end' },
  }),
);
