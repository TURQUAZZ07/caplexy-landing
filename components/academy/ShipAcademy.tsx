"use client";

import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  ChevronRight,
  Compass,
  GraduationCap,
  Lock,
  Medal,
  Ship,
  ShieldCheck
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
  academyModules,
  getAcademyModuleProgress,
  getAcademyModuleStatus
} from "@/lib/academy";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";

export function ShipAcademy() {
  const { t } = useI18n();
  const { rankIndex, currentRank } = usePlayerProgress();
  const unlockedCount = academyModules.filter(
    (module) => rankIndex >= module.unlockRank
  ).length;

  return (
    <main className="min-h-screen bg-[#f3f6f1] text-ink">
      <AcademyHeader />

      <section className="relative overflow-hidden bg-ink pb-12 pt-6 text-white sm:pb-16">
        <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-10" />
        <div className="absolute right-1/4 top-0 h-72 w-[42rem] rounded-full bg-tide/24 blur-3xl" />

        <div className="section-shell relative">
          <div className="dark-glass-panel rounded-lg p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <GraduationCap className="h-4 w-4 text-signal" />
                  {t("academy.eyebrow")}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {t("academy.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {t("academy.subtitle")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <HeroMetric label={t("academy.currentRank")} value={currentRank.name} />
                <HeroMetric
                  label={t("academy.unlockedModules")}
                  value={t("academy.moduleCount")
                    .replace("{count}", String(unlockedCount))
                    .replace("{total}", String(academyModules.length))}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <AcademySummaryCard
            Icon={Compass}
            label={t("academy.summary.route")}
            value={t("academy.summary.routeValue")}
          />
          <AcademySummaryCard
            Icon={ShieldCheck}
            label={t("academy.summary.training")}
            value={t("academy.summary.trainingValue")}
          />
          <AcademySummaryCard
            Icon={Medal}
            label={t("academy.summary.identity")}
            value={t("academy.summary.identityValue")}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {academyModules.map((module, index) => {
            const status = getAcademyModuleStatus(module, rankIndex);
            const progress = getAcademyModuleProgress(module, rankIndex);
            const isLocked = status === "locked";
            const Icon = status === "completed" ? Check : isLocked ? Lock : BookOpenCheck;

            return (
              <article
                key={module.slug}
                className={`rounded-lg border p-5 shadow-soft transition ${
                  status === "completed"
                    ? "border-tide/20 bg-tide/8"
                    : isLocked
                      ? "border-ink/8 bg-white/70 opacity-75"
                      : "border-ink/8 bg-white hover:-translate-y-0.5 hover:border-tide/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${
                        status === "completed"
                          ? "bg-tide text-white"
                          : isLocked
                            ? "bg-ink/8 text-steel"
                            : "bg-ink text-white"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
                        {t("academy.moduleLabel").replace("{number}", String(index + 1))}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-ink">
                        {t(`academy.modules.${module.key}.title`)}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-steel">
                        {t(`academy.modules.${module.key}.description`)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
                      status === "completed"
                        ? "bg-tide/12 text-tide"
                        : isLocked
                          ? "bg-ink/6 text-steel"
                          : "bg-signal/24 text-ink"
                    }`}
                  >
                    {t(`academy.status.${status}`)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoPill
                    label={t("academy.requiredRank")}
                    value={t("academy.rankRequired").replace(
                      "{rank}",
                      String(module.unlockRank)
                    )}
                  />
                  <InfoPill
                    label={t("academy.trainingFocus")}
                    value={t(`academy.modules.${module.key}.focus`)}
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

                <a
                  href={`/academy/${module.slug}`}
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition ${
                    isLocked
                      ? "border border-ink/10 bg-[#f6f8f3] text-steel"
                      : "bg-ink text-white hover:-translate-y-0.5 hover:bg-harbor"
                  }`}
                >
                  {isLocked ? t("academy.viewLocked") : t("academy.enterTraining")}
                  <ChevronRight className="h-4 w-4" />
                </a>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function AcademyHeader() {
  const { t } = useI18n();

  return (
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
            {t("academy.backDashboard")}
          </a>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
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

function AcademySummaryCard({
  Icon,
  label,
  value
}: {
  Icon: typeof Compass;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-ink/8 bg-white p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-tide/10 text-tide">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-steel">{label}</p>
          <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
        </div>
      </div>
    </article>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-steel">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
