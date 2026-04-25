import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, createStyles, triggerHaptic } from '@/constants/theme';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

// ── Types ────────────────────────────────────────────────────────
interface CommunityPost {
  id: string;
  username: string;
  avatar: string;
  action: string;
  timeAgo: string;
  reactions: Record<string, number>;
  commentCount: number;
  accentColor?: string;
}

const REACTION_EMOJIS = ['👍', '❤️', '🎉', '🔥'];

// ── Mock Data ────────────────────────────────────────────────────
const INITIAL_POSTS: CommunityPost[] = [
  { id: '1', username: 'NightWolf', avatar: '🐺', action: 'досяг цілі PS5!', timeAgo: '2 год тому', reactions: { '🔥': 12, '🎉': 8, '❤️': 3 }, commentCount: 5 },
  { id: '2', username: 'CryptoSaver', avatar: '₿', action: "отримав 'Марафонець'", timeAgo: '5 год тому', reactions: { '❤️': 8, '🎉': 4 }, commentCount: 3 },
  { id: '3', username: 'DragonSlayer', avatar: '🐉', action: 'стрік 30 днів!', timeAgo: '8 год тому', reactions: { '🔥': 30, '👍': 10, '🎉': 5 }, commentCount: 12 },
  { id: '4', username: 'PixelHero', avatar: '🎮', action: 'рівень 20!', timeAgo: '1 день тому', reactions: { '🎉': 18, '👍': 7 }, commentCount: 4 },
  { id: '5', username: 'SaveQueen', avatar: '👸', action: 'нова ціль — Макбук', timeAgo: '1 день тому', reactions: { '👍': 9, '❤️': 5 }, commentCount: 2 },
  { id: '6', username: 'GoldRush', avatar: '💰', action: 'перший депозит ₴1000', timeAgo: '2 дні тому', reactions: { '🎉': 15, '👍': 8, '🔥': 3 }, commentCount: 7 },
  { id: '7', username: 'NeoGamer', avatar: '🧠', action: 'виконав 50 квестів', timeAgo: '3 дні тому', reactions: { '🔥': 11, '👍': 6 }, commentCount: 1 },
  { id: '8', username: 'VaultKing', avatar: '👑', action: 'відкрив Emergency Fund', timeAgo: '4 дні тому', reactions: { '❤️': 20, '🎉': 14, '👍': 6 }, commentCount: 9 },
  { id: '9', username: 'StarDust', avatar: '⭐', action: 'отримав бейдж "Економіст"', timeAgo: '5 днів тому', reactions: { '👍': 5, '🎉': 3 }, commentCount: 0 },
];

const EXTRA_POSTS: CommunityPost[] = [
  { id: '10', username: 'IronSaver', avatar: '🛡️', action: 'стрік 60 днів!', timeAgo: '1 тиждень тому', reactions: { '🔥': 50, '❤️': 22, '🎉': 18 }, commentCount: 15 },
  { id: '11', username: 'FlashCoin', avatar: '⚡', action: 'зібрав ₴50 000!', timeAgo: '1 тиждень тому', reactions: { '🎉': 30, '🔥': 25, '👍': 12 }, commentCount: 8 },
  { id: '12', username: 'LunaFin', avatar: '🌙', action: "розблокувала 'Золотий стандарт'", timeAgo: '2 тижні тому', reactions: { '❤️': 14, '🎉': 9 }, commentCount: 3 },
];

// ── Post Card ────────────────────────────────────────────────────
function PostCard({ post, index }: { post: CommunityPost; index: number }) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [localReactions, setLocalReactions] = useState(post.reactions);
  const handleReaction = useCallback((emoji: string) => {
    triggerHaptic('buttonPress');
    setLocalReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] ?? 0) + 1,
    }));
  }, []);

  const activeEmojis = useMemo(
    () => Object.entries(localReactions).filter(([, count]) => count > 0),
    [localReactions],
  );

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(500)}>
      <Card style={styles.postCard}>
        <View style={styles.postHeader}>
          <Avatar size="sm" name={post.username} accentColor={theme.colors.accentPurple} />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.postUsername}>{post.username}</Text>
            <Text style={styles.postTime}>{post.timeAgo}</Text>
          </View>
          <Text style={styles.postAvatarEmoji}>{post.avatar}</Text>
        </View>
        <Text style={styles.postAction}>{post.action}</Text>

        <View style={styles.postFooter}>
          <View style={styles.reactionsRow}>
            {activeEmojis.map(([emoji, count]) => (
              <Pressable
                key={emoji}
                style={styles.reactionBubble}
                onPress={() => handleReaction(emoji)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                <Text style={styles.reactionCount}>{count}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.reactionBubble}
              onPress={() => handleReaction(REACTION_EMOJIS[index % REACTION_EMOJIS.length])}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.reactionAdd}>+</Text>
            </Pressable>
          </View>
          <View style={styles.commentBubble}>
            <Text style={styles.commentIcon}>💬</Text>
            <Text style={styles.commentCount}>{post.commentCount}</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

// ── Screen ───────────────────────────────────────────────────────
export default function CommunityFeedScreen() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const extraIndex = useRef(0);

  const handleRefresh = useCallback(() => {
    triggerHaptic('buttonPress');
    setRefreshing(true);
    setTimeout(() => {
      setPosts(INITIAL_POSTS);
      extraIndex.current = 0;
      setRefreshing(false);
    }, 1200);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    if (extraIndex.current >= EXTRA_POSTS.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      const next = EXTRA_POSTS[extraIndex.current];
      if (next) {
        extraIndex.current += 1;
        setPosts((prev) => [...prev, next]);
      }
      setLoadingMore(false);
    }, 800);
  }, [loadingMore]);

  const StickyHeader = useMemo(
    () => (
      <View style={styles.stickyHeader}>
        <Text style={styles.stickyTitle}>📰 Стрічка</Text>
      </View>
    ),
    [styles],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HeaderBar title="Спільнота" leftAction={{ icon: '←', onPress: () => {} }} />
      <ScreenLayout scrollable={false} withBottomTabBar>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <PostCard post={item} index={index} />}
          ListHeaderComponent={StickyHeader}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            loadingMore ? (
              <Text style={styles.loadingMore}>Завантаження...</Text>
            ) : null
          }
        />
      </ScreenLayout>
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    stickyHeader: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    stickyTitle: {
      ...theme.typography.titleLarge.style,
      color: theme.colors.textPrimary,
    },
    listContent: {
      paddingHorizontal: 2,
    },
    postCard: {
      marginBottom: theme.spacing.sm,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    postHeaderInfo: {
      flex: 1,
    },
    postUsername: {
      ...theme.typography.labelMedium.style,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    postTime: {
      ...theme.typography.caption.style,
      color: theme.colors.textTertiary,
      marginTop: 1,
    },
    postAvatarEmoji: {
      fontSize: 24,
    },
    postAction: {
      ...theme.typography.bodyLarge.style,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      lineHeight: 22,
    },
    postFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    reactionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      flexWrap: 'wrap',
      flex: 1,
    },
    reactionBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: theme.radii.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      gap: 4,
    },
    reactionEmoji: {
      fontSize: 14,
    },
    reactionCount: {
      ...theme.typography.caption.style,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      fontSize: 11,
    },
    reactionAdd: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      fontWeight: '700',
    },
    commentBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      backgroundColor: theme.colors.bgTertiary,
      borderRadius: theme.radii.full,
    },
    commentIcon: {
      fontSize: 14,
    },
    commentCount: {
      ...theme.typography.caption.style,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      fontSize: 11,
    },
    loadingMore: {
      ...theme.typography.bodySmall.style,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
    },
  }),
);
