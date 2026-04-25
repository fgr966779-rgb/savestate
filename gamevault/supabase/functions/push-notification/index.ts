// SaveState Push Notification — sends notifications via Firebase Cloud Messaging
// Deno Edge Function for Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://deno.land/x/cors@v0.1.2/cors.ts";

interface NotificationButton {
  label: string;
  action: string;
}

interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  buttons?: NotificationButton[];
  priority?: "high" | "normal";
  sound?: string;
  imageUrl?: string;
}

interface NotificationDeliveryRecord {
  id: string;
  user_id: string;
  title: string;
  body: string;
  status: "sent" | "failed" | "pending";
  fcm_message_id?: string;
  error?: string;
  created_at: string;
}

interface FcmMessage {
  message: {
    token?: string;
    topic?: string;
    notification: {
      title: string;
      body: string;
      image?: string;
    };
    data?: Record<string, string>;
    android?: {
      priority?: string;
      notification?: {
        sound?: string;
        click_action?: string;
      };
    };
    apns?: {
      payload?: {
        aps?: {
          sound?: string;
          badge?: number;
          "content-available"?: number;
        };
      };
    };
    webpush?: {
      headers?: Record<string, string>;
      notification?: {
        icon?: string;
        badge?: string;
        actions?: Array<{
          action: string;
          title: string;
          icon?: string;
        }>;
      };
    };
  };
}

async function sendFcmNotification(
  fcmServerKey: string,
  message: FcmMessage,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const projectId = Deno.env.get("FCM_PROJECT_ID") ?? Deno.env.get("GOOGLE_CLOUD_PROJECT");
  const url = projectId
    ? `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`
    : "https://fcm.googleapis.com/fcm/send";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (projectId) {
    // v1 API with OAuth access token
    const accessToken = await getFcmAccessToken(projectId);
    headers["Authorization"] = `Bearer ${accessToken}`;
  } else {
    // Legacy API with server key
    headers["Authorization"] = `key=${fcmServerKey}`;
  }

  const body = projectId ? message : message.message;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const responseData = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: responseData.error?.message ?? `FCM error: ${response.status}`,
    };
  }

  return {
    success: true,
    messageId: responseData.name ?? responseData.message_id,
  };
}

async function getFcmAccessToken(projectId: string): Promise<string> {
  const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!serviceAccountJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not configured");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  const jwtPayload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: Math.floor(Date.now() / 1000) - 60,
    exp: Math.floor(Date.now() / 1000) + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payloadB64 = btoa(JSON.stringify(jwtPayload));

  const keyData = atob(serviceAccount.private_key);
  const keyArray = Uint8Array.from(keyData, (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyArray.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const tokenInput = `${headerB64}.${payloadB64}`;
  const tokenBuffer = encoder.encode(tokenInput);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, tokenBuffer);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

  const jwt = `${tokenInput}.${signatureB64}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function getUserFcmTokens(
  supabase: any,
  userId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Failed to fetch push tokens:", error);
    return [];
  }

  return data.map((row: any) => row.token);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY") ?? "";

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

    const body: PushNotificationRequest = await req.json();

    if (!body.userId || !body.title || !body.body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, title, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Can only send notifications to your own account" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's FCM tokens
    const tokens = await getUserFcmTokens(supabase, body.userId);

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ warning: "No push tokens registered for this user", delivered: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: NotificationDeliveryRecord[] = [];
    let successCount = 0;

    for (const token of tokens) {
      const message: FcmMessage = {
        message: {
          token,
          notification: {
            title: body.title,
            body: body.body,
            image: body.imageUrl,
          },
          data: body.data ?? {},
          android: {
            priority: body.priority === "high" ? "high" : "normal",
            notification: {
              sound: body.sound ?? "default",
              click_action: "FLUTTER_NOTIFICATION_CLICK",
            },
          },
          apns: {
            payload: {
              aps: {
                sound: body.sound ?? "default",
                badge: 1,
                "content-available": 1,
              },
            },
          },
          webpush: {
            headers: {
              Urgency: body.priority === "high" ? "high" : "normal",
            },
            notification: {
              icon: "/icons/icon-192x192.png",
              badge: "/icons/badge-72x72.png",
              actions: (body.buttons ?? []).map((btn) => ({
                action: btn.action,
                title: btn.label,
              })),
            },
          },
        },
      };

      // Add button data to the data payload
      if (body.buttons && body.buttons.length > 0) {
        message.message.data = {
          ...message.message.data,
          click_action_buttons: JSON.stringify(body.buttons),
        };
      }

      const result = await sendFcmNotification(fcmServerKey, message);

      const record: NotificationDeliveryRecord = {
        id: crypto.randomUUID(),
        user_id: body.userId,
        title: body.title,
        body: body.body,
        status: result.success ? "sent" : "failed",
        fcm_message_id: result.messageId,
        error: result.error,
        created_at: new Date().toISOString(),
      };

      results.push(record);

      if (result.success) {
        successCount++;
      }
    }

    return new Response(
      JSON.stringify({
        delivered: successCount,
        failed: tokens.length - successCount,
        total: tokens.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Push notification error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
