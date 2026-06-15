"use client";

import { useEffect, useState } from "react";
import {
  Anchor,
  Archive,
  Boxes,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  Compass,
  Gauge,
  GraduationCap,
  HelpCircle,
  Map,
  Medal,
  Milestone,
  PackagePlus,
  Radio,
  Route,
  Ship,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  Waves
} from "lucide-react";
import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { RecentCareerLogCard } from "@/components/career-log/CareerLog";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { academyModules, getUnlockedAcademyModules } from "@/lib/academy";
import {
  dailyVoyageRewardNm,
  getDailyVoyageStatus,
  getNextVoyageCountdown,
  type DailyVoyageStatus
} from "@/lib/daily-voyage";
import {
  getContinueVoyageAssignment,
  type ContinueVoyageAssignment
} from "@/lib/continue-voyage";
import {
  cargoStudyRewardNm,
  getCargoStorageOverview,
  type CargoHold
} from "@/lib/cargo-storage";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";
import { getNearbyRanksByIndex, TOTAL_MICRO_RANKS } from "@/lib/ranks";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

const missionIcons = [Boxes, ClipboardCheck, Radio, HelpCircle];

export function LearnerDashboard() {
  const { list } = useI18n();
  const tasks = list<string[]>("dashboard.watchDuty.tasks");
  const missions = list<string[][]>("dashboard.missions.items");

  return (
    <main className="min-h-screen bg-[#f3f6f1] text-ink">
      <DashboardHeader />

      <section className="relative overflow-hidden bg-ink pb-16 pt-8 text-white sm:pb-20 lg:pb-24">
        <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-10" />
        <div className="absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-tide/24 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#f3f6f1] to-transparent" />

        <div className="section-shell relative">
          <WelcomePanel />
        </div>
      </section>

      <section className="section-shell -mt-10 pb-8 sm:-mt-12 sm:pb-10 lg:-mt-14 lg:pb-12">
        <ContinueVoyageCard />

        <div className="mt-6">
          <BridgeOverviewCards />
        </div>

        <div className="mt-6">
          <CargoStorageDashboardCard />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <DailyVoyageCard />
          <PromotionLadderCard />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <ShipAcademyCard />
          <RecentCareerLogCard />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <VoyageLogCard />
          <WatchDutyCard tasks={tasks} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <MissionDeck missions={missions} />
          <RankPath />
        </div>

        <CareerActions />
      </section>
    </main>
  );
}

function DashboardHeader() {
  const { t, locale } = useI18n();

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
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/cargo-storage">
            Cargo Storage
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/voyage-log">
            {t("dashboard.nav.voyageLog")}
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/career-log">
            {locale === "tr" ? "Seyir Defteri" : "Career Log"}
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/promotion-ladder">
            {locale === "tr" ? "Terfi Merdiveni" : "Promotion Ladder"}
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/academy">
            {t("dashboard.nav.academy")}
          </a>
          <AuthHeaderActions
            dashboardLabel={t("dashboard.nav.bridge")}
            loginLabel={t("dashboard.nav.login")}
            registerLabel={t("dashboard.nav.register")}
            profileLabel={t("dashboard.nav.profile")}
            logoutLabel={t("dashboard.nav.logout")}
            compact
          />
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
  const { t, locale } = useI18n();
  const displayName = useDashboardUserName();
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
  const careerCompletion = Math.min(
    100,
    Number(((rankIndex / TOTAL_MICRO_RANKS) * 100).toFixed(1))
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
      <article className="dark-glass-panel rounded-lg p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
            <Anchor className="h-4 w-4 text-signal" />
            {t("dashboard.welcome.eyebrow")}
          </div>
          <DashboardUserBadge displayName={displayName} />
        </div>
        <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
          {locale === "tr"
            ? `Tekrar hos geldin, ${displayName}`
            : `Welcome back, ${displayName}`}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
          {locale === "tr"
            ? "Kariyer Koprun hazir. Bugunku sefer, terfi rotan ve akademi ilerlemen burada."
            : "Your Career Bridge is ready. Today's voyage, promotion route and academy progress are lined up."}
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
          <div className="rounded-lg border border-white/12 bg-white/8 p-4">
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-[0.16em] text-white/42">
                {t("dashboard.welcome.xp")}
              </p>
              <div className="group relative">
                <button
                  type="button"
                  aria-label="NM = Nautical Miles"
                  className="grid h-5 w-5 place-items-center rounded-full border border-white/14 bg-white/10 text-white/58 transition hover:text-white"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-7 z-20 w-64 -translate-x-1/2 rounded-lg border border-white/14 bg-ink p-3 text-left text-xs font-semibold leading-5 text-white opacity-0 shadow-glow transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <p className="text-signal">NM = Nautical Miles</p>
                  <p className="mt-1 text-white/70">
                    Earn NM by completing missions, academy lessons and promotions.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xl font-semibold text-white">{xp}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <RankMetric
            label={t("dashboard.welcome.majorGroup")}
            value={currentRank.groupName}
          />
          <RankMetric label={rankNumber} value={currentRank.level} />
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href="/daily-voyage"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-5 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
          >
            {t("dashboard.dailyVoyage.button")}
            <ChevronRight className="h-4 w-4" />
          </a>
          <a
            href="/promotion-ladder"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/16 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/16"
          >
            {locale === "tr" ? "Terfi Merdiveni" : "Promotion Ladder"}
            <Medal className="h-4 w-4" />
          </a>
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
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
              {locale === "tr" ? "Kariyer Tamamlama" : "Career Completion"}
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {careerCompletion}%
            </p>
          </div>
          <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
              {locale === "tr" ? "Terfiye Kalan" : "NM Remaining"}
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {Math.max(0, nextRank.xpRequired - xp)} NM
            </p>
          </div>
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

function useDashboardUserName() {
  const fallbackName = "Cadet";
  const [displayName, setDisplayName] = useState(fallbackName);

  useEffect(() => {
    let isActive = true;

    async function loadDashboardUser() {
      const config = getSupabaseConfigStatus();

      if (!config.isConfigured) {
        if (isActive) {
          setDisplayName(fallbackName);
        }
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
          if (isActive) {
            setDisplayName(fallbackName);
          }
          return;
        }

        await ensureUserProfile();

        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle();
        const username =
          typeof profile?.username === "string" ? profile.username.trim() : "";
        const email = typeof user.email === "string" ? user.email : "";

        if (isActive) {
          setDisplayName(username || email || fallbackName);
        }
      } catch {
        if (isActive) {
          setDisplayName(fallbackName);
        }
      }
    }

    void loadDashboardUser();

    return () => {
      isActive = false;
    };
  }, []);

  return displayName;
}

function DashboardUserBadge({ displayName }: { displayName: string }) {
  const { locale } = useI18n();

  return (
    <div className="inline-flex w-fit items-center gap-3 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-signal text-ink">
        <UserRound className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-[0.14em] text-white/44">
          {locale === "tr" ? "Kariyer Koprusu" : "Career Bridge"}
        </span>
        <span className="block max-w-48 truncate">{displayName}</span>
      </span>
    </div>
  );
}

function BridgeOverviewCards() {
  const { t, locale } = useI18n();
  const {
    xp,
    currentRank,
    nextRank,
    rankIndex,
    rankProgress,
    dailyVoyage
  } = usePlayerProgress();
  const nmRemaining = Math.max(0, nextRank.xpRequired - xp);
  const careerCompletion = Math.min(
    100,
    Number(((rankIndex / TOTAL_MICRO_RANKS) * 100).toFixed(1))
  );
  const missionProgress = `${dailyVoyage.completedCount}/${dailyVoyage.totalCount}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <BridgeMetricCard
        Icon={Gauge}
        label={t("dashboard.welcome.xp")}
        value={`${xp} NM`}
        detail={
          locale === "tr"
            ? `${rankProgress.percent}% sonraki terfiye`
            : `${rankProgress.percent}% to next promotion`
        }
        percent={rankProgress.percent}
        tone="tide"
      />
      <BridgeMetricCard
        Icon={Medal}
        label={t("dashboard.welcome.currentRank")}
        value={currentRank.name}
        detail={`Rank ${rankIndex} / ${TOTAL_MICRO_RANKS}`}
        tone="ink"
      />
      <BridgeMetricCard
        Icon={Compass}
        label={locale === "tr" ? "Sonraki Terfi" : "Next Promotion"}
        value={nextRank.name}
        detail={
          locale === "tr"
            ? `${nmRemaining} NM kaldi`
            : `${nmRemaining} NM remaining`
        }
        tone="signal"
      />
      <BridgeMetricCard
        Icon={Trophy}
        label={locale === "tr" ? "Kariyer Tamamlama" : "Career Completion"}
        value={`${careerCompletion}%`}
        detail={
          locale === "tr"
            ? `Bugunku sefer: ${missionProgress}`
            : `Today's voyage: ${missionProgress}`
        }
        percent={careerCompletion}
        tone="glass"
      />
    </div>
  );
}

function BridgeMetricCard({
  Icon,
  label,
  value,
  detail,
  percent,
  tone
}: {
  Icon: typeof Ship;
  label: string;
  value: string;
  detail: string;
  percent?: number;
  tone: "tide" | "ink" | "signal" | "glass";
}) {
  const iconClasses = {
    tide: "bg-tide/10 text-tide",
    ink: "bg-ink text-white",
    signal: "bg-signal/28 text-ink",
    glass: "bg-glass/14 text-tide"
  }[tone];
  const progressClasses = {
    tide: "from-tide via-glass to-signal",
    ink: "from-ink via-harbor to-tide",
    signal: "from-signal via-glass to-tide",
    glass: "from-glass via-tide to-signal"
  }[tone];

  return (
    <article className="rounded-lg border border-ink/8 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-steel">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-semibold text-ink">
            {value}
          </p>
        </div>
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${iconClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-steel">{detail}</p>
      {typeof percent === "number" ? (
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e5ece8]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressClasses}`}
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      ) : null}
    </article>
  );
}

function CargoStorageDashboardCard() {
  const { locale } = useI18n();
  const [holds, setHolds] = useState<CargoHold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const latestHold = holds[0] ?? null;
  const totalItems = holds.reduce((total, hold) => total + hold.itemCount, 0);

  useEffect(() => {
    let isActive = true;

    async function loadCargoHolds() {
      const overview = await getCargoStorageOverview();

      if (isActive) {
        setHolds(overview.holds);
        setIsLoading(false);
      }
    }

    void loadCargoHolds();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-tide/10 px-3 py-2 text-sm font-bold text-tide">
            <Archive className="h-4 w-4" />
            Cargo Storage
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            {locale === "tr" ? "Recent Cargo Holds" : "Recent Cargo Holds"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            {locale === "tr"
              ? "Kelime manifestonu duzenle, Cargo Item ekle ve tamamlanan calisma oturumlarindan NM kazan."
              : "Organize your vocabulary manifest, load Cargo Items and earn NM from completed study sessions."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-lg bg-signal/24 px-2.5 py-1 text-ink">
              +{cargoStudyRewardNm} NM per session
            </span>
            <span className="rounded-lg bg-ink/5 px-2.5 py-1 text-steel">
              {totalItems} Cargo Items
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-steel">
                {locale === "tr" ? "Continue Studying" : "Continue Studying"}
              </p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {isLoading
                  ? "Loading manifest..."
                  : latestHold?.title ?? "Load your first Cargo Hold"}
              </p>
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-white">
              <PackagePlus className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {holds.slice(0, 3).map((hold) => (
              <a
                key={hold.id}
                href={`/cargo-storage/${hold.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink/8 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:border-tide/30"
              >
                <span className="truncate">{hold.title}</span>
                <span className="shrink-0 text-xs text-steel">
                  {hold.itemCount} cargo
                </span>
              </a>
            ))}
            {!isLoading && holds.length === 0 ? (
              <div className="rounded-lg border border-ink/8 bg-white p-3 text-sm font-semibold text-steel">
                {locale === "tr"
                  ? "Henuz Cargo Hold yok. Ilk manifestonu olustur."
                  : "No Cargo Holds yet. Create your first manifest."}
              </div>
            ) : null}
          </div>

          <a
            href={latestHold ? `/cargo-storage/${latestHold.id}` : "/cargo-storage"}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            {latestHold
              ? locale === "tr"
                ? "Review Cargo"
                : "Review Cargo"
              : locale === "tr"
                ? "Load Cargo"
                : "Load Cargo"}
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ContinueVoyageCard() {
  const { locale } = useI18n();
  const [assignment, setAssignment] = useState<ContinueVoyageAssignment | null>(
    null
  );

  useEffect(() => {
    let isActive = true;

    async function loadAssignment() {
      const nextAssignment = await getContinueVoyageAssignment();

      if (isActive) {
        setAssignment(nextAssignment);
      }
    }

    void loadAssignment();

    return () => {
      isActive = false;
    };
  }, []);

  const progressPercent = assignment?.progressPercent ?? 0;
  const isAssessment = assignment?.kind === "promotion-assessment";
  const title =
    assignment?.missionTitle ??
    (locale === "tr" ? "Siradaki gorev hazirlaniyor" : "Preparing next assignment");
  const moduleTitle = assignment?.moduleTitle ?? "Harbor Basics";
  const stepLabel =
    assignment?.stepLabel ?? (locale === "tr" ? "Next Assignment" : "Next Assignment");
  const buttonLabel = assignment
    ? localizeButtonLabel(assignment.buttonLabel, locale)
    : locale === "tr"
      ? "Yukleniyor"
      : "Loading";

  return (
    <section className="relative overflow-hidden rounded-lg border border-ink/8 bg-gradient-to-br from-ink via-harbor to-[#123d4a] p-6 text-white shadow-soft sm:p-8">
      <div className="absolute inset-0 bg-chart-grid bg-[size:42px_42px] opacity-10" />
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-tide/24 blur-3xl" />
      <div className="absolute -bottom-28 left-10 h-56 w-56 rounded-full bg-signal/12 blur-3xl" />

      <div className="relative grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-bold text-white/82">
            <Compass className="h-4 w-4 text-signal" />
            {locale === "tr" ? "Continue Voyage" : "Continue Voyage"}
          </div>
          <h2 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            {isAssessment
              ? locale === "tr"
                ? "Ready for Promotion Assessment"
                : "Ready for Promotion Assessment"
              : title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
            {assignment?.body ??
              (locale === "tr"
                ? "Kariyer rotan hesaplaniyor. Bir sonraki en iyi adim birazdan hazir olacak."
                : "Your career route is being calculated. The next best action will be ready shortly.")}
          </p>

          {assignment?.error ? (
            <p className="mt-4 max-w-2xl rounded-lg border border-white/14 bg-white/10 p-3 text-sm font-semibold text-white/66">
              {assignment.isAuthenticated
                ? assignment.error
                : locale === "tr"
                  ? "Giris yapinca ilerlemen Supabase ile senkronlanir."
                  : "Sign in to sync this assignment with Supabase."}
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-white/14 bg-white p-5 text-ink shadow-glow sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <ContinueMetric
              Icon={GraduationCap}
              label={locale === "tr" ? "Current Academy Module" : "Current Academy Module"}
              value={moduleTitle}
            />
            <ContinueMetric
              Icon={Route}
              label={locale === "tr" ? "Current Mission" : "Current Mission"}
              value={stepLabel}
            />
            <ContinueMetric
              Icon={Clock3}
              label={locale === "tr" ? "Estimated Time" : "Estimated Time"}
              value={`${assignment?.estimatedMinutes ?? 3} minutes`}
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-bold text-steel">
              <span>{locale === "tr" ? "Progress" : "Progress"}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#e5ece8]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <a
            href={assignment?.href ?? "/academy/harbor-basics"}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            {buttonLabel}
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ContinueMetric({
  Icon,
  label,
  value
}: {
  Icon: typeof Ship;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-tide/10 text-tide">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-steel">
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function localizeButtonLabel(label: string, locale: "en" | "tr") {
  if (locale === "en") {
    return label;
  }

  const labels: Record<string, string> = {
    Continue: "Devam Et",
    "Resume Training": "Egitime Devam Et",
    "Start Assessment": "Assessment Baslat"
  };

  return labels[label] ?? label;
}

function PromotionLadderCard() {
  const { locale } = useI18n();
  const { xp, currentRank, nextRank, rankIndex, rankProgress } =
    usePlayerProgress();
  const nmRemaining = Math.max(0, nextRank.xpRequired - xp);
  const careerCompletion = Math.min(
    100,
    Number(((rankIndex / TOTAL_MICRO_RANKS) * 100).toFixed(1))
  );

  return (
    <article className="relative overflow-hidden rounded-lg border border-ink/8 bg-gradient-to-br from-ink via-harbor to-[#123d4a] p-6 text-white shadow-soft">
      <div className="absolute inset-0 bg-chart-grid bg-[size:38px_38px] opacity-10" />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-tide/24 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-bold text-white/82">
              <Compass className="h-4 w-4 text-signal" />
              {locale === "tr" ? "Terfi Rotasi" : "Promotion Route"}
            </div>
            <h2 className="mt-4 text-2xl font-semibold">
              {locale === "tr" ? "Bir sonraki rütbeye tirman" : "Climb toward your next rank"}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/68">
              {locale === "tr"
                ? "Kariyer merdiveninde konumunu, kalan NM miktarini ve toplam ilerlemeyi takip et."
                : "Track your position, remaining NM and total career progress on the maritime ladder."}
            </p>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-signal text-ink">
            <Medal className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <DarkMetric
            label={locale === "tr" ? "Mevcut Rütbe" : "Current Rank"}
            value={currentRank.name}
          />
          <DarkMetric
            label={locale === "tr" ? "Sonraki Rütbe" : "Next Rank"}
            value={nextRank.name}
          />
          <DarkMetric
            label={locale === "tr" ? "Kalan NM" : "NM Remaining"}
            value={`${nmRemaining}`}
          />
        </div>

        <div className="mt-6 rounded-lg border border-white/14 bg-white/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-white/74">
            <span>
              {locale === "tr" ? "Terfi Ilerlemesi" : "Promotion Progress"}
            </span>
            <span>{rankProgress.percent}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/14">
            <div
              className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
              style={{ width: `${rankProgress.percent}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-white/62">
            <span>
              {locale === "tr" ? "Kariyer" : "Career"} {rankIndex} / {TOTAL_MICRO_RANKS}
            </span>
            <span>{careerCompletion}%</span>
          </div>
        </div>

        <a
          href="/promotion-ladder"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-signal px-5 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
        >
          {locale === "tr" ? "Terfi Merdivenini Gor" : "View Promotion Ladder"}
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/42">
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function CareerActions() {
  const { locale } = useI18n();

  return (
    <section className="mt-6 grid gap-6 md:grid-cols-2">
      <CareerActionCard
        Icon={Medal}
        title={locale === "tr" ? "Terfi Merdiveni" : "Promotion Ladder"}
        body={
          locale === "tr"
            ? "250 rutbelik kariyer yolunda nerede oldugunu ve yukariya nasil tirmandigini gor."
            : "See where you stand across the 250-rank career path and how you climb upward."
        }
        href="/promotion-ladder"
        buttonLabel={
          locale === "tr" ? "Terfi Merdivenini Gor" : "View Promotion Ladder"
        }
      />
      <CareerActionCard
        Icon={UserRound}
        title="Captain Profile"
        body={
          locale === "tr"
            ? "Rank rozetini, kariyer zaman cizelgeni ve ogrenen denizci kimligini incele."
            : "Review your rank badge, career timeline and learning captain identity."
        }
        href="/profile"
        buttonLabel={locale === "tr" ? "Captain Profile'a Git" : "Open Captain Profile"}
      />
    </section>
  );
}

function CareerActionCard({
  Icon,
  title,
  body,
  href,
  buttonLabel
}: {
  Icon: typeof Ship;
  title: string;
  body: string;
  href: string;
  buttonLabel: string;
}) {
  return (
    <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ink text-white">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-steel">{body}</p>
        </div>
      </div>
      <a
        href={href}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-tide px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
      >
        {buttonLabel}
        <ChevronRight className="h-4 w-4" />
      </a>
    </article>
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
  const { t, locale } = useI18n();
  const { dailyVoyage } = usePlayerProgress();
  const [voyageStatus, setVoyageStatus] = useState<DailyVoyageStatus | null>(null);
  const [countdown, setCountdown] = useState(getNextVoyageCountdown().label);
  const completedCount = voyageStatus?.completedCount ?? dailyVoyage.completedCount;
  const totalCount = voyageStatus?.totalCount ?? 3;
  const progressPercent = voyageStatus?.progressPercent ?? dailyVoyage.progressPercent;
  const isComplete = voyageStatus?.isComplete ?? dailyVoyage.isComplete;
  const rewardClaimed = voyageStatus?.rewardClaimed === true;
  const progressLabel = t("dashboard.dailyVoyage.progress")
    .replace("{completed}", String(completedCount))
    .replace("{total}", String(totalCount));

  useEffect(() => {
    let isActive = true;

    async function loadVoyageStatus() {
      const nextStatus = await getDailyVoyageStatus();

      if (isActive) {
        setVoyageStatus(nextStatus);
      }
    }

    void loadVoyageStatus();

    const intervalId = window.setInterval(() => {
      setCountdown(getNextVoyageCountdown().label);
    }, 1000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-tide to-glass text-white">
            <Route className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-ink">
                {locale === "tr" ? "Bugunun Seferi" : "Today's Voyage"}
              </h2>
              <span className="rounded-lg bg-signal/22 px-2.5 py-1 text-xs font-bold text-ink">
                +{dailyVoyageRewardNm} Bonus NM
              </span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-steel">
              {locale === "tr"
                ? "Gunluk kontrolleri tamamla, bonus NM kazan ve yarin yeni rota icin geri don."
                : "Complete the daily operating checks, earn bonus NM, and return tomorrow for a new route."}
            </p>
            <div className="mt-4 max-w-xl">
              <div className="flex items-center justify-between text-sm font-bold text-steel">
                <span>{progressLabel}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e5ece8]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-lg bg-ink/5 px-2.5 py-1 text-steel">
                  {locale === "tr" ? "Sonraki sefer" : "Next voyage"}: {countdown}
                </span>
                {isComplete ? (
                  <span className="rounded-lg bg-tide/12 px-2.5 py-1 text-tide">
                    {rewardClaimed
                      ? locale === "tr"
                        ? "Odul alindi"
                        : "Reward claimed"
                      : locale === "tr"
                        ? "Odul hazir"
                        : "Reward ready"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <a
          href="/daily-voyage"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
        >
          {locale === "tr" ? "Devam Et" : "Continue"} <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

function ShipAcademyCard() {
  const { t, locale } = useI18n();
  const { rankIndex } = usePlayerProgress();
  const unlockedModules = getUnlockedAcademyModules(rankIndex);
  const progressPercent = Math.floor(
    (unlockedModules.length / academyModules.length) * 100
  );

  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-signal/24 px-3 py-2 text-sm font-bold text-ink">
            <GraduationCap className="h-4 w-4" />
            {t("dashboard.academy.title")}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            {t("dashboard.academy.headline")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            {t("dashboard.academy.description")}
          </p>
        </div>

        <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-steel">
                {t("dashboard.academy.unlocked")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {t("dashboard.academy.moduleCount")
                  .replace("{count}", String(unlockedModules.length))
                  .replace("{total}", String(academyModules.length))}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href="/academy/harbor-basics"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
            >
              {locale === "tr"
                ? "Harbor Basics'e Devam Et"
                : "Continue Harbor Basics"}
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="/academy"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm font-bold text-tide transition hover:-translate-y-0.5 hover:border-tide/30"
            >
              {t("dashboard.academy.button")}
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
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
  const { t, locale } = useI18n();
  const { rankIndex } = usePlayerProgress();
  const ranks = getNearbyRanksByIndex(rankIndex);

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
                    {rank.xpRequired} NM
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
      <a
        href="/promotion-ladder"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-tide px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
      >
        {locale === "tr" ? "Terfi Merdivenini Gor" : "View Promotion Ladder"}
        <ChevronRight className="h-4 w-4" />
      </a>
    </section>
  );
}
