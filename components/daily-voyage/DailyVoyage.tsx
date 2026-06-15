"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Lock,
  Medal,
  Radio,
  RotateCw,
  Ship,
  Sparkles,
  Trophy
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
  claimDailyVoyageReward,
  dailyVoyageRewardNm,
  getDailyVoyageStatus,
  getNextVoyageCountdown,
  markFlashcardTargetReached,
  type DailyVoyageStatus
} from "@/lib/daily-voyage";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";

const copy = {
  en: {
    backDashboard: "Dashboard",
    eyebrow: "Daily operations",
    title: "Today's Voyage",
    subtitle:
      "Complete your daily operating checks, claim the voyage bonus, and return tomorrow for a new route.",
    progress: "Voyage progress",
    reward: "+50 Bonus NM",
    countdown: "Next voyage in",
    currentNm: "Current NM",
    currentRank: "Current Rank",
    nextRank: "Next Rank",
    taskDeck: "Today’s task deck",
    taskDeckBody:
      "Finish all three checks to clear the bridge for today’s voyage reward.",
    completeMission: "Complete 1 mission",
    completeMissionBody: "Finish any playable mission from the mission deck.",
    earnNm: "Earn 25 NM",
    earnNmBody: "Gain at least 25 Nautical Miles from mission work today.",
    studyFlashcards: "Study 10 flashcards",
    studyFlashcardsBody: "Review 10 vocabulary cargo cards for quick recall.",
    completed: "Completed",
    pending: "Pending",
    openMission: "Open Mission",
    markStudied: "Mark Studied",
    rewardLocked: "Reward locked",
    rewardReady: "Reward ready",
    rewardClaimed: "Reward claimed",
    claimReward: "Claim +50 NM",
    claimHint: "Complete all checks to unlock the Daily Voyage bonus.",
    synced: "Synced with Supabase",
    localFallback: "Sign in to sync this voyage with Supabase.",
    routeOptions: "Mission options",
    celebrationTitle: "Voyage Complete",
    celebrationBody: "+50 Bonus NM added to your career record.",
    celebrationButton: "Continue Career",
    close: "Close",
    loading: "Preparing today's voyage..."
  },
  tr: {
    backDashboard: "Dashboard",
    eyebrow: "Gunluk operasyon",
    title: "Bugunun Seferi",
    subtitle:
      "Gunluk operasyon kontrollerini tamamla, sefer bonusunu al ve yarin yeni rota icin geri don.",
    progress: "Sefer ilerlemesi",
    reward: "+50 Bonus NM",
    countdown: "Sonraki sefere kalan",
    currentNm: "Mevcut NM",
    currentRank: "Mevcut Rutbe",
    nextRank: "Sonraki Rutbe",
    taskDeck: "Bugunun gorev guvertesi",
    taskDeckBody:
      "Bugunun sefer odulunu almak icin uc kopru kontrolunu de tamamla.",
    completeMission: "1 gorev tamamla",
    completeMissionBody: "Gorev guvertesinden herhangi bir oynanabilir gorevi bitir.",
    earnNm: "25 NM kazan",
    earnNmBody: "Bugun gorevlerden en az 25 Nautical Miles kazan.",
    studyFlashcards: "10 flashcard calis",
    studyFlashcardsBody: "Hizli hatirlama icin 10 kelime kargo kartini tekrar et.",
    completed: "Tamamlandi",
    pending: "Bekliyor",
    openMission: "Gorevi Ac",
    markStudied: "Calisildi Isaretle",
    rewardLocked: "Odul kilitli",
    rewardReady: "Odul hazir",
    rewardClaimed: "Odul alindi",
    claimReward: "+50 NM Al",
    claimHint: "Gunluk Sefer bonusunu acmak icin tum kontrolleri tamamla.",
    synced: "Supabase ile senkron",
    localFallback: "Bu seferi Supabase ile senkronlamak icin giris yap.",
    routeOptions: "Gorev secenekleri",
    celebrationTitle: "Sefer Tamamlandi",
    celebrationBody: "+50 Bonus NM kariyer kaydina eklendi.",
    celebrationButton: "Kariyere Devam Et",
    close: "Kapat",
    loading: "Bugunun seferi hazirlaniyor..."
  }
} as const;

const missionOptions = [
  {
    title: "Cargo Match",
    href: "/missions/cargo-match",
    Icon: Boxes
  },
  {
    title: "Radio Check",
    href: "/missions/radio-check",
    Icon: Radio
  },
  {
    title: "Ship Log Repair",
    href: "/missions/ship-log-repair",
    Icon: Ship
  }
];

export function DailyVoyage() {
  const { locale } = useI18n();
  const labels = copy[locale];
  const progress = usePlayerProgress();
  const [status, setStatus] = useState<DailyVoyageStatus | null>(null);
  const [countdown, setCountdown] = useState(getNextVoyageCountdown().label);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const currentNm = status?.currentNm || progress.xp;
  const statusProgress = status?.progressPercent ?? 0;
  const completedCount = status?.completedCount ?? 0;
  const totalCount = status?.totalCount ?? 3;

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    const nextStatus = await getDailyVoyageStatus();

    setStatus(nextStatus);
    setMessage(nextStatus.error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdown(getNextVoyageCountdown().label);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const dailyTasks = useMemo(
    () => [
      {
        key: "mission",
        title: labels.completeMission,
        body: labels.completeMissionBody,
        completed: status?.missionCompleted === true,
        actionHref: "/missions/cargo-match"
      },
      {
        key: "nm",
        title: labels.earnNm,
        body: labels.earnNmBody,
        completed: status?.nmTargetReached === true,
        actionHref: "/missions/cargo-match"
      },
      {
        key: "flashcards",
        title: labels.studyFlashcards,
        body: labels.studyFlashcardsBody,
        completed: status?.flashcardTargetReached === true,
        actionHref: null
      }
    ],
    [labels, status]
  );

  async function handleMarkFlashcards() {
    setIsUpdating(true);
    const nextStatus = await markFlashcardTargetReached();

    setStatus(nextStatus);
    setMessage(nextStatus.error);
    setIsUpdating(false);
  }

  async function handleClaimReward() {
    setIsUpdating(true);
    const result = await claimDailyVoyageReward();

    setStatus(result.status);
    setMessage(result.error);
    setIsUpdating(false);

    if (result.claimed) {
      setShowCelebration(true);
    }
  }

  const rewardStateLabel = status?.rewardClaimed
    ? labels.rewardClaimed
    : status?.isComplete
      ? labels.rewardReady
      : labels.rewardLocked;

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
              {labels.backDashboard}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink pb-14 pt-6 text-white sm:pb-16">
        <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-10" />
        <div className="absolute left-1/2 top-0 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-tide/24 blur-3xl" />

        <div className="section-shell relative">
          <div className="dark-glass-panel rounded-lg p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <Compass className="h-4 w-4 text-signal" />
                  {labels.eyebrow}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {labels.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {labels.subtitle}
                </p>
              </div>

              <div className="rounded-lg border border-white/12 bg-white/8 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-white/72">
                  <span>{labels.progress}</span>
                  <span>
                    {completedCount}/{totalCount} - {statusProgress}%
                  </span>
                </div>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/14">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
                    style={{ width: `${statusProgress}%` }}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <VoyageMetric label={labels.currentNm} value={`${currentNm} NM`} />
                  <VoyageMetric
                    label={labels.currentRank}
                    value={progress.currentRank.name}
                  />
                  <VoyageMetric label={labels.nextRank} value={progress.nextRank.name} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold text-ink">
                  {labels.taskDeck}
                </h2>
                <p className="mt-2 text-sm leading-6 text-steel">
                  {labels.taskDeckBody}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-signal/24 px-3 py-2 text-sm font-bold text-ink">
                <Sparkles className="h-4 w-4 text-tide" />
                {labels.reward}
              </span>
            </div>

            {isLoading ? (
              <p className="mt-6 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5 text-sm font-semibold text-steel">
                {labels.loading}
              </p>
            ) : (
              <div className="mt-6 grid gap-4">
                {dailyTasks.map((task) => (
                  <DailyTaskCard
                    key={task.key}
                    title={task.title}
                    body={task.body}
                    completed={task.completed}
                    pendingLabel={labels.pending}
                    completedLabel={labels.completed}
                    actionLabel={
                      task.key === "flashcards" ? labels.markStudied : labels.openMission
                    }
                    actionHref={task.actionHref}
                    onAction={
                      task.key === "flashcards" ? handleMarkFlashcards : undefined
                    }
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="grid gap-6">
            <section className="overflow-hidden rounded-lg border border-ink/8 bg-white shadow-soft">
              <div className="relative bg-gradient-to-br from-ink via-harbor to-[#123d4a] p-6 text-white">
                <div className="absolute inset-0 bg-chart-grid bg-[size:36px_36px] opacity-10" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white/62">
                      {rewardStateLabel}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold">
                      +{dailyVoyageRewardNm} NM
                    </h2>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-lg bg-signal text-ink">
                    <Trophy className="h-7 w-7" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
                  <div>
                    <p className="text-sm font-bold text-steel">
                      {labels.countdown}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-ink">
                      {countdown}
                    </p>
                  </div>
                  <Clock3 className="h-6 w-6 text-tide" />
                </div>

                {message ? (
                  <p className="mt-4 rounded-lg border border-ink/8 bg-[#f6f8f3] p-3 text-sm font-semibold text-steel">
                    {status?.isAuthenticated ? labels.synced : labels.localFallback}
                  </p>
                ) : null}

                {status?.rewardClaimed ? (
                  <div className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-tide/12 px-4 py-3 text-sm font-bold text-tide">
                    <Check className="h-4 w-4" />
                    {labels.rewardClaimed}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleClaimReward}
                    disabled={!status?.isComplete || isUpdating}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor disabled:cursor-not-allowed disabled:bg-steel disabled:hover:translate-y-0"
                  >
                    {status?.isComplete ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {status?.isComplete ? labels.claimReward : labels.claimHint}
                  </button>
                )}

                <button
                  type="button"
                  onClick={refreshStatus}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <RotateCw className="h-4 w-4" />
                  {locale === "tr" ? "Durumu Yenile" : "Refresh Status"}
                </button>
              </div>
            </section>

            <section id="mission-options" className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {labels.routeOptions}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {labels.completeMissionBody}
                  </p>
                </div>
                <Medal className="h-6 w-6 text-tide" />
              </div>
              <div className="mt-5 grid gap-3">
                {missionOptions.map((mission) => {
                  const Icon = mission.Icon;

                  return (
                    <a
                      key={mission.href}
                      href={mission.href}
                      className="flex items-center justify-between gap-4 rounded-lg border border-ink/8 bg-[#f6f8f3] p-4 transition hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white"
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="font-bold text-ink">{mission.title}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-steel" />
                    </a>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </section>

      {showCelebration ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-glow">
            <div className="relative bg-ink p-6 text-white">
              <div className="absolute inset-0 bg-chart-grid bg-[size:38px_38px] opacity-10" />
              <div className="relative">
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-signal text-ink">
                  <Trophy className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-3xl font-semibold">
                  {labels.celebrationTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  {labels.celebrationBody}
                </p>
              </div>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
              >
                {labels.celebrationButton}
                <ChevronRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="inline-flex items-center justify-center rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                {labels.close}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function DailyTaskCard({
  title,
  body,
  completed,
  pendingLabel,
  completedLabel,
  actionLabel,
  actionHref,
  onAction,
  isUpdating
}: {
  title: string;
  body: string;
  completed: boolean;
  pendingLabel: string;
  completedLabel: string;
  actionLabel: string;
  actionHref: string | null;
  onAction?: () => void;
  isUpdating: boolean;
}) {
  return (
    <article
      className={`rounded-lg border p-5 transition ${
        completed
          ? "border-tide/20 bg-tide/8"
          : "border-ink/8 bg-[#f7f9f4] hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`grid h-12 w-12 place-items-center rounded-lg ${
              completed ? "bg-tide text-white" : "bg-ink text-white"
            }`}
          >
            {completed ? <Check className="h-6 w-6" /> : <Compass className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  completed ? "bg-tide/12 text-tide" : "bg-signal/24 text-ink"
                }`}
              >
                {completed ? completedLabel : pendingLabel}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-steel">{body}</p>
          </div>
        </div>

        {completed ? (
          <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-tide/12 px-4 py-3 text-sm font-bold text-tide">
            <Check className="h-4 w-4" />
            {completedLabel}
          </span>
        ) : actionHref ? (
          <a
            href={actionHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            {actionLabel}
            <ChevronRight className="h-4 w-4" />
          </a>
        ) : (
          <button
            type="button"
            onClick={onAction}
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor disabled:cursor-not-allowed disabled:bg-steel"
          >
            {actionLabel}
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}

function VoyageMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/42">
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
