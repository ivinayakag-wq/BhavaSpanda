import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }
  _client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _client;
}
