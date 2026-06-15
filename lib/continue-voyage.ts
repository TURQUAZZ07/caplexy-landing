"use client";

import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import {
  academyModules,
  getAcademyModuleProgress,
  type AcademyModule
} from "@/lib/academy";
import { getDailyVoyageStatus } from "@/lib/daily-voyage";
import { getPromotionAssessmentStatus } from "@/lib/promotion-assessment";
import { getRankIndex } from "@/lib/ranks";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

type HarborMissionKey =
  | "vocabulary"
  | "listening"
  | "speaking"
  | "cargo-match"
  | "promotion-assessment";

type HarborMissionAssignment = {
  key: HarborMissionKey;
  title: string;
  step: string;
  estimatedMinutes: number;
};

export type ContinueVoyageAssignment = {
  kind:
    | "incomplete-mission"
    | "incomplete-academy"
    | "daily-voyage"
    | "next-module"
    | "promotion-assessment";
  moduleTitle: string;
  missionTitle: string;
  stepLabel: string;
  progressPercent: number;
  estimatedMinutes: number;
  href: string;
  buttonLabel: string;
  body: string;
  isAuthenticated: boolean;
  error: string | null;
};

const harborBasicsSlug = "harbor-basics";
const harborMissionPlan: HarborMissionAssignment[] = [
  {
    key: "vocabulary",
    title: "Vocabulary Mission",
    step: "Mission 1 of 5",
    estimatedMinutes: 3
  },
  {
    key: "listening",
    title: "Listening Mission",
    step: "Mission 2 of 5",
    estimatedMinutes: 3
  },
  {
    key: "speaking",
    title: "Speaking Mission",
    step: "Mission 3 of 5",
    estimatedMinutes: 4
  },
  {
    key: "cargo-match",
    title: "Cargo Match Mini Game",
    step: "Mission 4 of 5",
    estimatedMinutes: 4
  },
  {
    key: "promotion-assessment",
    title: "Promotion Assessment",
    step: "Mission 5 of 5",
    estimatedMinutes: 3
  }
];

export async function getContinueVoyageAssignment() {
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    return getFallbackAssignment(config.message);
  }

  try {
    const supabase = getSupabaseClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (sessionError || !user) {
      return getFallbackAssignment(
        sessionError?.message ?? "Sign in to sync your next assignment."
      );
    }

    const ensuredProfile = await ensureUserProfile();

    if (ensuredProfile.error) {
      return getFallbackAssignment(ensuredProfile.error);
    }

    const [{ data: profile }, { data: academyRows }, { data: missionRows }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("current_xp,current_rank")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("academy_progress")
          .select("module_slug,progress,completed")
          .eq("user_id", user.id),
        supabase
          .from("mission_progress")
          .select("module_slug,mission_key,completed")
          .eq("user_id", user.id)
      ]);
    const currentNm = getNumberValue(profile, "current_xp");
    const currentRank =
      getNumberValue(profile, "current_rank") || getRankIndex(currentNm);
    const promotionStatus = await getPromotionAssessmentStatus();

    if (promotionStatus.isReady) {
      return {
        kind: "promotion-assessment",
        moduleTitle: `${promotionStatus.currentRankName} -> ${promotionStatus.targetRankName}`,
        missionTitle: "Promotion Assessment Ready",
        stepLabel: "Promotion Assessment",
        progressPercent: 100,
        estimatedMinutes: 5,
        href: "/promotion-assessment",
        buttonLabel: "Start Assessment",
        body: "NM requirement met. Pass the official maritime assessment to receive your next rank.",
        isAuthenticated: true,
        error: null
      } satisfies ContinueVoyageAssignment;
    }

    const academyProgress = toAcademyProgressMap(academyRows);
    const completedMissionKeys = toCompletedMissionKeys(missionRows);
    const unlockedModules = academyModules.filter(
      (academyModule) => currentRank >= academyModule.unlockRank
    );
    const currentModule =
      unlockedModules.find(
        (academyModule) => academyProgress.get(academyModule.slug)?.completed !== true
      ) ??
      unlockedModules[unlockedModules.length - 1] ??
      academyModules[0];

    if (currentModule.slug === harborBasicsSlug) {
      const harborAssignment = buildHarborBasicsAssignment(completedMissionKeys);

      if (harborAssignment) {
        return harborAssignment;
      }
    }

    const currentModuleProgress = academyProgress.get(currentModule.slug);

    if (currentModuleProgress?.completed !== true) {
      return buildAcademyAssignment(
        currentModule,
        currentModuleProgress?.progress ??
          getAcademyModuleProgress(currentModule, currentRank)
      );
    }

    const dailyVoyageStatus = await getDailyVoyageStatus();

    if (!dailyVoyageStatus.isComplete || !dailyVoyageStatus.rewardClaimed) {
      return {
        kind: "daily-voyage",
        moduleTitle: "Daily Voyage",
        missionTitle: getDailyVoyageMissionTitle(dailyVoyageStatus),
        stepLabel: "Next Assignment",
        progressPercent: dailyVoyageStatus.progressPercent,
        estimatedMinutes: 3,
        href: "/daily-voyage",
        buttonLabel: "Continue",
        body: "Clear today’s operating checks to keep your voyage active.",
        isAuthenticated: dailyVoyageStatus.isAuthenticated,
        error: dailyVoyageStatus.error
      } satisfies ContinueVoyageAssignment;
    }

    const nextUnlockedModule = unlockedModules.find(
      (academyModule) => academyProgress.get(academyModule.slug)?.completed !== true
    );
    const nextModule =
      nextUnlockedModule ??
      academyModules.find((academyModule) => academyModule.unlockRank > currentRank) ??
      currentModule;

    return {
      kind: "next-module",
      moduleTitle: formatModuleTitle(nextModule),
      missionTitle: "Resume Training",
      stepLabel: `Unlock Rank ${nextModule.unlockRank}`,
      progressPercent:
        nextModule.unlockRank > currentRank ? 0 : getAcademyModuleProgress(nextModule, currentRank),
      estimatedMinutes: 5,
      href: `/academy/${nextModule.slug}`,
      buttonLabel: "Resume Training",
      body: "Open the next academy assignment in your maritime career path.",
      isAuthenticated: true,
      error: null
    } satisfies ContinueVoyageAssignment;
  } catch (error) {
    return getFallbackAssignment(
      error instanceof Error
        ? error.message
        : "Could not load your next assignment."
    );
  }
}

function buildHarborBasicsAssignment(
  completedMissionKeys: Set<string>
): ContinueVoyageAssignment | null {
  const completedCount = harborMissionPlan.filter((mission) =>
    completedMissionKeys.has(mission.key)
  ).length;
  const trainingComplete = harborMissionPlan
    .filter((mission) => mission.key !== "promotion-assessment")
    .every((mission) => completedMissionKeys.has(mission.key));
  const assessmentComplete = completedMissionKeys.has("promotion-assessment");

  if (trainingComplete && !assessmentComplete) {
    return {
      kind: "promotion-assessment",
      moduleTitle: "Harbor Basics",
      missionTitle: "Ready for Promotion Assessment",
      stepLabel: "Promotion Assessment",
      progressPercent: 80,
      estimatedMinutes: 3,
      href: "/academy/harbor-basics",
      buttonLabel: "Start Assessment",
      body: "Your harbor training checks are complete. Start the assessment to earn promotion clearance.",
      isAuthenticated: true,
      error: null
    };
  }

  if (assessmentComplete) {
    return null;
  }

  const nextMission =
    harborMissionPlan.find((mission) => !completedMissionKeys.has(mission.key)) ??
    harborMissionPlan[0];

  return {
    kind: "incomplete-mission",
    moduleTitle: "Harbor Basics",
    missionTitle: nextMission.title,
    stepLabel: nextMission.step,
    progressPercent: Math.floor((completedCount / harborMissionPlan.length) * 100),
    estimatedMinutes: nextMission.estimatedMinutes,
    href: "/academy/harbor-basics",
    buttonLabel: "Continue",
    body: "Resume the next Harbor Basics mission and keep your academy voyage moving.",
    isAuthenticated: true,
    error: null
  };
}

function buildAcademyAssignment(
  academyModule: AcademyModule,
  progressPercent: number
): ContinueVoyageAssignment {
  return {
    kind: "incomplete-academy",
    moduleTitle: formatModuleTitle(academyModule),
    missionTitle: "Resume Training",
    stepLabel: "Academy Lesson",
    progressPercent: Math.min(99, Math.max(0, progressPercent)),
    estimatedMinutes: 5,
    href: `/academy/${academyModule.slug}`,
    buttonLabel: "Resume Training",
    body: "Continue your current Ship Academy module before returning to the mission deck.",
    isAuthenticated: true,
    error: null
  };
}

function getFallbackAssignment(error: string | null): ContinueVoyageAssignment {
  return {
    kind: "incomplete-mission",
    moduleTitle: "Harbor Basics",
    missionTitle: "Vocabulary Mission",
    stepLabel: "Mission 1 of 5",
    progressPercent: 0,
    estimatedMinutes: 3,
    href: "/academy/harbor-basics",
    buttonLabel: "Continue",
    body: "Sign in to sync your next assignment. Harbor Basics is ready to continue locally.",
    isAuthenticated: false,
    error
  };
}

function getDailyVoyageMissionTitle(status: {
  missionCompleted: boolean;
  nmTargetReached: boolean;
  flashcardTargetReached: boolean;
  isComplete: boolean;
}) {
  if (!status.missionCompleted) {
    return "Complete 1 mission";
  }

  if (!status.nmTargetReached) {
    return "Earn 25 NM";
  }

  if (!status.flashcardTargetReached) {
    return "Study 10 flashcards";
  }

  return status.isComplete ? "Claim Daily Voyage Reward" : "Continue Daily Voyage";
}

function toAcademyProgressMap(rows: unknown) {
  const map = new Map<string, { progress: number; completed: boolean }>();

  if (!Array.isArray(rows)) {
    return map;
  }

  rows.forEach((row) => {
    const value = row as Record<string, unknown>;
    const moduleSlug =
      typeof value.module_slug === "string" ? value.module_slug : "";

    if (!moduleSlug) {
      return;
    }

    map.set(moduleSlug, {
      progress: getNumberValue(value, "progress"),
      completed: value.completed === true
    });
  });

  return map;
}

function toCompletedMissionKeys(rows: unknown) {
  const set = new Set<string>();

  if (!Array.isArray(rows)) {
    return set;
  }

  rows.forEach((row) => {
    const value = row as Record<string, unknown>;
    const missionKey =
      typeof value.mission_key === "string" ? value.mission_key : "";

    if (value.completed === true && missionKey) {
      set.add(missionKey);
    }
  });

  return set;
}

function getNumberValue(row: unknown, key: string) {
  if (!row || typeof row !== "object") {
    return 0;
  }

  const value = (row as Record<string, unknown>)[key];

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatModuleTitle(academyModule: AcademyModule) {
  return academyModule.slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
