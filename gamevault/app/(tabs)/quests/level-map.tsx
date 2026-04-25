import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { levels, rarityColors, rarityLabels, getLevelForXP } from '@/constants/levels';

export default function LevelMapScreen() {
  const theme = useTheme();
  const styles = useLevelMapStyles(theme);
  const user = useAuthStore((s) => s.user);
  const currentLevel = user ? getLevelForXP(user.totalXp).level : 1;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Карта рівнів" leftAction={{ icon: '←', onPress: () => {} }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* Current Level Highlight */}
        <Card variant="glowing" style={styles.currentCard}>
          <View style={styles.currentRow}>
            <View style={styles.currentLevelCircle}>
              <Text style={styles.currentLevelText}>{currentLevel}</Text>
            </View>
            <View style={styles.currentInfo}>
              <Text style={styles.currentLabel}>Ваш поточний рівень</Text>
              <Text style={styles.currentTitle}>{levels[currentLevel - 1].title}</Text>
              <Text style={styles.currentXP}>{user?.totalXp ?? 0} XP</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Всі 50 рівнів</Text>

        <FlatList
          data={levels}
          keyExtractor={(item) => String(item.level)}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            const isUnlocked = item.level <= currentLevel;
            const isCurrent = item.level === currentLevel;
            const rarityColor = rarityColors[item.rarity];
            const showUnlock = isCurrent || item.level === currentLevel + 1;

            return (
              <View style={styles.nodeWrapper}>
                {index > 0 && (
                  <View style={[styles.connector, { backgroundColor: isUnlocked ? rarityColor : theme.colors.borderSubtle }]} />
                )}
                <Card
                  variant={isCurrent ? 'glowing' : isUnlocked ? 'achievement' : 'default'}
                  selected={isCurrent}
                  style={[styles.levelNode, !isUnlocked && styles.lockedNode]}
                >
                  <View style={styles.nodeRow}>
                    <View style={[styles.nodeCircle, { borderColor: rarityColor, backgroundColor: isUnlocked ? rarityColor + '20' : theme.colors.bgTertiary }]}>
                      <Text style={[styles.nodeLevel, { color: isUnlocked ? rarityColor : theme.colors.textDisabled }]}>{item.level}</Text>
                    </View>
                    <View style={styles.nodeInfo}>
                      <Text style={[styles.nodeTitle, { color: isUnlocked ? theme.colors.textPrimary : theme.colors.textTertiary }]}>
                        {item.title}
                      </Text>
                      <View style={styles.nodeMeta}>
                        <Badge variant="level" text={rarityLabels[item.rarity]} style={{ marginRight: theme.spacing.xs }} />
                        <Text style={styles.xpReq}>{item.levelUpXP} XP</Text>
                      </View>
                      {showUnlock && (
                        <Text style={[styles.unlockDesc, { color: rarityColor }]}>{item.unlockDescription}</Text>
                      )}
                    </View>
                  </View>
                </Card>
              </View>
            );
          }}
        />
      </ScreenLayout>
    </>
  );
}

const useLevelMapStyles = createStyles((theme) =>
  StyleSheet.create({
    currentCard: { marginBottom: theme.spacing.lg },
    currentRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
    currentLevelCircle: {
      width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.accentBlue,
      justifyContent: 'center', alignItems: 'center',
    },
    currentLevelText: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, fontWeight: '800' },
    currentInfo: { flex: 1 },
    currentLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textTertiary },
    currentTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary },
    currentXP: { ...theme.typography.code.style, color: theme.colors.accentBlue },
    sectionTitle: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
    nodeWrapper: { position: 'relative' },
    connector: {
      position: 'absolute', top: -12, left: 28, width: 2, height: 12,
    },
    levelNode: { width: '100%' },
    lockedNode: { opacity: 0.4 },
    nodeRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    nodeCircle: {
      width: 48, height: 48, borderRadius: 24, borderWidth: 2,
      justifyContent: 'center', alignItems: 'center',
    },
    nodeLevel: { ...theme.typography.code.style, fontWeight: '800', fontSize: 14 },
    nodeInfo: { flex: 1 },
    nodeTitle: { ...theme.typography.titleLarge.style },
    nodeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    xpReq: { ...theme.typography.code.style, color: theme.colors.textTertiary, fontSize: 10 },
    unlockDesc: { ...theme.typography.bodySmall.style, marginTop: 4 },
  }),
);
