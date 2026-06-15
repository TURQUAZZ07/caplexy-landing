import { createClient } from "@supabase/supabase-js";

const missingSupabaseMessage =
  "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseConfigStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
    message: missingSupabaseMessage,
    supabaseUrl,
    supabaseAnonKey
  };
}

export function getSupabaseClient() {
  const { isConfigured, supabaseUrl, supabaseAnonKey } =
    getSupabaseConfigStatus();

  if (!isConfigured || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(missingSupabaseMessage);
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}
