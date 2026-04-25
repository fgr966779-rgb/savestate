// SaveState Currency Converter — fetches live exchange rates
// Deno Edge Function for Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://deno.land/x/cors@v0.1.2/cors.ts";

interface CachedRate {
  rate: number;
  fetchedAt: number;
}

interface ConversionRequest {
  amount: number;
  from: string;
  to: string;
}

interface ConversionResponse {
  from: string;
  to: string;
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  cached: boolean;
  fetchedAt: string;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// In-memory cache (survives within a single edge function cold start)
const rateCache = new Map<string, CachedRate>();

function getCacheKey(from: string, to: string): string {
  return `${from.toUpperCase()}_${to.toUpperCase()}`;
}

function getCachedRate(from: string, to: string): CachedRate | null {
  const key = getCacheKey(from, to);
  const cached = rateCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) {
    rateCache.delete(key);
    return null;
  }
  return cached;
}

async function fetchExchangeRate(from: string, to: string): Promise<{ rate: number; cached: boolean }> {
  // Check cache first
  const cached = getCachedRate(from, to);
  if (cached) {
    return { rate: cached.rate, cached: true };
  }

  // Use frankfurter.app — free, no API key, reliable, ECB rates
  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();

  const url = `https://api.frankfurter.app/latest?amount=1&from=${fromUpper}&to=${toUpper}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rate: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rate = data.rates?.[toUpper];

  if (rate === undefined || rate === null) {
    throw new Error(`Unsupported currency pair: ${fromUpper}/${toUpper}`);
  }

  // Store in cache
  const cacheKey = getCacheKey(from, to);
  rateCache.set(cacheKey, { rate, fetchedAt: Date.now() });

  return { rate, cached: false };
}

const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY",
  "SEK", "NZD", "MXN", "SGD", "HKD", "NOK", "KRW", "TRY",
  "INR", "RUB", "BRL", "ZAR", "DKK", "PLN", "THB", "IDR",
  "HUF", "CZK", "ILS", "PHP", "MYR", "RON", "BGN", "ISK",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const amount = parseFloat(url.searchParams.get("amount") ?? "0");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");

      if (!from || !to) {
        return new Response(
          JSON.stringify({ error: "Missing 'from' and/or 'to' parameters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (isNaN(amount) || amount <= 0) {
        return new Response(
          JSON.stringify({ error: "Invalid amount. Must be a positive number." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const fromUpper = from.toUpperCase();
      const toUpper = to.toUpperCase();

      if (!SUPPORTED_CURRENCIES.includes(fromUpper)) {
        return new Response(
          JSON.stringify({ error: `Unsupported currency: ${fromUpper}. Supported: ${SUPPORTED_CURRENCIES.join(", ")}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!SUPPORTED_CURRENCIES.includes(toUpper)) {
        return new Response(
          JSON.stringify({ error: `Unsupported currency: ${toUpper}. Supported: ${SUPPORTED_CURRENCIES.join(", ")}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { rate, cached } = await fetchExchangeRate(from, to);
      const convertedAmount = Math.round(amount * rate * 100) / 100;

      const result: ConversionResponse = {
        from: fromUpper,
        to: toUpper,
        originalAmount: amount,
        convertedAmount,
        rate,
        cached,
        fetchedAt: new Date().toISOString(),
      };

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      const body: ConversionRequest = await req.json();

      if (!body.amount || !body.from || !body.to) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: amount, from, to" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (typeof body.amount !== "number" || body.amount <= 0) {
        return new Response(
          JSON.stringify({ error: "Invalid amount. Must be a positive number." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const fromUpper = body.from.toUpperCase();
      const toUpper = body.to.toUpperCase();

      if (!SUPPORTED_CURRENCIES.includes(fromUpper) || !SUPPORTED_CURRENCIES.includes(toUpper)) {
        return new Response(
          JSON.stringify({ error: `Unsupported currency. Supported: ${SUPPORTED_CURRENCIES.join(", ")}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { rate, cached } = await fetchExchangeRate(body.from, body.to);
      const convertedAmount = Math.round(body.amount * rate * 100) / 100;

      const result: ConversionResponse = {
        from: fromUpper,
        to: toUpper,
        originalAmount: body.amount,
        convertedAmount,
        rate,
        cached,
        fetchedAt: new Date().toISOString(),
      };

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed. Use GET or POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Currency converter error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
