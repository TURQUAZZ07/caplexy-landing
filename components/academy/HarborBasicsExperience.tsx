"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Anchor,
  BadgeCheck,
  Boxes,
  Check,
  ClipboardCheck,
  Headphones,
  Mic2,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import { recordCareerEvent } from "@/lib/career-events";
import { completeSupabaseMission } from "@/lib/missions/completeSupabaseMission";
import { readStoredXp, writeStoredXp } from "@/lib/progress";
import { getRankByXP } from "@/lib/ranks";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

type MissionId =
  | "vocabulary"
  | "listening"
  | "speaking"
  | "cargo-match"
  | "promotion-assessment";

type HarborMission = {
  id: MissionId;
  eyebrow: string;
  title: string;
  body: string;
  reward: string;
};

const missionCount = 5;
const totalHarborNm = 100;
const completionStorageKey = "caplexy.academy.harborBasics.completedMissions";
const moduleCompletionStorageKey = "caplexy.academy.harborBasics.moduleCompleted";
const academyModuleSlug = "harbor-basics";
const harborBadgeKey = "harbor-cadet";
const harborBadgeName = "Harbor Cadet";

const missionRewards: Record<MissionId, number> = {
  vocabulary: 20,
  listening: 20,
  speaking: 20,
  "cargo-match": 25,
  "promotion-assessment": 15
};

const missions: HarborMission[] = [
  {
    id: "vocabulary",
    eyebrow: "Mission 1 of 5",
    title: "Vocabulary Mission",
    body: "Inspect the first harbor words used when a new cadet reports for duty.",
    reward: "Harbor word set"
  },
  {
    id: "listening",
    eyebrow: "Mission 2 of 5",
    title: "Listening Mission",
    body: "Receive a short harbor desk transmission and identify the correct meaning.",
    reward: "Arrival call cleared"
  },
  {
    id: "speaking",
    eyebrow: "Mission 3 of 5",
    title: "Speaking Mission",
    body: "Practice a short cadet introduction before entering the training deck.",
    reward: "Introduction approved"
  },
  {
    id: "cargo-match",
    eyebrow: "Mission 4 of 5",
    title: "Cargo Match Mini Game",
    body: "Match harbor cargo labels with their correct meanings.",
    reward: "Cargo check complete"
  },
  {
    id: "promotion-assessment",
    eyebrow: "Mission 5 of 5",
    title: "Promotion Assessment",
    body: "Complete the final harbor check before earning your first academy badge.",
    reward: "Harbor Cadet Badge"
  }
];

const vocabularyTerms = [
  ["cadet", "a new trainee"],
  ["harbor", "safe place for ships"],
  ["crew", "people working on a ship"],
  ["captain", "leader of the ship"]
];

const cargoPairs = [
  { id: "ship", word: "ship", meaning: "gemi" },
  { id: "harbor", word: "harbor", meaning: "liman" },
  { id: "cadet", word: "cadet", meaning: "öğrenci denizci" }
];

const assessmentOptions = [
  "I am a cadet.",
  "I are cadet.",
  "Me cadet."
];

export function HarborBasicsExperience() {
  const [completedMissions, setCompletedMissions] = useState<MissionId[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<string | null>(null);
  const [matchedCargo, setMatchedCargo] = useState<string[]>([]);
  const [removingCargo, setRemovingCargo] = useState<string[]>([]);
  const [removedCargo, setRemovedCargo] = useState<string[]>([]);
  const [cargoFeedback, setCargoFeedback] = useState("Select a word and its meaning.");
  const [assessmentAnswer, setAssessmentAnswer] = useState<string | null>(null);
  const [promotionStatus, setPromotionStatus] = useState<
    "idle" | "saving" | "saved" | "local" | "error"
  >("idle");
  const [promotionMessage, setPromotionMessage] = useState("");
  const [promotedRankName, setPromotedRankName] = useState("");
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [savingMissionId, setSavingMissionId] = useState<MissionId | null>(null);
  const [totalNmEarned, setTotalNmEarned] = useState(0);
  const completedCount = completedMissions.length;
  const progressPercent = Math.floor((completedCount / missionCount) * 100);
  const currentMissionNumber = Math.min(completedCount + 1, missionCount);
  const isComplete = completedCount === missionCount;
  const completedSet = useMemo(
    () => new Set<MissionId>(completedMissions),
    [completedMissions]
  );

  useEffect(() => {
    setCompletedMissions(readCompletedMissions());
    setIsStorageReady(true);
    void syncCompletedMissionsFromSupabase();
  }, []);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    writeCompletedMissions(completedMissions);
  }, [completedMissions, isStorageReady]);

  useEffect(() => {
    if (!isComplete || typeof window === "undefined") {
      return;
    }

    void completeHarborBasicsModule();
  }, [isComplete]);

  async function syncCompletedMissionsFromSupabase() {
    const config = getSupabaseConfigStatus();

    if (!config.isConfigured) {
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        return;
      }

      const completedMissionIds = await Promise.all(
        missions.map(async (mission) => {
          const { data } = await supabase
            .from("mission_progress")
            .select("completed")
            .eq("user_id", user.id)
            .eq("module_slug", academyModuleSlug)
            .eq("mission_key", mission.id)
            .maybeSingle();

          return data?.completed === true ? mission.id : null;
        })
      );
      const remoteCompletedMissions = completedMissionIds.filter(
        (missionId): missionId is MissionId => missionId !== null
      );

      if (remoteCompletedMissions.length > 0) {
        setCompletedMissions((current) =>
          Array.from(new Set([...current, ...remoteCompletedMissions]))
        );
      }
    } catch (error) {
      console.error("[Harbor Basics] Could not sync mission progress:", error);
    }
  }

  async function completeHarborBasicsModule() {
    const localCurrentXp = readStoredXp();
    const config = getSupabaseConfigStatus();

    if (
      !config.isConfigured &&
      window.localStorage.getItem(moduleCompletionStorageKey) === "true"
    ) {
      if (promotionStatus === "idle") {
        setPromotionStatus("saved");
        setPromotionMessage("Harbor Basics already completed.");
      }
      setIsCompletionModalOpen(true);
      return;
    }

    setPromotionStatus("saving");

    if (!config.isConfigured) {
      window.localStorage.setItem(moduleCompletionStorageKey, "true");
      setPromotedRankName(getRankByXP(localCurrentXp).name);
      setPromotionStatus("local");
      setPromotionMessage(
        "Harbor Basics completed locally. Sign in to sync your academy record."
      );
      setIsCompletionModalOpen(true);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;

      if (userError || !user) {
        window.localStorage.setItem(moduleCompletionStorageKey, "true");
        setPromotedRankName(getRankByXP(localCurrentXp).name);
        setPromotionStatus("local");
        setPromotionMessage("Sign in to sync this academy completion to Caplexy.");
        setIsCompletionModalOpen(true);
        return;
      }

      const ensuredProfile = await ensureUserProfile();

      if (ensuredProfile.error) {
        throw new Error(ensuredProfile.error);
      }

      const { data: existingProgress, error: existingProgressError } =
        await supabase
          .from("academy_progress")
          .select("completed")
          .eq("user_id", user.id)
          .eq("module_slug", academyModuleSlug)
          .maybeSingle();

      if (existingProgressError) {
        throw new Error(existingProgressError.message);
      }

      if (existingProgress?.completed === true) {
        window.localStorage.setItem(moduleCompletionStorageKey, "true");
        setPromotedRankName(getRankByXP(localCurrentXp).name);
        setPromotionStatus("saved");
        setPromotionMessage("Harbor Basics was already completed.");
        setIsCompletionModalOpen(true);
        return;
      }

      const completedAt = new Date().toISOString();

      const { error: academyProgressError } = await supabase
        .from("academy_progress")
        .upsert(
          {
            user_id: user.id,
            module_slug: academyModuleSlug,
            progress: 100,
            completed: true,
            completed_at: completedAt
          },
          { onConflict: "user_id,module_slug" }
        );

      if (academyProgressError) {
        throw new Error(academyProgressError.message);
      }

      const { data: existingBadge, error: existingBadgeError } = await supabase
        .from("badges")
        .select("id")
        .eq("user_id", user.id)
        .eq("badge_key", harborBadgeKey)
        .maybeSingle();

      if (existingBadgeError) {
        console.warn("[Harbor Basics] Could not check existing badge:", existingBadgeError);
      }

      const { error: badgeError } = await supabase.from("badges").upsert(
        {
          user_id: user.id,
          badge_key: harborBadgeKey,
          badge_name: harborBadgeName,
          earned_at: completedAt
        },
        { onConflict: "user_id,badge_key", ignoreDuplicates: true }
      );

      if (badgeError) {
        throw new Error(badgeError.message);
      }

      await recordCareerEvent({
        userId: user.id,
        eventType: "academy_completed",
        title: "Harbor Basics completed",
        description: "Completed the full Harbor Basics academy module.",
        moduleSlug: academyModuleSlug
      });

      if (!existingBadge) {
        await recordCareerEvent({
          userId: user.id,
          eventType: "badge_unlocked",
          title: "Harbor Cadet badge unlocked",
          description: "Unlocked the Harbor Cadet badge by completing Harbor Basics.",
          moduleSlug: academyModuleSlug,
          badgeName: harborBadgeName
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("current_xp,current_rank_name")
        .eq("id", user.id)
        .maybeSingle();
      const currentNm =
        typeof profile?.current_xp === "number" ? profile.current_xp : localCurrentXp;

      writeStoredXp(currentNm);
      window.localStorage.setItem(moduleCompletionStorageKey, "true");
      setPromotedRankName(
        typeof profile?.current_rank_name === "string"
          ? profile.current_rank_name
          : getRankByXP(currentNm).name
      );
      setPromotionStatus("saved");
      setPromotionMessage("Harbor Basics progress synced to your Caplexy profile.");
      setIsCompletionModalOpen(true);
    } catch (error) {
      setPromotionStatus("error");
      setPromotionMessage(
        error instanceof Error
          ? error.message
          : "Promotion could not be saved. Please try again."
      );
    }
  }

  async function completeMission(missionId: MissionId) {
    if (completedMissions.includes(missionId) || savingMissionId) {
      return;
    }

    setSavingMissionId(missionId);
    setPromotionStatus("saving");
    setPromotionMessage("Saving mission progress...");

    const reward = missionRewards[missionId];
    const result = await completeSupabaseMission({
      moduleSlug: academyModuleSlug,
      missionKey: missionId,
      reward
    });
    const isLocalFallback =
      result.error?.includes("No authenticated user") ||
      result.error?.includes("Supabase is not configured");

    if (result.error && !isLocalFallback) {
      console.error("[Harbor Basics] Mission save failed:", result.error);
      setPromotionStatus("error");
      setPromotionMessage(result.error);
      setSavingMissionId(null);
      return;
    }

    if (isLocalFallback) {
      awardLocalMissionNm(missionId, reward);
      setTotalNmEarned((current) => current + reward);
      setPromotionStatus("local");
      setPromotionMessage("Mission completed locally. Sign in to sync NM.");
    } else {
      setPromotionStatus("saved");
      setPromotionMessage(
        result.awarded
          ? `Mission saved. +${reward} NM added.`
          : "Mission already saved. Duplicate NM prevented."
      );
      if (result.awarded) {
        setTotalNmEarned((current) => current + reward);
      }
    }

    setCompletedMissions((current) =>
      current.includes(missionId) ? current : [...current, missionId]
    );
    setSavingMissionId(null);
  }

  function resetModule() {
    setCompletedMissions([]);
    setMatchedCargo([]);
    setRemovingCargo([]);
    setRemovedCargo([]);
    setSelectedCargo(null);
    setAssessmentAnswer(null);
    setCargoFeedback("Select a word and its meaning.");
    setPromotionStatus("idle");
    setPromotionMessage("");
    setPromotedRankName("");
    setIsCompletionModalOpen(false);
    setSavingMissionId(null);
    setTotalNmEarned(0);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(completionStorageKey);
      window.localStorage.removeItem(moduleCompletionStorageKey);
      missions.forEach((mission) =>
        window.localStorage.removeItem(getLocalMissionRewardKey(mission.id))
      );
    }
  }

  function handleCargoMeaning(meaningId: string) {
    if (!selectedCargo) {
      setCargoFeedback("Choose a cargo word first.");
      return;
    }

    if (selectedCargo === meaningId) {
      const nextMatched = Array.from(new Set([...matchedCargo, meaningId]));
      setMatchedCargo(nextMatched);
      setRemovingCargo((current) =>
        current.includes(meaningId) ? current : [...current, meaningId]
      );
      setCargoFeedback("Cargo matched.");
      setSelectedCargo(null);

      window.setTimeout(() => {
        setRemovedCargo((current) =>
          current.includes(meaningId) ? current : [...current, meaningId]
        );
        setRemovingCargo((current) => current.filter((id) => id !== meaningId));
      }, 320);

      if (nextMatched.length === cargoPairs.length) {
        void completeMission("cargo-match");
      }

      return;
    }

    setCargoFeedback("Cargo label does not match. Try again.");
  }

  function handleAssessment(answer: string) {
    setAssessmentAnswer(answer);

    if (answer === assessmentOptions[0]) {
      void completeMission("promotion-assessment");
    }
  }

  return (
    <section className="grid gap-6">
      <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-tide/10 px-3 py-2 text-sm font-bold text-tide">
              <Anchor className="h-4 w-4" />
              Harbor Basics
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Training Route</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">
              Report to the harbor desk, learn your first crew words, receive your
              first transmission, and pass the promotion check.
            </p>
          </div>
          <button
            type="button"
            onClick={resetModule}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 py-3 text-sm font-bold text-ink transition hover:bg-white"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Module
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-bold text-steel">
            <span>
              {isComplete
                ? "Training complete"
                : `Mission ${currentMissionNumber} of ${missionCount}`}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#e5ece8]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {isComplete ? (
          <div className="mt-6 rounded-lg border border-tide/20 bg-tide/8 p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-tide text-white">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-ink">
                  Promotion secured
                </h3>
                <p className="mt-2 text-sm leading-6 text-steel">
                  Award earned: {harborBadgeName}. NM Reward: +{totalHarborNm} NM.
                </p>
                <div className="mt-4 grid gap-2 rounded-lg border border-white/70 bg-white/70 p-4 text-sm font-bold text-ink sm:grid-cols-3">
                  <span>Academy progress: 100%</span>
                  <span>Badge saved: Harbor Cadet</span>
                  <span>
                    Rank: {promotedRankName || getRankByXP(readStoredXp()).name}
                  </span>
                </div>
                <p
                  className={`mt-3 text-sm font-semibold ${
                    promotionStatus === "error" ? "text-coral" : "text-tide"
                  }`}
                >
                  {promotionStatus === "saving"
                    ? "Saving promotion..."
                    : promotionMessage}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </article>

      <MissionShell
        mission={missions[0]}
        Icon={Boxes}
        isComplete={completedSet.has("vocabulary")}
        onComplete={() => {
          void completeMission("vocabulary");
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {vocabularyTerms.map(([term, definition]) => (
            <div
              key={term}
              className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4"
            >
              <p className="text-lg font-semibold text-ink">{term}</p>
              <p className="mt-1 text-sm font-semibold text-steel">{definition}</p>
            </div>
          ))}
        </div>
      </MissionShell>

      <MissionShell
        mission={missions[1]}
        Icon={Headphones}
        isComplete={completedSet.has("listening")}
        onComplete={() => {
          void completeMission("listening");
        }}
      >
        <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
            Harbor transmission
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">
            "Welcome aboard, cadet. Report to the harbor desk."
          </p>
          <p className="mt-2 text-sm leading-6 text-steel">
            Dummy listening content for the first academy module. Audio controls can
            be connected here later.
          </p>
        </div>
      </MissionShell>

      <MissionShell
        mission={missions[2]}
        Icon={Mic2}
        isComplete={completedSet.has("speaking")}
        onComplete={() => {
          void completeMission("speaking");
        }}
      >
        <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
            Speaking prompt
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">
            "Hello, I am Ekrem. I am a cadet."
          </p>
          <p className="mt-2 text-sm leading-6 text-steel">
            Practice saying the line clearly before marking the speaking mission
            complete.
          </p>
        </div>
      </MissionShell>

      <MissionShell
        mission={missions[3]}
        Icon={Sparkles}
        isComplete={completedSet.has("cargo-match")}
        onComplete={() => {
          void completeMission("cargo-match");
        }}
        actionDisabled={matchedCargo.length < cargoPairs.length}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            {cargoPairs
              .filter((pair) => !removedCargo.includes(pair.id))
              .map((pair) => (
              <button
                key={pair.id}
                type="button"
                disabled={matchedCargo.includes(pair.id)}
                onClick={() => setSelectedCargo(pair.id)}
                className={`rounded-lg border p-3 text-left text-sm font-bold transition duration-300 ${
                  matchedCargo.includes(pair.id)
                    ? "border-tide bg-tide/10 text-tide"
                    : selectedCargo === pair.id
                      ? "border-signal bg-signal/18 text-ink"
                      : "border-ink/8 bg-[#f6f8f3] text-ink hover:bg-white"
                } ${
                  removingCargo.includes(pair.id)
                    ? "scale-95 opacity-0"
                    : "scale-100 opacity-100"
                }`}
              >
                {pair.word}
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            {cargoPairs
              .filter((pair) => !removedCargo.includes(pair.id))
              .map((pair) => (
              <button
                key={pair.meaning}
                type="button"
                disabled={matchedCargo.includes(pair.id)}
                onClick={() => handleCargoMeaning(pair.id)}
                className={`rounded-lg border p-3 text-left text-sm font-bold transition duration-300 ${
                  matchedCargo.includes(pair.id)
                    ? "border-tide bg-tide/10 text-tide"
                    : "border-ink/8 bg-[#f6f8f3] text-ink hover:bg-white"
                } ${
                  removingCargo.includes(pair.id)
                    ? "scale-95 opacity-0"
                    : "scale-100 opacity-100"
                }`}
              >
                {pair.meaning}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-steel">{cargoFeedback}</p>
      </MissionShell>

      <MissionShell
        mission={missions[4]}
        Icon={ClipboardCheck}
        isComplete={completedSet.has("promotion-assessment")}
        onComplete={() => {
          void completeMission("promotion-assessment");
        }}
        actionDisabled={!completedSet.has("promotion-assessment")}
      >
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-steel">
            Choose the correct harbor introduction:
          </p>
          {assessmentOptions.map((option) => {
            const isSelected = assessmentAnswer === option;
            const isCorrect = option === assessmentOptions[0];

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleAssessment(option)}
                className={`rounded-lg border p-3 text-left text-sm font-bold transition ${
                  isSelected && isCorrect
                    ? "border-tide bg-tide/10 text-tide"
                    : isSelected
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-ink/8 bg-[#f6f8f3] text-ink hover:bg-white"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </MissionShell>

      {isCompletionModalOpen ? (
        <CompletionModal
          status={promotionStatus}
          message={promotionMessage}
          rankName={promotedRankName}
          totalNmEarned={totalNmEarned || totalHarborNm}
          onClose={() => setIsCompletionModalOpen(false)}
        />
      ) : null}
    </section>
  );
}

function MissionShell({
  mission,
  Icon,
  isComplete,
  actionDisabled = false,
  onComplete,
  children
}: {
  mission: HarborMission;
  Icon: typeof Boxes;
  isComplete: boolean;
  actionDisabled?: boolean;
  onComplete: () => void;
  children: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${
              isComplete ? "bg-tide text-white" : "bg-ink text-white"
            }`}
          >
            {isComplete ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.04em] text-steel">
              {mission.eyebrow}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-ink">{mission.title}</h3>
            <p className="mt-2 text-sm leading-6 text-steel">{mission.body}</p>
            <span className="mt-3 inline-flex rounded-lg bg-signal/24 px-2.5 py-1 text-xs font-bold text-ink">
              {mission.reward}
            </span>
          </div>
        </div>
        <button
          type="button"
          disabled={isComplete || actionDisabled}
          onClick={onComplete}
          className={`inline-flex shrink-0 items-center justify-center rounded-lg px-4 py-3 text-sm font-bold ${
            isComplete
              ? "bg-tide/12 text-tide"
              : actionDisabled
                ? "border border-ink/10 bg-[#f6f8f3] text-steel"
                : "bg-tide text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          }`}
        >
          {isComplete ? "Completed" : "Mark Complete"}
        </button>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function CompletionModal({
  status,
  message,
  rankName,
  totalNmEarned,
  onClose
}: {
  status: "idle" | "saving" | "saved" | "local" | "error";
  message: string;
  rankName: string;
  totalNmEarned: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/72 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-lg overflow-hidden rounded-lg border border-white/14 bg-white text-center text-ink shadow-glow">
        <div className="relative bg-ink p-8 text-white">
          <div className="absolute inset-0 bg-chart-grid bg-[size:40px_40px] opacity-10" />
          <div className="relative">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-lg bg-signal text-ink shadow-glow">
              <BadgeCheck className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold">Harbor Basics Complete</h2>
            <p className="mt-3 text-sm font-semibold text-white/62">
              Harbor Cadet Badge Unlocked
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-3 text-left">
            <div className="rounded-lg border border-signal/30 bg-signal/18 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-steel">
                Reward
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                Total NM Earned: {totalNmEarned} NM
              </p>
            </div>
            <div className="rounded-lg border border-tide/20 bg-tide/10 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-steel">
                Badge
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                Harbor Cadet Badge Unlocked
              </p>
            </div>
            {rankName ? (
              <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-steel">
                  Current Rank
                </p>
                <p className="mt-1 text-lg font-semibold text-ink">{rankName}</p>
              </div>
            ) : null}
          </div>

          {message ? (
            <p
              className={`mt-5 text-sm font-semibold ${
                status === "error" ? "text-coral" : "text-tide"
              }`}
            >
              {message}
            </p>
          ) : null}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <a
              href="/academy"
              className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
            >
              Continue to Academy
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-ink/10 bg-[#f6f8f3] px-5 py-3 text-sm font-bold text-ink transition hover:bg-white"
            >
              Review Module
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function readCompletedMissions() {
  if (typeof window === "undefined") {
    return [] as MissionId[];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(completionStorageKey) ?? "[]"
    );

    const migratedItems = Array.isArray(parsed)
      ? parsed.map((item) =>
          item === "cargo"
            ? "cargo-match"
            : item === "assessment"
              ? "promotion-assessment"
              : item
        )
      : [];

    return migratedItems.length > 0
      ? Array.from(new Set(migratedItems)).filter((item): item is MissionId =>
          missions.some((mission) => mission.id === item)
        )
      : [];
  } catch {
    return [];
  }
}

function writeCompletedMissions(completedMissions: MissionId[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    completionStorageKey,
    JSON.stringify(completedMissions)
  );
}

function awardLocalMissionNm(missionId: MissionId, reward: number) {
  if (typeof window === "undefined") {
    return;
  }

  const rewardKey = getLocalMissionRewardKey(missionId);

  if (window.localStorage.getItem(rewardKey) === "true") {
    return;
  }

  const nextLocalNm = readStoredXp() + reward;
  writeStoredXp(nextLocalNm);
  window.localStorage.setItem(rewardKey, "true");
}

function getLocalMissionRewardKey(missionId: MissionId) {
  return `caplexy.academy.harborBasics.${missionId}.nmAwarded`;
}
