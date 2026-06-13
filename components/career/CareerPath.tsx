"use client";

import { ArrowLeft, Check, Lock, Medal, Ship } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";
import { allMicroRanks } from "@/lib/ranks";

export function CareerPath() {
  const { t } = useI18n();
  const { xp, currentRank, rankIndex, rankProgress } = usePlayerProgress();

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
              {t("career.backDashboard")}
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
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <Medal className="h-4 w-4 text-signal" />
                  {t("career.currentRank")}: {currentRank.name}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {t("career.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {t("career.subtitle")}
                </p>
              </div>

              <div className="rounded-lg border border-white/12 bg-white/8 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-white/70">
                  <span>{t("career.currentXp")}</span>
                  <span>{xp}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm font-semibold text-white/70">
                  <span>{t("career.progress")}</span>
                  <span>{rankProgress.percent}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/14">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
                    style={{ width: `${rankProgress.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allMicroRanks.map((rank) => {
            const isCompleted = rank.index < rankIndex;
            const isCurrent = rank.index === rankIndex;
            const statusLabel = isCurrent
              ? t("career.current")
              : isCompleted
                ? t("career.completed")
                : t("career.locked");
            const xpLabel = t("career.xpRequired").replace(
              "{xp}",
              String(rank.xpRequired)
            );
            const rankNumber = t("career.rankNumber").replace(
              "{rank}",
              String(rank.index)
            );

            return (
              <article
                key={rank.index}
                className={`rounded-lg border p-4 transition ${
                  isCurrent
                    ? "border-signal bg-white shadow-glow"
                    : isCompleted
                      ? "border-tide/20 bg-white shadow-soft"
                      : "border-ink/8 bg-white/58 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-lg text-sm font-bold ${
                      isCurrent
                        ? "bg-signal text-ink"
                        : isCompleted
                          ? "bg-tide text-white"
                          : "bg-ink/8 text-steel"
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : isCurrent ? rank.index : <Lock className="h-5 w-5" />}
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                      isCurrent
                        ? "bg-ink text-white"
                        : isCompleted
                          ? "bg-tide/12 text-tide"
                          : "bg-ink/5 text-steel"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <h2 className="mt-4 font-semibold text-ink">{rank.name}</h2>
                <p className="mt-2 text-sm font-semibold text-steel">{xpLabel}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-steel">
                  {rankNumber}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
