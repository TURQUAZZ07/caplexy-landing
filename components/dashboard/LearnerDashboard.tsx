"use client";

import {
  Anchor,
  BookOpenCheck,
  Boxes,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  HelpCircle,
  Map,
  Medal,
  Milestone,
  Radio,
  Route,
  Ship,
  Sparkles,
  Star,
  Trophy,
  UsersRound,
  Waves
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";
import { getNearbyRanks } from "@/lib/ranks";

const missionIcons = [Boxes, ClipboardCheck, Radio, HelpCircle];
const statIcons = [Star, BookOpenCheck, Trophy, UsersRound];

export function LearnerDashboard() {
  const { t, list } = useI18n();
  const progress = usePlayerProgress();
  const tasks = list<string[]>("dashboard.watchDuty.tasks");
  const missions = list<string[][]>("dashboard.missions.items");
  const statCards = [
    [t("dashboard.stats.totalXp"), String(progress.xp)],
    [t("dashboard.stats.voyageLog"), t("dashboard.stats.days").replace("{days}", String(progress.voyageLog.currentVoyage))],
    [
      t("dashboard.stats.missionsCompleted"),
      `${progress.dailyVoyage.completedCount}/${progress.dailyVoyage.totalCount}`
    ],
    [t("dashboard.stats.currentCrew"), "12"]
  ];

  return (
    <main className="min-h-screen bg-[#f3f6f1] text-ink">
      <DashboardHeader />

      <section className="relative overflow-hidden bg-ink pb-12 pt-8 text-white sm:pb-16 lg:pb-20">
        <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-10" />
        <div className="absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-tide/24 blur-3xl" />

        <div className="section-shell relative">
          <WelcomePanel />
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <DailyVoyageCard />
          <WatchDutyCard tasks={tasks} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4">
          {statCards.map(([label, value], index) => {
            const Icon = statIcons[index] ?? Star;

            return (
              <article key={label} className="rounded-lg border border-ink/8 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-steel">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-tide/10 text-tide">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 lg:mt-8">
          <VoyageLogCard />
        </div>

        <div className="mt-6 grid gap-6 lg:mt-8 xl:grid-cols-[1.35fr_0.65fr]">
          <MissionDeck missions={missions} />
          <RankPath />
        </div>
      </section>
    </main>
  );
}

function DashboardHeader() {
  const { t } = useI18n();

  return (
    <header className="bg-ink text-white">
      <div className="section-shell flex flex-wrap items-center justify-between gap-3 py-5">
        <a href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10">
            <Ship className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-wide">Caplexy</span>
        </a>

        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto text-sm font-semibold text-white/72 md:order-none md:w-auto">
          <a className="rounded-lg bg-white/12 px-3 py-2 text-white" href="/dashboard">
            {t("dashboard.nav.bridge")}
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="#missions">
            {t("dashboard.nav.missions")}
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/daily-voyage">
            {t("dashboard.nav.dailyVoyage")}
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/voyage-log">
            {t("dashboard.nav.voyageLog")}
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="#career">
            {t("dashboard.nav.career")}
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/career">
            {t("dashboard.nav.careerPath")}
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/">
            {t("dashboard.nav.backHome")}
          </a>
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}

function WelcomePanel() {
  const { t } = useI18n();
  const {
    xp,
    currentRank,
    nextRank,
    rankIndex,
    rankProgress,
    resetProgress
  } = usePlayerProgress();
  const rankNumber = t("dashboard.welcome.rankNumber").replace(
    "{rank}",
    String(rankIndex)
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
      <article className="dark-glass-panel rounded-lg p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
          <Anchor className="h-4 w-4 text-signal" />
          {t("dashboard.welcome.eyebrow")}
        </div>
        <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
          {t("dashboard.welcome.title").replace("{rank}", currentRank.name)}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
          {t("dashboard.welcome.subtitle")}
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <RankMetric
            label={t("dashboard.welcome.currentRank")}
            value={currentRank.name}
          />
          <RankMetric
            label={t("dashboard.welcome.nextRank")}
            value={nextRank.name}
          />
          <RankMetric
            label={t("dashboard.welcome.xp")}
            value={String(xp)}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <RankMetric
            label={t("dashboard.welcome.majorGroup")}
            value={currentRank.groupName}
          />
          <RankMetric label={rankNumber} value={currentRank.level} />
        </div>
      </article>

      <article className="rounded-lg border border-white/14 bg-white p-6 text-ink shadow-soft sm:p-8 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-steel">
              {t("dashboard.welcome.progressLabel")}
            </p>
            <p className="mt-2 text-4xl font-semibold">{rankProgress.percent}%</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-signal text-ink">
            <Medal className="h-7 w-7" />
          </div>
        </div>
        <div className="mt-7 h-4 overflow-hidden rounded-full bg-[#e5ece8]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
            style={{ width: `${rankProgress.percent}%` }}
          />
        </div>
        <div className="mt-5 flex items-center justify-between text-sm font-semibold text-steel">
          <span>{currentRank.name}</span>
          <span>{nextRank.name}</span>
        </div>
        <button
          type="button"
          onClick={resetProgress}
          className="mt-6 w-full rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
        >
          {t("dashboard.welcome.resetProgress")}
        </button>
      </article>
    </div>
  );
}

function RankMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function DailyVoyageCard() {
  const { t } = useI18n();
  const { dailyVoyage } = usePlayerProgress();
  const progressLabel = t("dashboard.dailyVoyage.progress")
    .replace("{completed}", String(dailyVoyage.completedCount))
    .replace("{total}", String(dailyVoyage.totalCount));

  return (
    <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-tide to-glass text-white">
            <Route className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-ink">{t("dashboard.dailyVoyage.title")}</h2>
              <span className="rounded-lg bg-signal/22 px-2.5 py-1 text-xs font-bold text-ink">
                {t("dashboard.dailyVoyage.reward")}
              </span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-steel">
              {t("dashboard.dailyVoyage.description")}
            </p>
            <div className="mt-4 max-w-xl">
              <div className="flex items-center justify-between text-sm font-bold text-steel">
                <span>{progressLabel}</span>
                <span>{dailyVoyage.progressPercent}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e5ece8]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
                  style={{ width: `${dailyVoyage.progressPercent}%` }}
                />
              </div>
              {dailyVoyage.isComplete ? (
                <p className="mt-3 text-sm font-bold text-tide">
                  {t("dashboard.dailyVoyage.completed")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <a
          href="/daily-voyage"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
        >
          {t("dashboard.dailyVoyage.button")} <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

function VoyageLogCard() {
  const { t } = useI18n();
  const { voyageLog } = usePlayerProgress();
  const currentLabel = t("dashboard.voyageLog.days").replace(
    "{days}",
    String(voyageLog.currentVoyage)
  );
  const longestLabel = t("dashboard.voyageLog.days").replace(
    "{days}",
    String(voyageLog.longestVoyage)
  );
  const nextMilestoneLabel = t("dashboard.voyageLog.days").replace(
    "{days}",
    String(voyageLog.nextMilestone.days)
  );

  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-tide/10 px-3 py-2 text-sm font-bold text-tide">
            <CalendarDays className="h-4 w-4" />
            {t("dashboard.voyageLog.title")}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            {t("dashboard.voyageLog.headline")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            {t("dashboard.voyageLog.body")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <VoyageLogMetric
            label={t("dashboard.voyageLog.current")}
            value={currentLabel}
            Icon={Ship}
          />
          <VoyageLogMetric
            label={t("dashboard.voyageLog.longest")}
            value={longestLabel}
            Icon={Trophy}
          />
          <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-steel">
                  {t("dashboard.voyageLog.nextMilestone")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {nextMilestoneLabel}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-signal/24 text-ink">
                <Milestone className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
                style={{ width: `${voyageLog.milestoneProgressPercent}%` }}
              />
            </div>
            <a
              href="/voyage-log"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-tide"
            >
              {t("dashboard.voyageLog.viewLog")}
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function VoyageLogMetric({
  label,
  value,
  Icon
}: {
  label: string;
  value: string;
  Icon: typeof Ship;
}) {
  return (
    <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-steel">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-tide/10 text-tide">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function WatchDutyCard({ tasks }: { tasks: string[] }) {
  const { t } = useI18n();

  return (
    <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">{t("dashboard.watchDuty.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-steel">{t("dashboard.watchDuty.subtitle")}</p>
        </div>
        <Waves className="h-6 w-6 text-tide" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {tasks.map((task, index) => (
          <div key={task} className="flex items-center gap-3 rounded-lg border border-ink/8 bg-[#f6f8f3] p-3">
            <span
              className={`grid h-5 w-5 place-items-center rounded border ${
                index < 2 ? "border-tide bg-tide text-white" : "border-steel/36 bg-white"
              }`}
            >
              {index < 2 ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <span className="text-sm font-semibold text-ink">{task}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function MissionDeck({ missions }: { missions: string[][] }) {
  const { t } = useI18n();
  const {
    cargoMatchCompleted,
    shipLogRepairCompleted,
    radioCheckCompleted
  } = usePlayerProgress();

  return (
    <section id="missions" className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold text-ink">{t("dashboard.missions.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-steel">{t("dashboard.missions.subtitle")}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {missions.map(([title, description, difficulty, xp], index) => {
          const Icon = missionIcons[index] ?? Sparkles;
          const missionHref =
            index === 0
              ? "/missions/cargo-match"
              : index === 1
                ? "/missions/ship-log-repair"
              : index === 2
                ? "/missions/radio-check"
                : null;
          const isCompletedToday =
            (index === 0 && cargoMatchCompleted) ||
            (index === 1 && shipLogRepairCompleted) ||
            (index === 2 && radioCheckCompleted);

          return (
            <article
              key={title}
              className="relative rounded-lg border border-ink/8 bg-[#f7f9f4] p-5 transition hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isCompletedToday ? (
                    <span className="rounded-lg bg-tide/12 px-2.5 py-1 text-xs font-bold text-tide">
                      {t("dashboard.missions.completedToday")}
                    </span>
                  ) : null}
                  <span className="rounded-lg bg-signal/24 px-2.5 py-1 text-xs font-bold text-ink">
                    {xp}
                  </span>
                </div>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-steel">{description}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
                  {t("dashboard.missions.difficulty")}: {difficulty}
                </div>
                {missionHref ? (
                  <a
                    href={missionHref}
                    className="relative z-10 rounded-lg bg-tide px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
                  >
                    {t("dashboard.missions.start")}
                  </a>
                ) : (
                  <button className="rounded-lg bg-tide px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor">
                    {t("dashboard.missions.start")}
                  </button>
                )}
              </div>
              {missionHref ? (
                <a
                  href={missionHref}
                  aria-label={`${title} ${t("dashboard.missions.start")}`}
                  className="absolute inset-0 z-0 rounded-lg"
                />
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RankPath() {
  const { t } = useI18n();
  const { xp, rankIndex } = usePlayerProgress();
  const ranks = getNearbyRanks(xp);

  return (
    <section id="career" className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">{t("dashboard.rankPath.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-steel">{t("dashboard.rankPath.subtitle")}</p>
        </div>
        <Map className="h-6 w-6 text-tide" />
      </div>

      <div className="mt-6 space-y-3">
        {ranks.map((rank) => {
          const isCurrent = rank.index === rankIndex;
          const isCompleted = rank.index < rankIndex;

          return (
            <div
              key={rank.index}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                isCurrent
                  ? "border-signal bg-signal/18"
                  : "border-ink/8 bg-[#f6f8f3]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${
                    isCurrent
                      ? "bg-signal text-ink"
                      : isCompleted
                        ? "bg-tide text-white"
                        : "bg-white text-steel"
                  }`}
                >
                  {rank.index}
                </span>
                <div>
                  <span className="font-semibold text-ink">{rank.name}</span>
                  <p className="mt-1 text-xs font-semibold text-steel">
                    {rank.xpRequired} XP
                  </p>
                </div>
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
                {isCurrent
                  ? t("dashboard.rankPath.current")
                  : isCompleted
                    ? t("dashboard.rankPath.completed")
                    : t("dashboard.rankPath.locked")}
              </span>
            </div>
          );
        })}
      </div>
      <a
        href="/career"
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
      >
        {t("dashboard.rankPath.viewFull")}
      </a>
    </section>
  );
}
