"use client";

import {
  ArrowLeft,
  BookOpenCheck,
  Boxes,
  ClipboardCheck,
  Compass,
  Gamepad2,
  GraduationCap,
  Headphones,
  Lock,
  Mic2,
  Ship
} from "lucide-react";
import { HarborBasicsExperience } from "@/components/academy/HarborBasicsExperience";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
  AcademyModule,
  getAcademyModuleProgress,
  getAcademyModuleStatus
} from "@/lib/academy";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";

export function AcademyModuleOverview({
  academyModule
}: {
  academyModule: AcademyModule;
}) {
  const { t, list } = useI18n();
  const { rankIndex, currentRank } = usePlayerProgress();
  const status = getAcademyModuleStatus(academyModule, rankIndex);
  const progress = getAcademyModuleProgress(academyModule, rankIndex);
  const objectives = list<string[]>(
    `academy.modules.${academyModule.key}.objectives`
  );
  const isLocked = status === "locked";
  const moduleTitle =
    t(`academy.modules.${academyModule.key}.title`) || academyModule.key;
  const moduleDescription = t(
    `academy.modules.${academyModule.key}.description`
  );
  const moduleFocus = t(`academy.modules.${academyModule.key}.focus`);
  const vocabularyItems = translateTokens(
    t,
    "academy.vocabularyThemeLabels",
    academyModule.vocabularyThemes
  );
  const listeningItems = translateTokens(
    t,
    "academy.listeningActivityLabels",
    academyModule.listeningActivities
  );
  const speakingItems = translateTokens(
    t,
    "academy.speakingActivityLabels",
    academyModule.speakingActivities
  );
  const assessmentTitle = readTranslatedToken(
    t,
    `academy.assessments.${academyModule.assessment}`,
    academyModule.assessment
  );
  const academyStages = [
    {
      key: "overview",
      Icon: BookOpenCheck,
      title: t("academy.trainingFlow.overview.title"),
      body: t("academy.trainingFlow.overview.body"),
      status: "ready",
      items: objectives ?? []
    },
    {
      key: "vocabulary",
      Icon: Boxes,
      title: t("academy.trainingFlow.vocabulary.title"),
      body: t("academy.trainingFlow.vocabulary.body"),
      status: "ready",
      items: vocabularyItems
    },
    {
      key: "listening",
      Icon: Headphones,
      title: t("academy.trainingFlow.listening.title"),
      body: t("academy.trainingFlow.listening.body"),
      status: isLocked ? "locked" : "ready",
      items: listeningItems
    },
    {
      key: "speaking",
      Icon: Mic2,
      title: t("academy.trainingFlow.speaking.title"),
      body: t("academy.trainingFlow.speaking.body"),
      status: isLocked ? "locked" : "ready",
      items: speakingItems
    },
    {
      key: "miniGame",
      Icon: Gamepad2,
      title: t("academy.trainingFlow.miniGame.title"),
      body: t("academy.trainingFlow.miniGame.body"),
      status: isLocked ? "locked" : "ready",
      items: [moduleFocus]
    },
    {
      key: "assessment",
      Icon: ClipboardCheck,
      title: t("academy.trainingFlow.assessment.title"),
      body: t("academy.trainingFlow.assessment.body"),
      status: isLocked ? "locked" : "ready",
      items: [assessmentTitle]
    }
  ] as const;

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
              {moduleTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
              {moduleDescription}
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
                      String(academyModule.unlockRank)
                    )}
                />
                <InfoRow
                  label={t("academy.trainingFocus")}
                  value={moduleFocus}
                />
                <InfoRow
                  label={t("academy.assessment")}
                  value={readTranslatedToken(
                    t,
                    `academy.assessments.${academyModule.assessment}`,
                    academyModule.assessment
                  )}
                />
                <InfoRow
                  label={t("academy.badge")}
                  value={readTranslatedToken(
                    t,
                    `academy.badges.${academyModule.badge}`,
                    academyModule.badge
                  )}
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
            {academyModule.slug === "harbor-basics" ? (
              <HarborBasicsExperience />
            ) : (
            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("academy.trainingFlow.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {t("academy.trainingFlow.body")}
                  </p>
                </div>
                <GraduationCap className="h-6 w-6 text-tide" />
              </div>

              <div className="mt-6 grid gap-4">
                {academyStages.map((stage, index) => (
                  <TrainingStage
                    key={stage.key}
                    title={stage.title}
                    body={stage.body}
                    items={stage.items}
                    Icon={stage.Icon}
                    isLocked={stage.status === "locked"}
                    stepLabel={t("academy.trainingFlow.stepLabel").replace(
                      "{number}",
                      String(index + 1)
                    )}
                    actionLabel={
                      stage.status === "locked"
                        ? t("academy.trainingFlow.lockedAction")
                        : t("academy.trainingFlow.startAction")
                    }
                  />
                ))}
              </div>
            </section>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function readTranslatedToken(
  t: (key: string) => string,
  translationKey: string,
  fallback: string
) {
  return t(translationKey) || fallback;
}

function translateTokens(
  t: (key: string) => string,
  translationRoot: string,
  tokens: string[] | undefined
) {
  return (tokens ?? []).map((token) =>
    readTranslatedToken(t, `${translationRoot}.${token}`, token)
  );
}

function TrainingStage({
  title,
  body,
  items,
  Icon,
  isLocked,
  stepLabel,
  actionLabel
}: {
  title: string;
  body: string;
  items: readonly string[];
  Icon: typeof BookOpenCheck;
  isLocked: boolean;
  stepLabel: string;
  actionLabel: string;
}) {
  return (
    <article
      className={`rounded-lg border p-4 ${
        isLocked ? "border-ink/8 bg-[#f6f8f3] opacity-75" : "border-ink/8 bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
              isLocked ? "bg-ink/8 text-steel" : "bg-ink text-white"
            }`}
          >
            {isLocked ? <Lock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
              {stepLabel}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-steel">{body}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={isLocked}
          className={`inline-flex shrink-0 items-center justify-center rounded-lg px-4 py-2 text-sm font-bold ${
            isLocked
              ? "border border-ink/10 bg-white text-steel"
              : "bg-tide text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          }`}
        >
          {actionLabel}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-lg bg-[#f6f8f3] px-2.5 py-1 text-xs font-bold text-ink"
          >
            {item}
          </span>
        ))}
      </div>
    </article>
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
