"use client";

import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import { recordCareerEvent } from "@/lib/career-events";
import { writeStoredXp } from "@/lib/progress";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

export const dailyVoyageRewardNm = 50;
const dailyVoyageTaskCount = 3;
const localFlashcardPrefix = "caplexy.dailyVoyage.flashcards.";

type DailyVoyageRow = {
  id: string;
  user_id: string;
  voyage_date: string;
  mission_completed: boolean;
  nm_target_reached: boolean;
  flashcard_target_reached: boolean;
  reward_claimed: boolean;
  created_at: string;
};

export type DailyVoyageStatus = {
  id: string | null;
  voyageDate: string;
  missionCompleted: boolean;
  nmTargetReached: boolean;
  flashcardTargetReached: boolean;
  rewardClaimed: boolean;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  rewardNm: number;
  currentNm: number;
  isComplete: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

export type ClaimDailyVoyageRewardResult = {
  claimed: boolean;
  status: DailyVoyageStatus;
  error: string | null;
};

export function getTodayVoyageDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

export function getNextVoyageCountdown() {
  const now = new Date();
  const nextVoyage = new Date(now);
  nextVoyage.setHours(24, 0, 0, 0);
  const totalSeconds = Math.max(
    0,
    Math.floor((nextVoyage.getTime() - now.getTime()) / 1000)
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalSeconds,
    label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  };
}

export async function getDailyVoyageStatus() {
  const voyageDate = getTodayVoyageDate();
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    return getLocalDailyVoyageStatus(config.message);
  }

  try {
    const supabase = getSupabaseClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (sessionError || !user) {
      return getLocalDailyVoyageStatus(
        sessionError?.message ?? "Sign in to sync today's voyage."
      );
    }

    const ensuredProfile = await ensureUserProfile();

    if (ensuredProfile.error) {
      return getLocalDailyVoyageStatus(ensuredProfile.error);
    }

    const [rowResult, taskSignals, profileResult] = await Promise.all([
      ensureDailyVoyageRow(user.id, voyageDate),
      getTodayTaskSignals(user.id, voyageDate),
      supabase
        .from("profiles")
        .select("current_xp")
        .eq("id", user.id)
        .maybeSingle()
    ]);

    if (rowResult.error || !rowResult.row) {
      return getLocalDailyVoyageStatus(
        rowResult.error ?? "Daily Voyage could not be loaded."
      );
    }

    let row = rowResult.row;
    const nextFlags = {
      mission_completed: row.mission_completed || taskSignals.missionCompleted,
      nm_target_reached: row.nm_target_reached || taskSignals.nmTargetReached,
      flashcard_target_reached: row.flashcard_target_reached
    };
    const shouldUpdateFlags =
      nextFlags.mission_completed !== row.mission_completed ||
      nextFlags.nm_target_reached !== row.nm_target_reached ||
      nextFlags.flashcard_target_reached !== row.flashcard_target_reached;

    if (shouldUpdateFlags) {
      const { error: updateError } = await supabase
        .from("daily_voyages")
        .update(nextFlags)
        .eq("id", row.id);

      if (updateError) {
        return buildDailyVoyageStatus(row, {
          currentNm: getCurrentNm(profileResult.data),
          isAuthenticated: true,
          error: updateError.message
        });
      }

      const refreshedRow = await getDailyVoyageRow(user.id, voyageDate);

      if (refreshedRow.row) {
        row = refreshedRow.row;
      }
    }

    return buildDailyVoyageStatus(row, {
      currentNm: getCurrentNm(profileResult.data),
      isAuthenticated: true,
      error: profileResult.error?.message ?? taskSignals.error
    });
  } catch (error) {
    return getLocalDailyVoyageStatus(
      error instanceof Error ? error.message : "Daily Voyage could not be loaded."
    );
  }
}

export async function markFlashcardTargetReached() {
  const voyageDate = getTodayVoyageDate();
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    writeLocalFlashcardTarget(voyageDate);
    return getLocalDailyVoyageStatus(config.message);
  }

  try {
    const supabase = getSupabaseClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (sessionError || !user) {
      writeLocalFlashcardTarget(voyageDate);
      return getLocalDailyVoyageStatus(
        sessionError?.message ?? "Sign in to sync today's voyage."
      );
    }

    const rowResult = await ensureDailyVoyageRow(user.id, voyageDate);

    if (rowResult.error || !rowResult.row) {
      return getLocalDailyVoyageStatus(
        rowResult.error ?? "Daily Voyage could not be loaded."
      );
    }

    const { error } = await supabase
      .from("daily_voyages")
      .update({ flashcard_target_reached: true })
      .eq("id", rowResult.row.id);

    if (error) {
      return buildDailyVoyageStatus(rowResult.row, {
        currentNm: 0,
        isAuthenticated: true,
        error: error.message
      });
    }

    return getDailyVoyageStatus();
  } catch (error) {
    writeLocalFlashcardTarget(voyageDate);
    return getLocalDailyVoyageStatus(
      error instanceof Error ? error.message : "Daily Voyage could not be updated."
    );
  }
}

export async function claimDailyVoyageReward(): Promise<ClaimDailyVoyageRewardResult> {
  const status = await getDailyVoyageStatus();

  if (!status.isAuthenticated || !status.id) {
    return {
      claimed: false,
      status,
      error: status.error ?? "Sign in to claim the Daily Voyage reward."
    };
  }

  if (!status.isComplete) {
    return {
      claimed: false,
      status,
      error: "Complete all Daily Voyage tasks before claiming the reward."
    };
  }

  if (status.rewardClaimed) {
    return {
      claimed: false,
      status,
      error: null
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (sessionError || !user) {
      return {
        claimed: false,
        status,
        error: sessionError?.message ?? "No authenticated user found."
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("current_xp")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        claimed: false,
        status,
        error: profileError?.message ?? "Profile row was not found."
      };
    }

    const currentNm = getCurrentNm(profile);
    const nextNm = currentNm + dailyVoyageRewardNm;

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        current_xp: nextNm
      })
      .eq("id", user.id);

    if (profileUpdateError) {
      return {
        claimed: false,
        status,
        error: profileUpdateError.message
      };
    }

    const { error: voyageUpdateError } = await supabase
      .from("daily_voyages")
      .update({ reward_claimed: true })
      .eq("id", status.id);

    if (voyageUpdateError) {
      return {
        claimed: false,
        status,
        error: voyageUpdateError.message
      };
    }

    writeStoredXp(nextNm);

    await recordCareerEvent({
      userId: user.id,
      eventType: "mission_completed",
      title: "Daily Voyage completed",
      description: "Completed today's voyage operation.",
      nmAmount: 0,
      moduleSlug: "daily-voyage",
      missionKey: "daily-voyage"
    });
    await recordCareerEvent({
      userId: user.id,
      eventType: "nm_earned",
      title: `+${dailyVoyageRewardNm} NM Daily Voyage bonus`,
      description: "Daily Voyage completion bonus added to your career record.",
      nmAmount: dailyVoyageRewardNm,
      moduleSlug: "daily-voyage",
      missionKey: "daily-voyage"
    });

    const nextStatus = await getDailyVoyageStatus();

    return {
      claimed: true,
      status: nextStatus,
      error: null
    };
  } catch (error) {
    return {
      claimed: false,
      status,
      error:
        error instanceof Error ? error.message : "Daily Voyage reward could not be claimed."
    };
  }
}

async function ensureDailyVoyageRow(userId: string, voyageDate: string) {
  const supabase = getSupabaseClient();
  const { row: existingRow, error: readError } = await getDailyVoyageRow(
    userId,
    voyageDate
  );

  if (readError) {
    return {
      row: null,
      error: readError
    };
  }

  if (existingRow) {
    return {
      row: existingRow,
      error: null
    };
  }

  const { error: insertError } = await supabase
    .from("daily_voyages")
    .insert({
      user_id: userId,
      voyage_date: voyageDate
    });

  if (insertError) {
    return {
      row: null,
      error: insertError.message
    };
  }

  const insertedRow = await getDailyVoyageRow(userId, voyageDate);

  if (!insertedRow.row) {
    return {
      row: null,
      error: insertedRow.error ?? "Daily Voyage row could not be created."
    };
  }

  return {
    row: insertedRow.row,
    error: null
  };
}

async function getDailyVoyageRow(userId: string, voyageDate: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_voyages")
    .select(
      "id,user_id,voyage_date,mission_completed,nm_target_reached,flashcard_target_reached,reward_claimed,created_at"
    )
    .eq("user_id", userId)
    .eq("voyage_date", voyageDate)
    .maybeSingle();

  return {
    row: data ? toDailyVoyageRow(data) : null,
    error: error?.message ?? null
  };
}

async function getTodayTaskSignals(userId: string, voyageDate: string) {
  const supabase = getSupabaseClient();
  const start = new Date(`${voyageDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const { data, error } = await supabase
    .from("mission_progress")
    .select("completed,xp_earned,completed_at")
    .eq("user_id", userId);

  const rows = (Array.isArray(data) ? data : []).filter((row) => {
    const value = row as Record<string, unknown>;
    const completedAt =
      typeof value.completed_at === "string" ? value.completed_at : "";
    const completedTime = completedAt ? new Date(completedAt).getTime() : 0;

    return (
      value.completed === true &&
      completedTime >= start.getTime() &&
      completedTime < end.getTime()
    );
  });
  const nmEarnedToday = rows.reduce((total, row) => {
    const amount = Number((row as Record<string, unknown>).xp_earned ?? 0);

    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return {
    missionCompleted: rows.length > 0,
    nmTargetReached: nmEarnedToday >= 25,
    error: error?.message ?? null
  };
}

function buildDailyVoyageStatus(
  row: DailyVoyageRow,
  options: { currentNm: number; isAuthenticated: boolean; error: string | null }
): DailyVoyageStatus {
  const completedCount = [
    row.mission_completed,
    row.nm_target_reached,
    row.flashcard_target_reached
  ].filter(Boolean).length;

  return {
    id: row.id,
    voyageDate: row.voyage_date,
    missionCompleted: row.mission_completed,
    nmTargetReached: row.nm_target_reached,
    flashcardTargetReached: row.flashcard_target_reached,
    rewardClaimed: row.reward_claimed,
    completedCount,
    totalCount: dailyVoyageTaskCount,
    progressPercent: Math.floor((completedCount / dailyVoyageTaskCount) * 100),
    rewardNm: dailyVoyageRewardNm,
    currentNm: options.currentNm,
    isComplete: completedCount === dailyVoyageTaskCount,
    isAuthenticated: options.isAuthenticated,
    error: options.error
  };
}

function getLocalDailyVoyageStatus(error: string | null): DailyVoyageStatus {
  const voyageDate = getTodayVoyageDate();
  const flashcardTargetReached = readLocalFlashcardTarget(voyageDate);
  const missionCompleted = false;
  const nmTargetReached = false;
  const row = {
    id: null,
    voyage_date: voyageDate,
    mission_completed: missionCompleted,
    nm_target_reached: nmTargetReached,
    flashcard_target_reached: flashcardTargetReached,
    reward_claimed: false
  };
  const completedCount = [
    row.mission_completed,
    row.nm_target_reached,
    row.flashcard_target_reached
  ].filter(Boolean).length;

  return {
    id: null,
    voyageDate,
    missionCompleted: row.mission_completed,
    nmTargetReached: row.nm_target_reached,
    flashcardTargetReached: row.flashcard_target_reached,
    rewardClaimed: row.reward_claimed,
    completedCount,
    totalCount: dailyVoyageTaskCount,
    progressPercent: Math.floor((completedCount / dailyVoyageTaskCount) * 100),
    rewardNm: dailyVoyageRewardNm,
    currentNm: 0,
    isComplete: completedCount === dailyVoyageTaskCount,
    isAuthenticated: false,
    error
  };
}

function getCurrentNm(profile: unknown) {
  const currentXp =
    profile && typeof profile === "object"
      ? (profile as Record<string, unknown>).current_xp
      : 0;

  return typeof currentXp === "number" && Number.isFinite(currentXp)
    ? currentXp
    : 0;
}

function toDailyVoyageRow(row: unknown): DailyVoyageRow {
  const value = (row ?? {}) as Record<string, unknown>;

  return {
    id: String(value.id ?? ""),
    user_id: String(value.user_id ?? ""),
    voyage_date: String(value.voyage_date ?? getTodayVoyageDate()),
    mission_completed: value.mission_completed === true,
    nm_target_reached: value.nm_target_reached === true,
    flashcard_target_reached: value.flashcard_target_reached === true,
    reward_claimed: value.reward_claimed === true,
    created_at: String(value.created_at ?? "")
  };
}

function readLocalFlashcardTarget(voyageDate: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(`${localFlashcardPrefix}${voyageDate}`) === "true";
}

function writeLocalFlashcardTarget(voyageDate: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${localFlashcardPrefix}${voyageDate}`, "true");
}
