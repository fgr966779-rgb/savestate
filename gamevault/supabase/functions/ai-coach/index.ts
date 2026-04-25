// SaveState AI Coach — personalized saving advice via GPT-4o mini
// Deno Edge Function for Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://deno.land/x/cors@v0.1.2/cors.ts";

const DENO_KV = await Deno.openKv();

interface AdviceItem {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface CoachRequest {
  userId: string;
  goalProgress?: Array<{
    goalId: string;
    title: string;
    currentAmount: number;
    targetAmount: number;
    strategy: string;
  }>;
  recentTransactions?: Array<{
    amount: number;
    type: string;
    category: string;
    createdAt: string;
  }>;
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const key = [`rate_limit`, userId, today];

  const result = await DENO_KV.get<number>(key);
  const currentCount = result.value ?? 0;

  if (currentCount >= 10) {
    return false;
  }

  await DENO_KV.set(key, currentCount + 1, { expireIn: 24 * 60 * 60 * 1000 });
  return true;
}

function buildPrompt(req: CoachRequest, userData: {
  level: number;
  totalXp: number;
  currentStreak: number;
}): string {
  const { goalProgress, recentTransactions } = req;

  let prompt = `You are an AI savings coach for "SaveState", a gamified savings app. 
The user is level ${userData.level} with ${userData.totalXp} total XP and a current ${userData.currentStreak}-day saving streak.

Provide 3-4 personalized saving tips. Be encouraging, use gaming metaphors sparingly, and be specific to the user's data.
Return a JSON array of objects with "title", "description", and "priority" (high/medium/low) fields.`;

  if (goalProgress && goalProgress.length > 0) {
    prompt += `\n\nCurrent Goals:\n`;
    for (const goal of goalProgress) {
      const pct = goal.targetAmount > 0
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0;
      prompt += `- "${goal.title}": ${pct}% complete ($${goal.currentAmount} / $${goal.targetAmount}), strategy: ${goal.strategy}\n`;
    }
  }

  if (recentTransactions && recentTransactions.length > 0) {
    prompt += `\nRecent Transactions:\n`;
    for (const tx of recentTransactions.slice(0, 10)) {
      prompt += `- ${tx.type}: $${tx.amount}, category: ${tx.category || "none"}, date: ${tx.createdAt}\n`;
    }
  }

  prompt += `\n\nRespond ONLY with a valid JSON array. No markdown, no explanation, just the array.`;
  return prompt;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("AI_COACH_API_KEY");
    const baseUrl = Deno.env.get("AI_COACH_BASE_URL");
    const model = Deno.env.get("AI_COACH_MODEL");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const rateLimitOk = await checkRateLimit(user.id);
    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Maximum 10 calls per day." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CoachRequest = await req.json();
    if (!body.userId || body.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Invalid userId" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user stats
    const [userRes, streakRes] = await Promise.all([
      supabase.from("users").select("level, total_xp").eq("id", user.id).single(),
      supabase.from("streaks").select("current_streak").eq("user_id", user.id).single(),
    ]);

    const userData = {
      level: userRes.data?.level ?? 1,
      totalXp: userRes.data?.total_xp ?? 0,
      currentStreak: streakRes.data?.current_streak ?? 0,
    };

    const prompt = buildPrompt(body, userData);

    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://savestate.app",
        "X-Title": "SaveState AI Coach",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "You are a helpful financial coach for a gamified savings app. Always respond with valid JSON arrays only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text();
      console.error("AI Provider error:", errBody);
      return new Response(
        JSON.stringify({ error: "Failed to generate advice" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content ?? "[]";

    let advice: AdviceItem[];
    try {
      const parsed = JSON.parse(content);
      // Handle both array and object with array property
      advice = Array.isArray(parsed) ? parsed : (parsed.advice ?? parsed.tips ?? parsed.results ?? []);
    } catch {
      advice = [{ title: "Keep Going!", description: "You're on the right track with your savings journey.", priority: "medium" }];
    }

    // Validate structure
    advice = advice
      .filter((item: any) => item.title && item.description)
      .map((item: any) => ({
        title: String(item.title),
        description: String(item.description),
        priority: ["high", "medium", "low"].includes(item.priority) ? item.priority : "medium",
      }));

    return new Response(
      JSON.stringify({ advice }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("AI Coach error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
