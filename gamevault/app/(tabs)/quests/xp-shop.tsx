import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/useAuthStore';

interface ShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
  category: 'powerups' | 'cosmetics' | 'boosts';
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'xp_double', name: 'Подвійний XP', icon: '⚡', cost: 500, description: 'Подвоює XP за наступний квест', category: 'powerups' },
  { id: 'streak_freeze', name: 'Заморозка серії', icon: '❄️', cost: 300, description: 'Зберігає вашу серію на 1 день', category: 'powerups' },
  { id: 'instant_complete', name: 'Миттєве виконання', icon: '✨', cost: 800, description: 'Завершує один активний квест', category: 'powerups' },
  { id: 'avatar_fire', name: 'Аватар з вогнем', icon: '🔥', cost: 200, description: 'Анімований вогонь біля аватара', category: 'cosmetics' },
  { id: 'avatar_rainbow', name: 'Веселковий бейдж', icon: '🌈', cost: 350, description: 'Райдужний бейдж на рівні', category: 'cosmetics' },
  { id: 'theme_gold', name: 'Золота тема', icon: '👑', cost: 1000, description: 'Ексклюзивна золота тема інтерфейсу', category: 'cosmetics' },
  { id: 'xp_boost_1h', name: 'XP буст 1 год', icon: '🚀', cost: 400, description: '+50% XP на 1 годину', category: 'boosts' },
  { id: 'coin_boost_1h', name: 'Монетний буст 1 год', icon: '💰', cost: 400, description: '+50% монет на 1 годину', category: 'boosts' },
  { id: 'weekly_bonus', name: 'Тижневий бонус', icon: '🎁', cost: 1500, description: 'Додаткові нагороди за тиждень', category: 'boosts' },
];

const CATEGORIES = [
  { key: 'all' as const, label: 'Усе' },
  { key: 'powerups' as const, label: 'Потужності' },
  { key: 'cosmetics' as const, label: 'Косметика' },
  { key: 'boosts' as const, label: 'Бусти' },
];

export default function XPShopScreen() {
  const theme = useTheme();
  const styles = useShopStyles(theme);
  const user = useAuthStore((s) => s.user);
  const [category, setCategory] = useState<string>('all');
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  const userXP = user?.totalXp ?? 0;

  const filteredItems = useMemo(() => {
    if (category === 'all') return SHOP_ITEMS;
    return SHOP_ITEMS.filter((item) => item.category === category);
  }, [category]);

  const handleBuy = (item: ShopItem) => {
    if (userXP < item.cost || purchased.has(item.id)) return;
    triggerHaptic('questComplete');
    setPurchased((prev) => new Set(prev).add(item.id));
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Магазин XP" leftAction={{ icon: '←', onPress: () => {} }} />
      <ScreenLayout scrollable withBottomTabBar>
        {/* XP Balance */}
        <Card variant="achievement" style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceIcon}>⚡</Text>
            <View>
              <Text style={styles.balanceLabel}>Ваш баланс</Text>
              <Text style={styles.balanceValue}>{userXP.toLocaleString('uk-UA')} XP</Text>
            </View>
          </View>
        </Card>

        {/* Categories */}
        <View style={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <Chip key={cat.key} label={cat.label} selected={category === cat.key} onPress={() => setCategory(cat.key)} />
          ))}
        </View>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <EmptyState icon="🏪" title="Немає товарів" description="У цій категорії поки немає товарів" />
        ) : (
          <View style={styles.itemsGrid}>
            {filteredItems.map((item) => {
              const canAfford = userXP >= item.cost;
              const isPurchased = purchased.has(item.id);
              return (
                <Card key={item.id} style={[styles.shopItem, !canAfford && styles.disabledItem]} variant={isPurchased ? 'achievement' : 'default'}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.itemBottom}>
                    <Text style={[styles.itemCost, { color: canAfford ? theme.colors.accentBlue : theme.colors.textDisabled }]}>
                      ⚡ {item.cost} XP
                    </Text>
                    <Button
                      label={isPurchased ? 'Куплено' : 'Купити'}
                      size="sm"
                      variant={isPurchased ? 'ghost' : 'primary'}
                      disabled={!canAfford || isPurchased}
                      onPress={() => handleBuy(item)}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScreenLayout>
    </>
  );
}

const useShopStyles = createStyles((theme) =>
  StyleSheet.create({
    balanceCard: { marginBottom: theme.spacing.md },
    balanceRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    balanceIcon: { fontSize: 32 },
    balanceLabel: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary },
    balanceValue: { ...theme.typography.titleLarge.style, color: theme.colors.accentGold, fontWeight: '700' },
    filterRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg, flexWrap: 'wrap' },
    itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
    shopItem: { width: '48%', padding: theme.spacing.md },
    disabledItem: { opacity: 0.5 },
    itemIcon: { fontSize: 28, marginBottom: theme.spacing.xs },
    itemName: { ...theme.typography.titleLarge.style, color: theme.colors.textPrimary, marginBottom: 4 },
    itemDesc: { ...theme.typography.bodySmall.style, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
    itemBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    itemCost: { ...theme.typography.code.style, fontWeight: '700', fontSize: 12 },
  }),
);
