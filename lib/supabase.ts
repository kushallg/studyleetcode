import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function readKey(): string | undefined {
  // Prefer the new publishable key naming; fall back to the legacy anon key for compatibility.
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = readKey();
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart the dev server."
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export function hasSupabaseConfig(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!readKey();
}
