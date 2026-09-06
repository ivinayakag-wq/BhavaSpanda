import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseUrl.startsWith("http") && supabaseKey && supabaseKey !== "your_supabase_anon_key";

export function createClient() {
  if (!isConfigured) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  }
  return createBrowserClient(supabaseUrl!, supabaseKey!);
}
