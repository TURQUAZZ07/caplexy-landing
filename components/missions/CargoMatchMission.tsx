"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Medal,
  RotateCcw,
  Ship,
  Sparkles,
  Trophy,
  Waves
} from "lucide-react";
import { useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { completeSupabaseMission } from "@/lib/missions/completeSupabaseMission";
import type { MissionPromotion } from "@/lib/missions/completeSupabaseMission";
import { usePlayerProgress } from "@/lib/progress";

type CargoPair = {
  id: string;
  english: string;
  turkish: string;
};

type FeedbackKey = "selectPrompt" | "feedbackCorrect" | "feedbackWrong";

const cargoPairs: CargoPair[] = [
  { id: "ship", english: "ship", turkish: "gemi" },
  { id: "captain", english: "captain", turkish: "kaptan" },
  { id: "voyage", english: "voyage", turkish: "sefer" },
  { id: "crew", english: "crew", turkish: "mürettebat" },
  { id: "harbor", english: "harbor", turkish: "liman" },
  { id: "storm", english: "storm", turkish: "fırtına" }
];

const meaningOrder = ["harbor", "ship", "storm", "captain", "crew", "voyage"];
const cargoMatchReward = 25;

export function CargoMatchMission() {
  const { t } = useI18n();
  const { completeCargoMatch } = usePlayerProgress();
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedTurkish, setSelectedTurkish] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [feedbackKey, setFeedbackKey] = useState<FeedbackKey>("selectPrompt");
  const [hasAwardedXp, setHasAwardedXp] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [promotion, setPromotion] = useState<MissionPromotion | null>(null);

  const meaningCards = useMemo(
    () =>
      meaningOrder
        .map((id) => cargoPairs.find((pair) => pair.id === id))
        .filter(Boolean) as CargoPair[],
    []
  );

  const matchedCount = matchedIds.length;
  const isComplete = matchedCount === cargoPairs.length;
  const shouldShowCompletion = isComplete && removingIds.length === 0;
  const progressText = t("cargoMatch.progress")
    .replace("{matched}", String(matchedCount))
    .replace("{total}", String(cargoPairs.length));

  function selectEnglish(id: string) {
    if (matchedIds.includes(id) || removingIds.includes(id) || isComplete) {
      return;
    }

    setSelectedEnglish(id);
    setFeedbackKey("selectPrompt");

    if (selectedTurkish) {
      checkMatch(id, selectedTurkish);
    }
  }

  function selectTurkish(id: string) {
    if (matchedIds.includes(id) || removingIds.includes(id) || isComplete) {
      return;
    }

    setSelectedTurkish(id);
    setFeedbackKey("selectPrompt");

    if (selectedEnglish) {
      checkMatch(selectedEnglish, id);
    }
  }

  function checkMatch(englishId: string, turkishId: string) {
    if (englishId === turkishId) {
      const nextMatchedIds = matchedIds.includes(englishId)
        ? matchedIds
        : [...matchedIds, englishId];

      setMatchedIds(nextMatchedIds);
      setRemovingIds((current) =>
        current.includes(englishId) ? current : [...current, englishId]
      );
      setFeedbackKey("feedbackCorrect");

      window.setTimeout(() => {
        setRemovedIds((current) =>
          current.includes(englishId) ? current : [...current, englishId]
        );
        setRemovingIds((current) => current.filter((id) => id !== englishId));
      }, 360);

      if (nextMatchedIds.length === cargoPairs.length && !hasAwardedXp) {
        completeCargoMatch();
        void syncCargoMatchCompletion();
        setHasAwardedXp(true);
      }
    } else {
      setFeedbackKey("feedbackWrong");
    }

    window.setTimeout(() => {
      setSelectedEnglish(null);
      setSelectedTurkish(null);
    }, 450);
  }

  function resetMission() {
    setSelectedEnglish(null);
    setSelectedTurkish(null);
    setMatchedIds([]);
    setRemovingIds([]);
    setRemovedIds([]);
    setFeedbackKey("selectPrompt");
    setHasAwardedXp(false);
    setSyncMessage("");
    setPromotion(null);
  }

  async function syncCargoMatchCompletion() {
    setSyncMessage("Saving mission progress...");

    const result = await completeSupabaseMission({
      moduleSlug: "harbor-basics",
      missionKey: "cargo-match",
      reward: cargoMatchReward
    });

    if (result.error) {
      const isLocalFallback =
        result.error.includes("No authenticated user") ||
        result.error.includes("Supabase is not configured");

      if (!isLocalFallback) {
        console.error("[Cargo Match] Supabase sync failed:", result.error);
      }

      setSyncMessage(
        isLocalFallback
          ? "Mission completed locally. Sign in to sync NM."
          : `Supabase sync error: ${result.error}`
      );
      return;
    }

    setSyncMessage(
      result.awarded
        ? "Mission progress saved. +25 NM added to your profile."
        : "Mission progress already saved today."
    );

    if (result.promotion) {
      setPromotion(result.promotion);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f6f1] text-ink">
      <header className="bg-ink text-white">
        <div className="section-shell flex flex-wrap items-center justify-between gap-3 py-5">
          <a href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10">
              <Ship className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-wide">Caplexy</span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/18 bg-white/12 px-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("cargoMatch.nav.back")}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink pb-12 pt-6 text-white sm:pb-16">
        <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-10" />
        <div className="absolute left-1/2 top-0 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-tide/24 blur-3xl" />

        <div className="section-shell relative">
          <div className="dark-glass-panel rounded-lg p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <Waves className="h-4 w-4 text-signal" />
                  {t("cargoMatch.reward")}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {t("cargoMatch.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {t("cargoMatch.subtitle")}
                </p>
              </div>

              <div className="min-w-56 rounded-lg border border-white/12 bg-white/8 p-4">
                <p className="text-sm font-semibold text-white/70">{progressText}</p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/14">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
                    style={{ width: `${(matchedCount / cargoPairs.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        {shouldShowCompletion ? (
          <CompletionPanel onReset={resetMission} syncMessage={syncMessage} />
        ) : (
          <>
            <div className="mb-6 flex flex-col justify-between gap-3 rounded-lg border border-ink/8 bg-white p-4 shadow-soft sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-tide" />
                <p className="text-sm font-semibold text-ink">
                  {t(`cargoMatch.${feedbackKey}`)}
                </p>
              </div>
              <button
                type="button"
                onClick={resetMission}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 py-2 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" />
                {t("cargoMatch.reset")}
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <CargoColumn
                title={t("cargoMatch.englishColumn")}
                cards={cargoPairs}
                selectedId={selectedEnglish}
                matchedIds={matchedIds}
                removingIds={removingIds}
                removedIds={removedIds}
                side="english"
                onSelect={selectEnglish}
              />
              <CargoColumn
                title={t("cargoMatch.turkishColumn")}
                cards={meaningCards}
                selectedId={selectedTurkish}
                matchedIds={matchedIds}
                removingIds={removingIds}
                removedIds={removedIds}
                side="turkish"
                onSelect={selectTurkish}
              />
            </div>
          </>
        )}
      </section>
      {promotion ? (
        <PromotionModal
          promotion={promotion}
          onClose={() => setPromotion(null)}
        />
      ) : null}
    </main>
  );
}

function CargoColumn({
  title,
  cards,
  selectedId,
  matchedIds,
  removingIds,
  removedIds,
  side,
  onSelect
}: {
  title: string;
  cards: CargoPair[];
  selectedId: string | null;
  matchedIds: string[];
  removingIds: string[];
  removedIds: string[];
  side: "english" | "turkish";
  onSelect: (id: string) => void;
}) {
  const visibleCards = cards.filter((pair) => !removedIds.includes(pair.id));

  return (
    <section className="rounded-lg border border-ink/8 bg-white p-5 shadow-soft">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-5 grid gap-3">
        {visibleCards.map((pair) => {
          const isMatched = matchedIds.includes(pair.id);
          const isRemoving = removingIds.includes(pair.id);
          const isSelected = selectedId === pair.id;

          return (
            <button
              key={`${side}-${pair.id}`}
              type="button"
              disabled={isMatched}
              onClick={() => onSelect(pair.id)}
              className={`flex min-h-16 items-center justify-between rounded-lg border p-4 text-left font-semibold transition duration-300 ${
                isMatched
                  ? "border-tide bg-tide/12 text-tide"
                  : isSelected
                    ? "border-signal bg-signal/18 text-ink shadow-glow"
                    : "border-ink/8 bg-[#f7f9f4] text-ink hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white"
              } ${isRemoving ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
            >
              <span>{side === "english" ? pair.english : pair.turkish}</span>
              {isMatched ? (
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-tide text-white">
                  <Check className="h-4 w-4" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CompletionPanel({
  onReset,
  syncMessage
}: {
  onReset: () => void;
  syncMessage: string;
}) {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-ink/8 bg-white text-center shadow-soft">
      <div className="relative bg-ink p-8 text-white sm:p-10">
        <div className="absolute inset-0 bg-chart-grid bg-[size:40px_40px] opacity-10" />
        <div className="relative">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-lg bg-signal text-ink shadow-glow">
            <Trophy className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold sm:text-4xl">
            {t("cargoMatch.completedTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-white/70">
            {t("cargoMatch.completedMission")}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="mx-auto inline-flex items-center gap-3 rounded-lg bg-signal/20 px-4 py-3 text-lg font-bold text-ink">
          <Sparkles className="h-5 w-5 text-tide" />
          {t("cargoMatch.completedReward")}
        </div>
        {syncMessage ? (
          <p className="mt-4 text-sm font-semibold text-tide">{syncMessage}</p>
        ) : null}

        <div className="mt-6 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5 text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-tide text-white">
              <Medal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{t("cargoMatch.rankProgress")}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-steel">
                {t("cargoMatch.rankProgressLabel")}
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm font-bold text-steel">
              {t("cargoMatch.rankProgressBefore")}
            </span>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-white">
              <div className="h-full w-[69%] rounded-full bg-gradient-to-r from-tide via-glass to-signal" />
            </div>
            <span className="text-sm font-bold text-ink">
              {t("cargoMatch.rankProgressAfter")}
            </span>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-ink px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            {t("cargoMatch.returnDashboard")}
          </a>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/10 bg-[#f6f8f3] px-6 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
        >
          <RotateCcw className="h-4 w-4" />
          {t("cargoMatch.playAgain")}
        </button>
        <a
          href="/missions/ship-log-repair"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-tide px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
        >
          {t("cargoMatch.nextMission")} <ArrowRight className="h-4 w-4" />
        </a>
        </div>
      </div>
    </section>
  );
}

function PromotionModal({
  promotion,
  onClose
}: {
  promotion: MissionPromotion;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/72 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-lg overflow-hidden rounded-lg border border-white/14 bg-white text-center text-ink shadow-glow">
        <div className="relative bg-ink p-8 text-white">
          <div className="absolute inset-0 bg-chart-grid bg-[size:40px_40px] opacity-10" />
          <div className="relative">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-lg bg-signal text-ink shadow-glow">
              <Medal className="h-10 w-10" />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-signal">
              PROMOTION ACHIEVED
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              New Rank: {promotion.newRankName}
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-3 text-left">
            <PromotionRow label="Current NM" value={String(promotion.currentNm)} />
            <PromotionRow label="Next Rank" value={promotion.nextRankName} />
            <PromotionRow
              label="NM remaining to next promotion"
              value={String(promotion.nmRemaining)}
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-ink px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            Continue Voyage
          </button>
        </div>
      </section>
    </div>
  );
}

function PromotionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
      <span className="text-sm font-semibold text-steel">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </div>
  );
}
