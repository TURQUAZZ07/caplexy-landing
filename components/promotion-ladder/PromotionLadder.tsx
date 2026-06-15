"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Anchor,
  ArrowLeft,
  CheckCircle,
  Compass,
  Flag,
  Lock,
  Medal,
  Route,
  Ship,
  Sparkles,
  Star,
  Trophy
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import { useI18n } from "@/lib/i18n";
import { readStoredXp, writeStoredXp } from "@/lib/progress";
import {
  allMicroRanks,
  getNextRankByXP,
  getRankByXP,
  getRankProgress,
  TOTAL_MICRO_RANKS
} from "@/lib/ranks";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

type LadderProfile = {
  currentNm: number;
  source: "supabase" | "local";
  message: string | null;
};

type LadderStatus = "completed" | "current" | "locked";

type Milestone = {
  key: string;
  label: string;
  rankIndex: number;
  Icon: LucideIcon;
};

const copy = {
  en: {
    backDashboard: "Dashboard",
    eyebrow: "Promotion route",
    title: "Promotion Ladder",
    subtitle:
      "Track every Caplexy rank from your first harbor assignment to Admiral command.",
    synced: "Synced with Supabase profile",
    local:
      "Using local demo progress. Sign in to sync your real Caplexy profile.",
    currentPosition: "Current Position",
    currentRank: "Current Rank",
    currentNm: "Current NM",
    nextRank: "Next Rank",
    nmRemaining: "NM Remaining",
    careerCompletion: "Career Completion",
    rankNumber: "Current Rank",
    progress: "Career Completion",
    ladderTitle: "Career Ladder",
    ladderBody:
      "Climb upward through completed, current and future promotions across 250 micro-ranks.",
    milestones: "Milestones",
    milestonesBody: "Long-range command points across the Caplexy career.",
    completed: "Completed",
    current: "Current",
    locked: "Future",
    nmRequired: "NM Required",
    viewCareerMap: "View Career Map"
  },
  tr: {
    backDashboard: "Dashboard",
    eyebrow: "Terfi rotasi",
    title: "Terfi Merdiveni",
    subtitle:
      "Ilk liman gorevinden Amiral komutasina kadar tum Caplexy rutbelerini takip et.",
    synced: "Supabase profili ile senkronize",
    local:
      "Yerel demo ilerlemesi kullaniliyor. Gercek Caplexy profilini senkronize etmek icin giris yap.",
    currentPosition: "Mevcut Konum",
    currentRank: "Mevcut Rutbe",
    currentNm: "Mevcut NM",
    nextRank: "Sonraki Rutbe",
    nmRemaining: "Kalan NM",
    careerCompletion: "Kariyer Tamamlama",
    rankNumber: "Mevcut Rutbe",
    progress: "Kariyer Tamamlama",
    ladderTitle: "Kariyer Merdiveni",
    ladderBody:
      "250 mikro rutbe boyunca tamamlanan, mevcut ve gelecek terfilerle yukari tirman.",
    milestones: "Kilometre Taslari",
    milestonesBody: "Caplexy kariyerindeki uzun rota komuta noktalarin.",
    completed: "Tamamlandi",
    current: "Mevcut",
    locked: "Gelecek",
    nmRequired: "Gerekli NM",
    viewCareerMap: "Kariyer Haritasini Gor"
  }
} as const;

type LadderCopy = Record<keyof (typeof copy)["en"], string>;

export function PromotionLadder() {
  const { locale } = useI18n();
  const labels = copy[locale];
  const [profile, setProfile] = useState<LadderProfile>(() => {
    const currentNm = readStoredXp();

    return {
      currentNm,
      source: "local",
      message: labels.local
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const currentRank = getRankByXP(profile.currentNm);
  const nextRank = getNextRankByXP(profile.currentNm);
  const rankProgress = getRankProgress(profile.currentNm);
  const nmRemaining = Math.max(0, nextRank.xpRequired - profile.currentNm);
  const careerCompletionPercent = Number(
    ((currentRank.index / TOTAL_MICRO_RANKS) * 100).toFixed(1)
  );
  const milestones = useMemo(buildMilestones, []);
  const ladderRanks = useMemo(() => [...allMicroRanks].reverse(), []);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      setIsLoading(true);
      const localNm = readStoredXp();
      const config = getSupabaseConfigStatus();

      if (!config.isConfigured) {
        if (isActive) {
          setProfile({
            currentNm: localNm,
            source: "local",
            message: labels.local
          });
          setIsLoading(false);
        }
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const user = userData.user;

        if (userError || !user) {
          if (isActive) {
            setProfile({
              currentNm: localNm,
              source: "local",
              message: labels.local
            });
          }
          return;
        }

        const ensuredProfile = await ensureUserProfile();

        if (ensuredProfile.error) {
          throw new Error(ensuredProfile.error);
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("current_xp,current_rank,current_rank_name")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        const currentNm =
          typeof data?.current_xp === "number" ? data.current_xp : localNm;

        writeStoredXp(currentNm);

        if (isActive) {
          setProfile({
            currentNm,
            source: "supabase",
            message: labels.synced
          });
        }
      } catch (error) {
        if (isActive) {
          setProfile({
            currentNm: localNm,
            source: "local",
            message:
              error instanceof Error
                ? error.message
                : "Profile progress could not be loaded."
          });
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [labels.local, labels.synced]);

  useEffect(() => {
    if (isLoading || typeof window === "undefined") {
      return;
    }

    const scrollHandle = window.setTimeout(() => {
      const currentRankElement = document.getElementById(
        getRankElementId(currentRank.index)
      );

      if (!currentRankElement) {
        return;
      }

      const top =
        currentRankElement.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight * 0.46;

      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;

      root.style.scrollBehavior = "auto";
      window.scrollTo(0, Math.max(0, top));
      currentRankElement.focus({ preventScroll: true });

      window.requestAnimationFrame(() => {
        root.style.scrollBehavior = previousScrollBehavior;
      });
    }, 280);

    return () => window.clearTimeout(scrollHandle);
  }, [currentRank.index, isLoading]);

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

      <section className="relative overflow-hidden bg-ink pb-12 pt-6 text-white sm:pb-16">
        <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-10" />
        <div className="absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-tide/24 blur-3xl" />

        <div className="section-shell relative">
          <div className="dark-glass-panel rounded-lg p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <Route className="h-4 w-4 text-signal" />
                  {labels.eyebrow}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {labels.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {labels.subtitle}
                </p>
                <p className="mt-5 inline-flex rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-white/66">
                  {isLoading ? "Loading profile..." : profile.message}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <HeroMetric label={labels.currentRank} value={currentRank.name} />
                <HeroMetric
                  label={labels.currentNm}
                  value={profile.currentNm.toLocaleString()}
                />
                <HeroMetric label={labels.nextRank} value={nextRank.name} />
                <HeroMetric
                  label={labels.nmRemaining}
                  value={nmRemaining.toLocaleString()}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
          <aside className="grid content-start gap-6">
            <CurrentPositionCard
              currentRank={currentRank.name}
              currentNm={profile.currentNm}
              nextRank={nextRank.name}
              nmRemaining={nmRemaining}
              labels={labels}
            />
            <CareerCompletionCard
              rankIndex={currentRank.index}
              careerCompletionPercent={careerCompletionPercent}
              rankProgressPercent={rankProgress.percent}
              labels={labels}
            />
            <MilestonesCard
              currentRankIndex={currentRank.index}
              milestones={milestones}
              labels={labels}
            />
          </aside>

          <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold text-ink">
                  {labels.ladderTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-steel">
                  {labels.ladderBody}
                </p>
              </div>
              <a
                href="/career"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
              >
                {labels.viewCareerMap}
                <Compass className="h-4 w-4" />
              </a>
            </div>

            <div className="relative mt-8 space-y-3">
              <div
                aria-hidden="true"
                className="absolute bottom-4 left-6 top-4 hidden w-px bg-gradient-to-t from-tide via-signal to-ink/18 sm:block"
              />
              {ladderRanks.map((rank) => (
                <RankTimelineRow
                  key={rank.index}
                  rankIndex={currentRank.index}
                  rankName={rank.name}
                  rankNumber={rank.index}
                  nmRequired={rank.xpRequired}
                  labels={labels}
                />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function CurrentPositionCard({
  currentRank,
  currentNm,
  nextRank,
  nmRemaining,
  labels
}: {
  currentRank: string;
  currentNm: number;
  nextRank: string;
  nmRemaining: number;
  labels: LadderCopy;
}) {
  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-tide/10 px-3 py-2 text-sm font-bold text-tide">
            <Anchor className="h-4 w-4" />
            {labels.currentPosition}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink">{currentRank}</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white">
          <Medal className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <InfoRow label={labels.currentNm} value={currentNm.toLocaleString()} />
        <InfoRow label={labels.nextRank} value={nextRank} />
        <InfoRow label={labels.nmRemaining} value={nmRemaining.toLocaleString()} />
      </div>
    </section>
  );
}

function CareerCompletionCard({
  rankIndex,
  careerCompletionPercent,
  rankProgressPercent,
  labels
}: {
  rankIndex: number;
  careerCompletionPercent: number;
  rankProgressPercent: number;
  labels: LadderCopy;
}) {
  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-steel">
            {labels.careerCompletion}
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">
            {careerCompletionPercent}%
          </h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-signal/24 text-ink">
          <Trophy className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 h-4 overflow-hidden rounded-full bg-[#e5ece8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
          style={{ width: `${careerCompletionPercent}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoRow
          label={labels.rankNumber}
          value={`${rankIndex} / ${TOTAL_MICRO_RANKS}`}
        />
        <InfoRow label={labels.progress} value={`${rankProgressPercent}%`} />
      </div>
    </section>
  );
}

function MilestonesCard({
  currentRankIndex,
  milestones,
  labels
}: {
  currentRankIndex: number;
  milestones: Milestone[];
  labels: LadderCopy;
}) {
  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">{labels.milestones}</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            {labels.milestonesBody}
          </p>
        </div>
        <Flag className="h-6 w-6 text-tide" />
      </div>

      <div className="mt-6 grid gap-3">
        {milestones.map((milestone) => {
          const status = getLadderStatus(milestone.rankIndex, currentRankIndex);
          const Icon = milestone.Icon;

          return (
            <article
              key={milestone.key}
              className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                status === "completed"
                  ? "border-tide/18 bg-tide/8"
                  : status === "current"
                    ? "border-signal bg-signal/16"
                    : "border-ink/8 bg-[#f6f8f3]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-lg ${
                    status === "locked"
                      ? "bg-white text-steel"
                      : status === "current"
                        ? "bg-signal text-ink"
                        : "bg-tide text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-ink">{milestone.label}</h3>
                  <p className="mt-1 text-xs font-semibold text-steel">
                    Rank {milestone.rankIndex}
                  </p>
                </div>
              </div>
              <StatusBadge status={status} labels={labels} />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RankTimelineRow({
  rankIndex,
  rankName,
  rankNumber,
  nmRequired,
  labels
}: {
  rankIndex: number;
  rankName: string;
  rankNumber: number;
  nmRequired: number;
  labels: LadderCopy;
}) {
  const status = getLadderStatus(rankNumber, rankIndex);
  const Icon = status === "completed" ? CheckCircle : status === "current" ? Star : Lock;

  return (
    <article
      id={getRankElementId(rankNumber)}
      tabIndex={status === "current" ? 0 : undefined}
      aria-current={status === "current" ? "step" : undefined}
      className={`relative scroll-mt-28 grid gap-4 rounded-lg border p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center ${
        status === "completed"
          ? "border-tide/18 bg-tide/8"
          : status === "current"
            ? "border-signal bg-signal/16 shadow-glow ring-2 ring-signal/24"
            : "border-ink/8 bg-[#f6f8f3] opacity-72"
      }`}
    >
      <div
        className={`relative z-10 grid h-12 w-12 place-items-center rounded-lg ${
          status === "completed"
            ? "bg-tide text-white"
            : status === "current"
              ? "bg-signal text-ink"
              : "bg-white text-steel"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-ink">{rankName}</h3>
          <StatusBadge status={status} labels={labels} />
        </div>
        <p className="mt-2 text-sm font-semibold text-steel">
          Rank {rankNumber} / {TOTAL_MICRO_RANKS} - {labels.nmRequired}:{" "}
          {nmRequired.toLocaleString()}
        </p>
      </div>

      <p className="text-sm font-bold text-steel sm:text-right">
        {status === "completed"
          ? labels.completed
          : status === "current"
            ? labels.current
            : labels.locked}
      </p>
    </article>
  );
}

function StatusBadge({
  status,
  labels
}: {
  status: LadderStatus;
  labels: LadderCopy;
}) {
  return (
    <span
      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
        status === "completed"
          ? "bg-tide/12 text-tide"
          : status === "current"
            ? "bg-ink text-white"
            : "bg-ink/5 text-steel"
      }`}
    >
      {status === "completed"
        ? labels.completed
        : status === "current"
          ? labels.current
          : labels.locked}
    </span>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-4">
      <p className="text-sm font-semibold text-white/62">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-ink/8 bg-[#f6f8f3] p-3">
      <span className="text-sm font-semibold text-steel">{label}</span>
      <span className="text-right text-sm font-bold text-ink">{value}</span>
    </div>
  );
}

function getLadderStatus(rankNumber: number, currentRankIndex: number): LadderStatus {
  if (rankNumber < currentRankIndex) {
    return "completed";
  }

  if (rankNumber === currentRankIndex) {
    return "current";
  }

  return "locked";
}

function getRankElementId(rankIndex: number) {
  return `promotion-rank-${rankIndex}`;
}

function buildMilestones(): Milestone[] {
  const captainRank = allMicroRanks.find(
    (rank) => rank.groupName === "Captain" && rank.levelIndex === 1
  );
  const admiralRank = allMicroRanks.find(
    (rank) => rank.groupName === "Admiral" && rank.levelIndex === 1
  );

  return [
    { key: "rank-50", label: "Rank 50", rankIndex: 50, Icon: Flag },
    { key: "rank-100", label: "Rank 100", rankIndex: 100, Icon: Flag },
    { key: "rank-150", label: "Rank 150", rankIndex: 150, Icon: Flag },
    { key: "rank-200", label: "Rank 200", rankIndex: 200, Icon: Flag },
    {
      key: "captain",
      label: "Captain",
      rankIndex: captainRank?.index ?? 156,
      Icon: Ship
    },
    {
      key: "admiral",
      label: "Admiral",
      rankIndex: admiralRank?.index ?? 201,
      Icon: Sparkles
    }
  ];
}
