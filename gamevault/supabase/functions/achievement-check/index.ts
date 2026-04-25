// SaveState Achievement Checker — checks and unlocks achievements
// Deno Edge Function for Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://deno.land/x/cors@v0.1.2/cors.ts";

interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  condition: (ctx: AchievementContext) => boolean;
}

interface AchievementContext {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalAmountSaved: number;
  completedGoals: number;
  activeGoals: number;
  totalQuestsCompleted: number;
  achievementsUnlocked: number;
  firstDepositDate: string | null;
  totalDaysActive: number;
}

interface AchievementUnlockResult {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  unlockedAt: string;
}

interface AchievementCheckResponse {
  newlyUnlocked: AchievementUnlockResult[];
  totalAchievements: number;
  checkedAt: string;
}

// ============================================================
// Achievement Definitions
// ============================================================

const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    achievementId: "streak_3",
    title: "On Fire",
    description: "Maintain a 3-day saving streak",
    icon: "🔥",
    xpReward: 50,
    coinReward: 10,
    condition: (ctx) => ctx.currentStreak >= 3,
  },
  {
    achievementId: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day saving streak",
    icon: "⚡",
    xpReward: 150,
    coinReward: 30,
    condition: (ctx) => ctx.currentStreak >= 7,
  },
  {
    achievementId: "streak_30",
    title: "Monthly Master",
    description: "Maintain a 30-day saving streak",
    icon: "👑",
    xpReward: 500,
    coinReward: 100,
    condition: (ctx) => ctx.currentStreak >= 30,
  },
  {
    achievementId: "streak_100",
    title: "Legendary Saver",
    description: "Maintain a 100-day saving streak",
    icon: "🏆",
    xpReward: 2000,
    coinReward: 500,
    condition: (ctx) => ctx.currentStreak >= 100,
  },

  // XP / Level achievements
  {
    achievementId: "level_5",
    title: "Apprentice",
    description: "Reach level 5",
    icon: "🛡️",
    xpReward: 100,
    coinReward: 25,
    condition: (ctx) => ctx.level >= 5,
  },
  {
    achievementId: "level_10",
    title: "Knight",
    description: "Reach level 10",
    icon: "⚔️",
    xpReward: 300,
    coinReward: 75,
    condition: (ctx) => ctx.level >= 10,
  },
  {
    achievementId: "level_25",
    title: "Champion",
    description: "Reach level 25",
    icon: "🦸",
    xpReward: 1000,
    coinReward: 250,
    condition: (ctx) => ctx.level >= 25,
  },
  {
    achievementId: "level_50",
    title: "Grandmaster",
    description: "Reach level 50",
    icon: "🌟",
    xpReward: 3000,
    coinReward: 750,
    condition: (ctx) => ctx.level >= 50,
  },
  {
    achievementId: "xp_1000",
    title: "XP Hunter",
    description: "Earn 1,000 total XP",
    icon: "✨",
    xpReward: 50,
    coinReward: 15,
    condition: (ctx) => ctx.totalXp >= 1000,
  },
  {
    achievementId: "xp_10000",
    title: "XP Legend",
    description: "Earn 10,000 total XP",
    icon: "💫",
    xpReward: 500,
    coinReward: 100,
    condition: (ctx) => ctx.totalXp >= 10000,
  },

  // Goal achievements
  {
    achievementId: "first_goal",
    title: "Goal Setter",
    description: "Create your first savings goal",
    icon: "🎯",
    xpReward: 50,
    coinReward: 10,
    condition: (ctx) => ctx.completedGoals + ctx.activeGoals >= 1,
  },
  {
    achievementId: "first_deposit",
    title: "First Blood",
    description: "Make your first deposit",
    icon: "💰",
    xpReward: 25,
    coinReward: 5,
    condition: (ctx) => ctx.totalDeposits >= 1,
  },
  {
    achievementId: "goal_completed",
    title: "Goal Crusher",
    description: "Complete your first savings goal",
    icon: "🎉",
    xpReward: 200,
    coinReward: 50,
    condition: (ctx) => ctx.completedGoals >= 1,
  },
  {
    achievementId: "goals_5",
    title: "Multi-Quester",
    description: "Complete 5 savings goals",
    icon: "🏅",
    xpReward: 500,
    coinReward: 125,
    condition: (ctx) => ctx.completedGoals >= 5,
  },
  {
    achievementId: "goals_10",
    title: "Goal Conqueror",
    description: "Complete 10 savings goals",
    icon: "🎖️",
    xpReward: 1000,
    coinReward: 250,
    condition: (ctx) => ctx.completedGoals >= 10,
  },

  // Savings amount achievements
  {
    achievementId: "saved_100",
    title: "Penny Saver",
    description: "Save a total of $100",
    icon: "🪙",
    xpReward: 75,
    coinReward: 15,
    condition: (ctx) => ctx.totalAmountSaved >= 100,
  },
  {
    achievementId: "saved_1000",
    title: "Thousandaire",
    description: "Save a total of $1,000",
    icon: "💎",
    xpReward: 300,
    coinReward: 75,
    condition: (ctx) => ctx.totalAmountSaved >= 1000,
  },
  {
    achievementId: "saved_10000",
    title: "Savings Titan",
    description: "Save a total of $10,000",
    icon: "🏦",
    xpReward: 1000,
    coinReward: 250,
    condition: (ctx) => ctx.totalAmountSaved >= 10000,
  },
  {
    achievementId: "saved_50000",
    title: "Fortune Builder",
    description: "Save a total of $50,000",
    icon: "🏰",
    xpReward: 3000,
    coinReward: 750,
    condition: (ctx) => ctx.totalAmountSaved >= 50000,
  },

  // Deposit frequency achievements
  {
    achievementId: "deposits_10",
    title: "Regular Saver",
    description: "Make 10 deposits",
    icon: "📋",
    xpReward: 100,
    coinReward: 25,
    condition: (ctx) => ctx.totalDeposits >= 10,
  },
  {
    achievementId: "deposits_50",
    title: "Deposit Machine",
    description: "Make 50 deposits",
    icon: "🔄",
    xpReward: 300,
    coinReward: 75,
    condition: (ctx) => ctx.totalDeposits >= 50,
  },
  {
    achievementId: "deposits_100",
    title: "Centurion Saver",
    description: "Make 100 deposits",
    icon: "💯",
    xpReward: 750,
    coinReward: 150,
    condition: (ctx) => ctx.totalDeposits >= 100,
  },

  // Quest achievements
  {
    achievementId: "quest_1",
    title: "Quest Starter",
    description: "Complete your first quest",
    icon: "📜",
    xpReward: 50,
    coinReward: 10,
    condition: (ctx) => ctx.totalQuestsCompleted >= 1,
  },
  {
    achievementId: "quest_25",
    title: "Quest Hunter",
    description: "Complete 25 quests",
    icon: "🗡️",
    xpReward: 500,
    coinReward: 125,
    condition: (ctx) => ctx.totalQuestsCompleted >= 25,
  },
  {
    achievementId: "quest_100",
    title: "Quest Lord",
    description: "Complete 100 quests",
    icon: "⚡",
    xpReward: 1500,
    coinReward: 375,
    condition: (ctx) => ctx.totalQuestsCompleted >= 100,
  },

  // Achievement collection
  {
    achievementId: "achievements_5",
    title: "Collector",
    description: "Unlock 5 achievements",
    icon: "🔑",
    xpReward: 100,
    coinReward: 25,
    condition: (ctx) => ctx.achievementsUnlocked >= 5,
  },
  {
    achievementId: "achievements_15",
    title: "Achievement Seeker",
    description: "Unlock 15 achievements",
    icon: "🗝️",
    xpReward: 400,
    coinReward: 100,
    condition: (ctx) => ctx.achievementsUnlocked >= 15,
  },
];

async function buildAchievementContext(supabase: any, userId: string): Promise<AchievementContext> {
  // Fetch user data
  const { data: userData } = await supabase
    .from("users")
    .select("level, total_xp, created_at")
    .eq("id", userId)
    .single();

  // Fetch streak data
  const { data: streakData } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak")
    .eq("user_id", userId)
    .single();

  // Fetch transaction aggregates
  const { data: txStats } = await supabase
    .from("transactions")
    .select("type, amount, created_at")
    .eq("user_id", userId);

  // Fetch goal stats
  const { data: goalStats } = await supabase
    .from("goals")
    .select("status, current_amount")
    .eq("user_id", userId);

  // Fetch completed quests count
  const { count: completedQuests } = await supabase
    .from("quests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");

  // Fetch unlocked achievements count
  const { count: unlockedAchievements } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("unlocked", true);

  // Calculate derived stats
  const deposits = txStats?.filter((tx: any) => tx.type === "deposit") ?? [];
  const withdrawals = txStats?.filter((tx: any) => tx.type === "withdrawal") ?? [];
  const completedGoals = goalStats?.filter((g: any) => g.status === "completed") ?? [];
  const activeGoals = goalStats?.filter((g: any) => g.status === "active") ?? [];

  const totalAmountSaved = goalStats?.reduce((sum: number, g: any) => sum + parseFloat(g.current_amount || 0), 0) ?? 0;

  const firstDepositDate = deposits.length > 0
    ? deposits.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]?.created_at
    : null;

  const createdAt = userData?.created_at ? new Date(userData.created_at) : new Date();
  const totalDaysActive = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    totalXp: userData?.total_xp ?? 0,
    level: userData?.level ?? 1,
    currentStreak: streakData?.current_streak ?? 0,
    longestStreak: streakData?.longest_streak ?? 0,
    totalDeposits: deposits.length,
    totalWithdrawals: withdrawals.length,
    totalAmountSaved,
    completedGoals: completedGoals.length,
    activeGoals: activeGoals.length,
    totalQuestsCompleted: completedQuests ?? 0,
    achievementsUnlocked: unlockedAchievements ?? 0,
    firstDepositDate,
    totalDaysActive,
  };
}

async function triggerPushNotification(
  userId: string,
  achievement: AchievementUnlockResult,
): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const pushFunctionUrl = `${supabaseUrl}/functions/v1/push-notification`;

  try {
    await fetch(pushFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        userId,
        title: `${achievement.icon} Achievement Unlocked!`,
        body: `${achievement.title} — ${achievement.description}`,
        data: {
          type: "achievement_unlocked",
          achievementId: achievement.achievementId,
          xpReward: String(achievement.xpReward),
          coinReward: String(achievement.coinReward),
        },
        priority: "high",
        sound: "achievement.wav",
      }),
    });
  } catch (err) {
    console.error("Failed to send achievement push notification:", err);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from user data
    const ctx = await buildAchievementContext(supabase, user.id);

    // Fetch already unlocked achievement IDs
    const { data: existingAchievements } = await supabase
      .from("achievements")
      .select("achievement_id")
      .eq("user_id", user.id)
      .eq("unlocked", true);

    const unlockedIds = new Set(existingAchievements?.map((a: any) => a.achievement_id) ?? []);

    // Check all achievements
    const newlyUnlocked: AchievementUnlockResult[] = [];
    const upsertRecords: Array<{
      user_id: string;
      achievement_id: string;
      unlocked: boolean;
      unlocked_at: string;
    }> = [];
    const totalXpGained: number[] = [];
    const totalCoinsGained: number[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip already unlocked
      if (unlockedIds.has(achievement.achievementId)) continue;

      // Check condition
      if (achievement.condition(ctx)) {
        const unlockResult: AchievementUnlockResult = {
          achievementId: achievement.achievementId,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          coinReward: achievement.coinReward,
          unlockedAt: new Date().toISOString(),
        };

        newlyUnlocked.push(unlockResult);
        upsertRecords.push({
          user_id: user.id,
          achievement_id: achievement.achievementId,
          unlocked: true,
          unlocked_at: unlockResult.unlockedAt,
        });
        totalXpGained.push(achievement.xpReward);
        totalCoinsGained.push(achievement.coinReward);
      }
    }

    // Batch insert newly unlocked achievements
    if (upsertRecords.length > 0) {
      const { error: insertError } = await supabase
        .from("achievements")
        .upsert(upsertRecords, { onConflict: "user_id,achievement_id" });

      if (insertError) {
        console.error("Failed to insert achievements:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to save achievements" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update user XP
      if (totalXpGained.length > 0) {
        const xpToAdd = totalXpGained.reduce((a, b) => a + b, 0);
        await supabase.rpc("add_user_xp", { user_uuid: user.id, xp_amount: xpToAdd });
      }
    }

    // Trigger push notifications for new achievements (fire-and-forget)
    if (newlyUnlocked.length > 0) {
      for (const achievement of newlyUnlocked) {
        // Non-blocking notification
        triggerPushNotification(user.id, achievement);
      }
    }

    const response: AchievementCheckResponse = {
      newlyUnlocked,
      totalAchievements: ctx.achievementsUnlocked + newlyUnlocked.length,
      checkedAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Achievement check error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
