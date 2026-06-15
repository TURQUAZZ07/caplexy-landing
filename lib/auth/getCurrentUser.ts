import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

export async function getCurrentUser() {
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    return {
      user: null,
      error: config.message
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();

    return {
      user: data.user,
      error: error?.message ?? null
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unable to load user."
    };
  }
}
