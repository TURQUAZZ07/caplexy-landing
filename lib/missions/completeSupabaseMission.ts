import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import { formatEventSubject, recordCareerEvent } from "@/lib/career-events";
import { writeStoredXp } from "@/lib/progress";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

type CompleteSupabaseMissionOptions = {
  moduleSlug: string;
  missionKey: string;
  reward: number;
};

export type MissionPromotion = {
  newRankName: string;
  currentNm: number;
  nextRankName: string;
  nmRemaining: number;
  rankIndex: number;
};

export async function completeSupabaseMission({
  moduleSlug,
  missionKey,
  reward
}: CompleteSupabaseMissionOptions) {
  const logPrefix = `[Caplexy mission:${missionKey}]`;
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    console.warn(logPrefix, "Supabase is not configured.");
    return {
      awarded: false,
      error: config.message,
      promotion: null
    };
  }

  const supabase = getSupabaseClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const user = sessionData.session?.user ?? null;

  if (sessionError || !user) {
    console.warn(logPrefix, "No Supabase session found.", sessionError);
    return {
      awarded: false,
      error: sessionError?.message ?? "No authenticated user found.",
      promotion: null
    };
  }

  console.log(logPrefix, "current user id before update:", user.id);

  const ensuredProfile = await ensureUserProfile();

  if (ensuredProfile.error) {
    console.error(logPrefix, "profile ensure failed:", ensuredProfile.error);
    return {
      awarded: false,
      error: ensuredProfile.error,
      promotion: null
    };
  }

  const { data: profileBefore, error: profileBeforeError } = await supabase
    .from("profiles")
    .select("id,current_xp")
    .eq("id", user.id)
    .maybeSingle();

  console.log(logPrefix, "profile before update:", profileBefore);

  if (profileBeforeError) {
    console.error(logPrefix, "profile fetch failed:", profileBeforeError);
    return {
      awarded: false,
      error: profileBeforeError.message,
      promotion: null
    };
  }

  if (!profileBefore) {
    console.error(logPrefix, "profile missing after ensureUserProfile.");
    return {
      awarded: false,
      error: "Profile row was not found for the current user.",
      promotion: null
    };
  }

  const { data: existingMission, error: missionReadError } = await supabase
    .from("mission_progress")
    .select("completed,xp_earned")
    .eq("user_id", user.id)
    .eq("module_slug", moduleSlug)
    .eq("mission_key", missionKey)
    .maybeSingle();

  if (missionReadError) {
    console.error(logPrefix, "mission progress fetch failed:", missionReadError);
    return {
      awarded: false,
      error: missionReadError.message,
      promotion: null
    };
  }

  if (existingMission?.completed === true) {
    console.log(logPrefix, "duplicate reward prevented:", existingMission);
    const { data: profileAfterDuplicate } = await supabase
      .from("profiles")
      .select("current_xp")
      .eq("id", user.id)
      .maybeSingle();
    const currentXp =
      typeof profileAfterDuplicate?.current_xp === "number"
        ? profileAfterDuplicate.current_xp
        : null;

    if (currentXp !== null) {
      writeStoredXp(currentXp);
    }

    return {
      awarded: false,
      error: null,
      promotion: null
    };
  }

  const currentXp =
    typeof profileBefore.current_xp === "number" ? profileBefore.current_xp : 0;
  const nextXp = currentXp + reward;
  const completedAt = new Date().toISOString();

  const { error: pendingMissionError } = await supabase
    .from("mission_progress")
    .upsert(
      {
        user_id: user.id,
        module_slug: moduleSlug,
        mission_key: missionKey,
        completed: false,
        xp_earned: 0,
        completed_at: null
      },
      { onConflict: "user_id,module_slug,mission_key" }
    );

  if (pendingMissionError) {
    console.error(logPrefix, "pending mission_progress upsert failed:", pendingMissionError);
    return {
      awarded: false,
      error: pendingMissionError.message,
      promotion: null
    };
  }

  console.log(logPrefix, "updating profile current_xp with id filter:", {
    id: user.id,
    currentXp,
    nextXp
  });

  const { error: profileWriteError } = await supabase
    .from("profiles")
    .update({
      current_xp: nextXp
    })
    .eq("id", user.id);

  if (profileWriteError) {
    console.error(logPrefix, "profile update failed:", profileWriteError);
    return {
      awarded: false,
      error: profileWriteError.message,
      promotion: null
    };
  }

  const { data: profileAfter, error: profileAfterError } = await supabase
    .from("profiles")
    .select("current_xp")
    .eq("id", user.id)
    .single();

  console.log(logPrefix, "profile after update:", profileAfter);

  if (profileAfterError) {
    console.error(logPrefix, "profile refetch failed:", profileAfterError);
    return {
      awarded: false,
      error: profileAfterError.message,
      promotion: null
    };
  }

  if (profileAfter?.current_xp !== nextXp) {
    const message = `Profile NM update did not persist. Expected ${nextXp}, received ${String(profileAfter?.current_xp)}.`;
    console.error(logPrefix, message);
    return {
      awarded: false,
      error: message,
      promotion: null
    };
  }

  const { error: missionWriteError } = await supabase
    .from("mission_progress")
    .upsert(
      {
        user_id: user.id,
        module_slug: moduleSlug,
        mission_key: missionKey,
        completed: true,
        xp_earned: reward,
        completed_at: completedAt
      },
      { onConflict: "user_id,module_slug,mission_key" }
    );

  if (missionWriteError) {
    console.error(logPrefix, "completed mission_progress upsert failed:", missionWriteError);
    return {
      awarded: false,
      error: missionWriteError.message,
      promotion: null
    };
  }

  writeStoredXp(nextXp);
  const missionTitle = formatEventSubject(missionKey);
  const moduleTitle = formatEventSubject(moduleSlug);

  await recordCareerEvent({
    userId: user.id,
    eventType: "mission_completed",
    title: `${missionTitle} completed`,
    description: `Completed ${missionTitle} in ${moduleTitle}.`,
    nmAmount: 0,
    moduleSlug,
    missionKey
  });
  await recordCareerEvent({
    userId: user.id,
    eventType: "nm_earned",
    title: `+${reward} NM earned`,
    description: `${missionTitle} added ${reward} Nautical Miles to your career record.`,
    nmAmount: reward,
    moduleSlug,
    missionKey
  });

  console.log(logPrefix, "mission complete and synced:", {
    userId: user.id,
    updatedCurrentXp: nextXp,
    promotion: null
  });

  return {
    awarded: true,
    error: null,
    promotion: null
  };
}
