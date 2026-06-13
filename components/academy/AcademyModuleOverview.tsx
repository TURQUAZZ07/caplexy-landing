"use client";

import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  GraduationCap,
  Lock,
  Ship
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
  AcademyModule,
  getAcademyModuleProgress,
  getAcademyModuleStatus
} from "@/lib/academy";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";

export function AcademyModuleOverview({ module }: { module: AcademyModule }) {
  const { t, list } = useI18n();
  const { rankIndex, currentRank } = usePlayerProgress();
  const status = getAcademyModuleStatus(module, rankIndex);
  const progress = getAcademyModuleProgress(module, rankIndex);
  const objectives = list<string[]>(`academy.modules.${module.key}.objectives`);
  const isLocked = status === "locked";

  return (
    <main className="min-h-screen bg-[#f3f6f1] text-ink">
      <header className="bg-ink text-white">
        <div className="section-shell flex flex-wrap items-center justify-between gap-3 py-5">
          <a href="/academy" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10">
              <Ship className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-wide">Caplexy</span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="/academy"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/18 bg-white/12 px-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("academy.backAcademy")}
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
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
              <GraduationCap className="h-4 w-4 text-signal" />
              {t("academy.trainingDeck")}
            </div>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
              {t(`academy.modules.${module.key}.title`)}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
              {t(`academy.modules.${module.key}.description`)}
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="grid gap-6">
            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-steel">
                    {t("academy.currentRank")}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">
                    {currentRank.name}
                  </h2>
                </div>
                <Compass className="h-6 w-6 text-tide" />
              </div>

              <div className="mt-5 grid gap-3">
                <InfoRow
                  label={t("academy.requiredRank")}
                  value={t("academy.rankRequired").replace(
                    "{rank}",
                    String(module.unlockRank)
                  )}
                />
                <InfoRow
                  label={t("academy.trainingFocus")}
                  value={t(`academy.modules.${module.key}.focus`)}
                />
                <InfoRow
                  label={t("academy.statusLabel")}
                  value={t(`academy.status.${status}`)}
                />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm font-bold text-steel">
                  <span>{t("academy.trainingProgress")}</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e5ece8]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </section>
          </aside>

          <div className="grid gap-6">
            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white">
                  <BookOpenCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("academy.moduleOverview")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {t("academy.moduleOverviewBody")}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {objectives.map((objective) => (
                  <div
                    key={objective}
                    className="flex items-center gap-3 rounded-lg border border-ink/8 bg-[#f6f8f3] p-3"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-tide" />
                    <span className="text-sm font-semibold text-ink">
                      {objective}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("academy.comingSoonTitle")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {isLocked
                      ? t("academy.lockedTrainingBody")
                      : t("academy.comingSoonBody")}
                  </p>
                </div>
                {isLocked ? (
                  <Lock className="h-6 w-6 text-steel" />
                ) : (
                  <GraduationCap className="h-6 w-6 text-tide" />
                )}
              </div>

              <a
                href="/dashboard"
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
              >
                {t("academy.returnDashboard")}
              </a>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-steel">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
