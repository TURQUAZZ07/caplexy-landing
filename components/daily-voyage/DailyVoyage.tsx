"use client";

import {
  ArrowLeft,
  Boxes,
  Check,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Lock,
  Medal,
  Radio,
  Ship,
  Sparkles,
  Trophy
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";
import type { DailyVoyageMissionId } from "@/lib/progress";

type VoyageMission = {
  id: DailyVoyageMissionId;
  title: string;
  typeKey: string;
  href: string;
  Icon: typeof Boxes;
};

const voyageMissions: VoyageMission[] = [
  {
    id: "cargo-match",
    title: "Cargo Match",
    typeKey: "dailyVoyagePage.types.vocabulary",
    href: "/missions/cargo-match",
    Icon: Boxes
  },
  {
    id: "radio-check",
    title: "Radio Check",
    typeKey: "dailyVoyagePage.types.listening",
    href: "/missions/radio-check",
    Icon: Radio
  },
  {
    id: "ship-log-repair",
    title: "Ship Log Repair",
    typeKey: "dailyVoyagePage.types.grammar",
    href: "/missions/ship-log-repair",
    Icon: ClipboardCheck
  }
];

export function DailyVoyage() {
  const { t } = useI18n();
  const {
    dailyVoyage,
    voyageLog,
    xp,
    currentRank,
    nextRank,
    rankProgress
  } = usePlayerProgress();
  const progressText = t("dailyVoyagePage.progress")
    .replace("{completed}", String(dailyVoyage.completedCount))
    .replace("{total}", String(dailyVoyage.totalCount));
  const xpTodayText = t("dailyVoyagePage.xpToday").replace(
    "{xp}",
    String(dailyVoyage.xpEarnedToday)
  );
  const rankRouteText = t("dailyVoyagePage.rankRoute")
    .replace("{current}", currentRank.name)
    .replace("{next}", nextRank.name);

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
              {t("dailyVoyagePage.backDashboard")}
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
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <Compass className="h-4 w-4 text-signal" />
                  {t("dailyVoyagePage.reward")}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {t("dailyVoyagePage.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {t("dailyVoyagePage.subtitle")}
                </p>
              </div>

              <div className="rounded-lg border border-white/12 bg-white/8 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-white/72">
                  <span>{progressText}</span>
                  <span>{dailyVoyage.progressPercent}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/14">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
                    style={{ width: `${dailyVoyage.progressPercent}%` }}
                  />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <VoyageMetric label={t("dailyVoyagePage.totalXp")} value={String(xp)} />
                  <VoyageMetric label={t("dailyVoyagePage.earnedToday")} value={xpTodayText} />
                  <VoyageMetric label={t("dailyVoyagePage.voyageLog")} value={String(voyageLog.currentVoyage)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold text-ink">
                  {t("dailyVoyagePage.missionListTitle")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-steel">
                  {t("dailyVoyagePage.missionListSubtitle")}
                </p>
              </div>
              {dailyVoyage.isComplete ? (
                <span className="rounded-lg bg-tide/12 px-3 py-2 text-sm font-bold text-tide">
                  {t("dailyVoyagePage.completedStatus")}
                </span>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4">
              {voyageMissions.map((mission) => {
                const isCompleted = dailyVoyage.completedMissionIds.includes(mission.id);
                const Icon = mission.Icon;

                return (
                  <article
                    key={mission.id}
                    className={`rounded-lg border p-5 transition ${
                      isCompleted
                        ? "border-tide/20 bg-tide/8"
                        : "border-ink/8 bg-[#f7f9f4] hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`grid h-12 w-12 place-items-center rounded-lg ${
                            isCompleted ? "bg-tide text-white" : "bg-ink text-white"
                          }`}
                        >
                          {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-ink">{mission.title}</h3>
                            <span className="rounded-lg bg-signal/24 px-2.5 py-1 text-xs font-bold text-ink">
                              +25 XP
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-steel">
                            {t(mission.typeKey)}
                          </p>
                        </div>
                      </div>

                      {isCompleted ? (
                        <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-tide/12 px-4 py-3 text-sm font-bold text-tide">
                          <Check className="h-4 w-4" />
                          {t("dailyVoyagePage.completed")}
                        </span>
                      ) : (
                        <a
                          href={mission.href}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
                        >
                          {t("dailyVoyagePage.startMission")}
                          <ChevronRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="grid gap-6">
            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("dailyVoyagePage.rankTitle")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {rankRouteText}
                  </p>
                </div>
                <Medal className="h-6 w-6 text-tide" />
              </div>
              <div className="mt-6 flex items-center justify-between text-sm font-bold text-steel">
                <span>{currentRank.name}</span>
                <span>{rankProgress.percent}%</span>
              </div>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-[#e5ece8]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
                  style={{ width: `${rankProgress.percent}%` }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-steel">
                {t("dailyVoyagePage.rankBody")}
              </p>
            </section>

            {dailyVoyage.isComplete ? (
              <CompletionPanel />
            ) : (
              <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-signal text-ink">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-ink">
                      {t("dailyVoyagePage.bonusLockedTitle")}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-steel">
                      {t("dailyVoyagePage.bonusLockedBody")}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function VoyageMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/42">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function CompletionPanel() {
  const { t } = useI18n();

  return (
    <section className="overflow-hidden rounded-lg border border-ink/8 bg-white shadow-soft">
      <div className="relative bg-ink p-6 text-white">
        <div className="absolute inset-0 bg-chart-grid bg-[size:40px_40px] opacity-10" />
        <div className="relative">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-signal text-ink shadow-glow">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold">
            {t("dailyVoyagePage.completedTitle")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            {t("dailyVoyagePage.completedBody")}
          </p>
        </div>
      </div>
      <div className="p-6">
        <div className="inline-flex items-center gap-3 rounded-lg bg-signal/20 px-4 py-3 text-sm font-bold text-ink">
          <Sparkles className="h-5 w-5 text-tide" />
          {t("dailyVoyagePage.completedReward")}
        </div>
        <p className="mt-4 text-sm leading-6 text-steel">
          {t("dailyVoyagePage.tomorrow")}
        </p>
      </div>
    </section>
  );
}
