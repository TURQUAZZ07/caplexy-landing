"use client";

import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import { recordCareerEvent } from "@/lib/career-events";
import { readStoredXp, writeStoredXp } from "@/lib/progress";
import {
  allMicroRanks,
  getRankByXP,
  TOTAL_MICRO_RANKS
} from "@/lib/ranks";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

const passingScore = 80;
const retryCooldownMinutes = 5;

export type PromotionAssessmentStatus = {
  isAuthenticated: boolean;
  isReady: boolean;
  isMaxRank: boolean;
  currentNm: number;
  currentRankIndex: number;
  targetRankIndex: number;
  currentRankName: string;
  targetRankName: string;
  requiredNm: number;
  nmRemaining: number;
  passingScore: number;
  latestScore: number | null;
  latestPassed: boolean | null;
  cooldownUntil: string | null;
  cooldownSeconds: number;
  error: string | null;
};

export type PromotionAssessmentResult = {
  saved: boolean;
  passed: boolean;
  score: number;
  status: PromotionAssessmentStatus;
  error: string | null;
};

type AttemptRow = {
  score?: unknown;
  passed?: unknown;
  created_at?: unknown;
};

export async function getPromotionAssessmentStatus(): Promise<PromotionAssessmentStatus> {
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    return getLocalStatus(config.message);
  }

  try {
    const supabase = getSupabaseClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (sessionError || !user) {
      return getLocalStatus(
        sessionError?.message ?? "Sign in to unlock promotion assessment."
      );
    }

    const ensuredProfile = await ensureUserProfile();

    if (ensuredProfile.error) {
      return getLocalStatus(ensuredProfile.error);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("current_xp,current_rank,current_rank_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return getLocalStatus(profileError?.message ?? "Profile row was not found.");
    }

    const currentNm = getNumberValue(profile, "current_xp");
    const storedRankIndex = getNumberValue(profile, "current_rank");
    const currentRankIndex = clampRankIndex(
      storedRankIndex || getRankByXP(currentNm).index
    );
    const currentRank = allMicroRanks[currentRankIndex - 1];
    const targetRankIndex = Math.min(TOTAL_MICRO_RANKS, currentRankIndex + 1);
    const targetRank = allMicroRanks[targetRankIndex - 1];
    const { attempt, error: attemptError } = await getLatestAttempt(
      user.id,
      currentRankIndex,
      targetRankIndex
    );
    const cooldown = getCooldown(attempt);
    const requiredNm = targetRank.xpRequired;
    const nmRemaining = Math.max(0, requiredNm - currentNm);
    const isMaxRank = currentRankIndex >= TOTAL_MICRO_RANKS;

    return {
      isAuthenticated: true,
      isReady: !isMaxRank && currentNm >= requiredNm && cooldown.seconds <= 0,
      isMaxRank,
      currentNm,
      currentRankIndex,
      targetRankIndex,
      currentRankName:
        typeof profile.current_rank_name === "string" && profile.current_rank_name
          ? profile.current_rank_name
          : currentRank.name,
      targetRankName: targetRank.name,
      requiredNm,
      nmRemaining,
      passingScore,
      latestScore: getAttemptScore(attempt),
      latestPassed: getAttemptPassed(attempt),
      cooldownUntil: cooldown.until,
      cooldownSeconds: cooldown.seconds,
      error: attemptError
    };
  } catch (error) {
    return getLocalStatus(
      error instanceof Error
        ? error.message
        : "Promotion assessment could not be loaded."
    );
  }
}

export async function submitPromotionAssessment(
  score: number
): Promise<PromotionAssessmentResult> {
  const status = await getPromotionAssessmentStatus();

  if (!status.isAuthenticated) {
    return {
      saved: false,
      passed: false,
      score,
      status,
      error: status.error ?? "Sign in to submit promotion assessment."
    };
  }

  if (status.cooldownSeconds > 0) {
    return {
      saved: false,
      passed: false,
      score,
      status,
      error: "Promotion assessment is cooling down. Try again shortly."
    };
  }

  if (!status.isReady) {
    return {
      saved: false,
      passed: false,
      score,
      status,
      error: "NM requirement has not been met yet."
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (sessionError || !user) {
      return {
        saved: false,
        passed: false,
        score,
        status,
        error: sessionError?.message ?? "No authenticated user found."
      };
    }

    const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
    const passed = normalizedScore >= passingScore;
    const { error: insertError } = await supabase
      .from("promotion_attempts")
      .insert({
        user_id: user.id,
        current_rank: status.currentRankIndex,
        target_rank: status.targetRankIndex,
        score: normalizedScore,
        passed
      });

    if (insertError) {
      return {
        saved: false,
        passed: false,
        score: normalizedScore,
        status,
        error: insertError.message
      };
    }

    if (passed) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          current_rank: status.targetRankIndex,
          current_rank_name: status.targetRankName
        })
        .eq("id", user.id);

      if (profileError) {
        return {
          saved: false,
          passed: true,
          score: normalizedScore,
          status,
          error: profileError.message
        };
      }

      writeStoredXp(status.currentNm);

      await recordCareerEvent({
        userId: user.id,
        eventType: "rank_promoted",
        title: "Promotion granted",
        description: `Passed the promotion assessment and advanced to ${status.targetRankName}.`,
        rankName: status.targetRankName
      });
    }

    const nextStatus = await getPromotionAssessmentStatus();

    return {
      saved: true,
      passed,
      score: normalizedScore,
      status: nextStatus,
      error: null
    };
  } catch (error) {
    return {
      saved: false,
      passed: false,
      score,
      status,
      error:
        error instanceof Error
          ? error.message
          : "Promotion assessment could not be submitted."
    };
  }
}

async function getLatestAttempt(
  userId: string,
  currentRankIndex: number,
  targetRankIndex: number
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("promotion_attempts")
      .select("score,passed,created_at")
      .eq("user_id", userId)
      .eq("current_rank", currentRankIndex)
      .eq("target_rank", targetRankIndex)
      .order("created_at", { ascending: false })
      .limit(1);

    return {
      attempt: Array.isArray(data) ? (data[0] as AttemptRow | undefined) : undefined,
      error: error?.message ?? null
    };
  } catch (error) {
    return {
      attempt: undefined,
      error:
        error instanceof Error
          ? error.message
          : "Could not load promotion attempts."
    };
  }
}

function getLocalStatus(error: string | null): PromotionAssessmentStatus {
  const currentNm = readStoredXp();
  const currentRank = getRankByXP(currentNm);
  const targetRankIndex = Math.min(TOTAL_MICRO_RANKS, currentRank.index + 1);
  const targetRank = allMicroRanks[targetRankIndex - 1];
  const requiredNm = targetRank.xpRequired;

  return {
    isAuthenticated: false,
    isReady: false,
    isMaxRank: currentRank.index >= TOTAL_MICRO_RANKS,
    currentNm,
    currentRankIndex: currentRank.index,
    targetRankIndex,
    currentRankName: currentRank.name,
    targetRankName: targetRank.name,
    requiredNm,
    nmRemaining: Math.max(0, requiredNm - currentNm),
    passingScore,
    latestScore: null,
    latestPassed: null,
    cooldownUntil: null,
    cooldownSeconds: 0,
    error
  };
}

function getCooldown(attempt: AttemptRow | undefined) {
  const passed = getAttemptPassed(attempt);

  if (!attempt || passed !== false) {
    return {
      until: null,
      seconds: 0
    };
  }

  const createdAt =
    typeof attempt.created_at === "string" ? new Date(attempt.created_at) : null;

  if (!createdAt || Number.isNaN(createdAt.getTime())) {
    return {
      until: null,
      seconds: 0
    };
  }

  const until = new Date(
    createdAt.getTime() + retryCooldownMinutes * 60 * 1000
  );
  const seconds = Math.max(
    0,
    Math.ceil((until.getTime() - Date.now()) / 1000)
  );

  return {
    until: seconds > 0 ? until.toISOString() : null,
    seconds
  };
}

function getAttemptScore(attempt: AttemptRow | undefined) {
  return typeof attempt?.score === "number" ? attempt.score : null;
}

function getAttemptPassed(attempt: AttemptRow | undefined) {
  return typeof attempt?.passed === "boolean" ? attempt.passed : null;
}

function getNumberValue(row: unknown, key: string) {
  if (!row || typeof row !== "object") {
    return 0;
  }

  const value = (row as Record<string, unknown>)[key];

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function clampRankIndex(value: number) {
  return Math.min(TOTAL_MICRO_RANKS, Math.max(1, Math.floor(value)));
}
