"use client";

import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  Check,
  Compass,
  Lock,
  Ship,
  Trophy
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";

function getRecentDateKeys(dayCount: number) {
  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (dayCount - index - 1));

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return {
      dateKey: `${date.getFullYear()}-${month}-${day}`,
      dayLabel: String(date.getDate())
    };
  });
}

export function VoyageLog() {
  const { t } = useI18n();
  const { dailyVoyage, voyageLog } = usePlayerProgress();
  const completedDateSet = new Set(voyageLog.completedDates);
  const recentDates = getRecentDateKeys(35);
  const currentLabel = t("voyageLog.days").replace(
    "{days}",
    String(voyageLog.currentVoyage)
  );
  const longestLabel = t("voyageLog.days").replace(
    "{days}",
    String(voyageLog.longestVoyage)
  );
  const nextMilestoneLabel = t("voyageLog.days").replace(
    "{days}",
    String(voyageLog.nextMilestone.days)
  );
  const dailyStatus = dailyVoyage.isComplete
    ? t("voyageLog.dailyComplete")
    : t("voyageLog.dailyOpen");
  const daysRemaining = Math.max(
    0,
    voyageLog.nextMilestone.days - voyageLog.currentVoyage
  );
  const daysRemainingLabel = t("voyageLog.daysRemaining").replace(
    "{days}",
    String(daysRemaining)
  );
  const currentBadgeProgressLabel = t("voyageLog.currentBadgeProgress")
    .replace("{current}", String(voyageLog.currentVoyage))
    .replace("{target}", String(voyageLog.nextMilestone.days));

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
              {t("voyageLog.backDashboard")}
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
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <CalendarDays className="h-4 w-4 text-signal" />
                  {t("voyageLog.eyebrow")}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {t("voyageLog.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {t("voyageLog.subtitle")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMetric label={t("voyageLog.current")} value={currentLabel} />
                <HeroMetric label={t("voyageLog.longest")} value={longestLabel} />
                <HeroMetric label={t("voyageLog.nextMilestone")} value={nextMilestoneLabel} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <aside className="grid gap-6">
            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("voyageLog.statusTitle")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">{dailyStatus}</p>
                </div>
                <CalendarCheck className="h-6 w-6 text-tide" />
              </div>

              <div className="mt-6 h-4 overflow-hidden rounded-full bg-[#e5ece8]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
                  style={{ width: `${dailyVoyage.progressPercent}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm font-bold text-steel">
                <span>
                  {t("voyageLog.dailyProgress")
                    .replace("{completed}", String(dailyVoyage.completedCount))
                    .replace("{total}", String(dailyVoyage.totalCount))}
                </span>
                <span>{dailyVoyage.progressPercent}%</span>
              </div>
            </section>

            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-signal text-ink">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("voyageLog.nextMilestone")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {daysRemainingLabel}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm font-bold text-steel">
                <span>{currentLabel}</span>
                <span>{nextMilestoneLabel}</span>
              </div>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-[#e5ece8]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
                  style={{ width: `${voyageLog.milestoneProgressPercent}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-bold text-steel">
                {currentBadgeProgressLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-steel">
                {t("voyageLog.keepAlive")}
              </p>
            </section>
          </aside>

          <div className="grid gap-6">
            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <h2 className="text-2xl font-semibold text-ink">
                {t("voyageLog.milestoneTitle")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-steel">
                {t("voyageLog.milestoneBody")}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {voyageLog.milestones.map((milestone) => (
                  <article
                    key={milestone.days}
                    className={`rounded-lg border p-4 ${
                      milestone.achieved
                        ? "border-tide/20 bg-tide/8"
                        : "border-ink/8 bg-[#f6f8f3]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-steel">
                          {t("voyageLog.days").replace("{days}", String(milestone.days))}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-ink">
                          {t(`voyageLog.milestones.${milestone.rewardKey}`)}
                        </h3>
                      </div>
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-lg ${
                          milestone.achieved
                            ? "bg-tide text-white"
                            : "bg-ink/8 text-steel"
                        }`}
                      >
                        {milestone.achieved ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("voyageLog.historyCalendar")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {t("voyageLog.historyCalendarBody")}
                  </p>
                </div>
                <CalendarDays className="h-6 w-6 text-tide" />
              </div>

              <div className="mt-6 grid grid-cols-7 gap-2">
                {recentDates.map((day) => {
                  const isCompleted = completedDateSet.has(day.dateKey);

                  return (
                    <div
                      key={day.dateKey}
                      className={`grid aspect-square min-h-10 place-items-center rounded-lg border text-sm font-bold ${
                        isCompleted
                          ? "border-tide bg-tide text-white"
                          : "border-ink/8 bg-[#f6f8f3] text-steel"
                      }`}
                      title={day.dateKey}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : day.dayLabel}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("voyageLog.completedVoyageDays")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {t("voyageLog.completedDatesBody")}
                  </p>
                </div>
                <Trophy className="h-6 w-6 text-tide" />
              </div>

              {voyageLog.completedDates.length ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {voyageLog.completedDates.map((date) => (
                    <div
                      key={date}
                      className="flex items-center gap-3 rounded-lg border border-ink/8 bg-[#f6f8f3] p-3"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-tide text-white">
                        <Check className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-bold text-ink">{date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5 text-sm font-semibold text-steel">
                  {t("voyageLog.noCompletedDates")}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/42">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
