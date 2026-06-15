import { getRankByXP } from "@/lib/ranks";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

export async function ensureUserProfile(username?: string) {
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    return {
      profileCreated: false,
      error: config.message
    };
  }

  const supabase = getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return {
      profileCreated: false,
      error: userError?.message ?? "No authenticated user found."
    };
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("id,username")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    return {
      profileCreated: false,
      error: existingProfileError.message
    };
  }

  const metadataUsername =
    typeof user.user_metadata?.username === "string"
      ? user.user_metadata.username
      : "";
  const emailUsername =
    typeof user.email === "string" ? user.email.split("@")[0] : "";
  const requestedUsername = username?.trim() || metadataUsername.trim();

  if (existingProfile) {
    const existingUsername =
      typeof existingProfile.username === "string"
        ? existingProfile.username.trim()
        : "";
    const shouldRepairUsername =
      requestedUsername &&
      (!existingUsername || existingUsername === emailUsername || existingUsername === user.email);

    if (shouldRepairUsername) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username: requestedUsername })
        .eq("id", user.id);

      return {
        profileCreated: false,
        error: updateError?.message ?? null
      };
    }

    return {
      profileCreated: false,
      error: null
    };
  }

  const startingRank = getRankByXP(0);
  const profileUsername =
    requestedUsername || emailUsername || "New User";

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    username: profileUsername,
    current_xp: 0,
    current_rank: startingRank.index,
    current_rank_name: startingRank.name
  });

  return {
    profileCreated: !insertError,
    error: insertError?.message ?? null
  };
}
