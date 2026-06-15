"use client";

import {
  Activity,
  Anchor,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock3,
  Compass,
  GraduationCap,
  Lock,
  Map,
  Medal,
  Ship,
  Sparkles,
  Star,
  Trophy,
  UserRound
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

type CareerTimelineItem = {
  rank: number;
  label?: string;
  status: "completed" | "current" | "locked";
};

type ProfileStat = {
  label: string;
  value: string;
};

type CareerActivity = {
  title: string;
  detail: string;
};

type CareerProfileData = {
  username: string;
  joinDate: string;
  currentRank: string;
  rankIndex: number;
  totalRanks: number;
  careerCompletionPercentage: number;
  nextRank: string;
  requiredXp: number;
  currentXp: number;
  remainingXp: number;
  stats: ProfileStat[];
  activities: CareerActivity[];
};

const profileData: CareerProfileData = {
  username: "Ekrem",
  joinDate: "March 2026",
  currentRank: "Third Officer",
  rankIndex: 78,
  totalRanks: 250,
  careerCompletionPercentage: 31,
  nextRank: "Second Officer",
  requiredXp: 15000,
  currentXp: 14580,
  remainingXp: 420,
  stats: [
    { label: "Words Learned", value: "1,240" },
    { label: "Flashcards Reviewed", value: "4,850" },
    { label: "Quiz Accuracy", value: "87%" },
    { label: "Study Streak", value: "24 Days" },
    { label: "Academy Lessons Completed", value: "18" }
  ],
  activities: [
    { title: "+50 NM earned", detail: "Daily progress added to your career log" },
    { title: "Completed Maritime Academy Lesson 4", detail: "Training record updated" },
    { title: "Unlocked Rank 78", detail: "Third Officer status confirmed" },
    { title: "Studied 120 flashcards", detail: "Vocabulary cargo reviewed" },
    { title: "Completed Radio Check mission", detail: "Listening transmission cleared" }
  ]
};

const statIcons = [Sparkles, Compass, BarChart3, CalendarDays, GraduationCap];

function buildTimeline(data: CareerProfileData): CareerTimelineItem[] {
  const completedRanks = Array.from({ length: 5 }, (_, index) => ({
    rank: data.rankIndex - 5 + index,
    status: "completed" as const
  }));
  const currentRank = {
    rank: data.rankIndex,
    label: data.currentRank,
    status: "current" as const
  };
  const nextRanks = Array.from({ length: 10 }, (_, index) => ({
    rank: data.rankIndex + index + 1,
    status: "locked" as const
  }));

  return [...completedRanks, currentRank, ...nextRanks];
}

export function CareerProfile() {
  const timeline = buildTimeline(profileData);
  const xpProgress = Math.floor(
    (profileData.currentXp / profileData.requiredXp) * 100
  );

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
              Dashboard
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
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <ProfileCard data={profileData} />
              <CareerProgress data={profileData} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <aside className="grid gap-6">
            <NextRankCard data={profileData} progress={xpProgress} />
            <MotivationCard data={profileData} />
            <StatsGrid stats={profileData.stats} />
          </aside>

          <div className="grid gap-6">
            <CareerTimeline items={timeline} />
            <RecentActivities activities={profileData.activities} />
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileCard({ data }: { data: CareerProfileData }) {
  return (
    <section>
      <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
        <Anchor className="h-4 w-4 text-signal" />
        Captain Profile
      </div>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-tide via-glass to-signal text-3xl font-semibold text-white shadow-soft">
          {data.username.slice(0, 1)}
          <span className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-lg border border-white/30 bg-ink text-signal">
            <Medal className="h-5 w-5" />
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            {data.username}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-white/70">
            <span className="rounded-lg border border-white/12 bg-white/8 px-3 py-2">
              Joined {data.joinDate}
            </span>
            <span className="rounded-lg border border-white/12 bg-white/8 px-3 py-2">
              Rank {data.rankIndex} / {data.totalRanks}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <DarkMetric label="Current Rank" value={data.currentRank} />
        <DarkMetric label="Rank Badge" value="Third Officer Badge" />
      </div>
    </section>
  );
}

function CareerProgress({ data }: { data: CareerProfileData }) {
  return (
    <section className="rounded-lg border border-white/12 bg-white/8 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white/58">Career Progress</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            {data.careerCompletionPercentage}% Complete
          </h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-signal text-ink">
          <Trophy className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/14">
        <div
          className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
          style={{ width: `${data.careerCompletionPercentage}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DarkMetric label="Current Rank" value={data.currentRank} />
        <DarkMetric label="Total Rank Count" value={String(data.totalRanks)} />
        <DarkMetric label="Rank Number" value={String(data.rankIndex)} />
      </div>
    </section>
  );
}

function NextRankCard({
  data,
  progress
}: {
  data: CareerProfileData;
  progress: number;
}) {
  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-steel">Next Rank</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{data.nextRank}</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-tide/10 text-tide">
          <Star className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#e5ece8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3">
        <InfoRow label="Required NM" value={data.requiredXp.toLocaleString()} />
        <InfoRow label="Current NM" value={data.currentXp.toLocaleString()} />
        <InfoRow label="Remaining NM" value={data.remainingXp.toLocaleString()} />
      </div>
    </section>
  );
}

function StatsGrid({ stats }: { stats: ProfileStat[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      {stats.map((stat, index) => {
        const Icon = statIcons[index] ?? Activity;

        return (
          <article
            key={stat.label}
            className="rounded-lg border border-ink/8 bg-white p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-steel">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{stat.value}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-tide/10 text-tide">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function CareerTimeline({ items }: { items: CareerTimelineItem[] }) {
  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Career Timeline</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Your recent promotions and upcoming maritime career route.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/promotion-ladder"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-tide px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            View Promotion Ladder
            <ChevronRight className="h-4 w-4" />
          </a>
          <a
            href="/career"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            View Full Career Map
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mt-7 space-y-3">
        {items.map((item) => (
          <TimelineRow key={`${item.rank}-${item.status}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function TimelineRow({ item }: { item: CareerTimelineItem }) {
  const isCompleted = item.status === "completed";
  const isCurrent = item.status === "current";
  const Icon = isCompleted ? CheckCircle : isCurrent ? Star : Lock;

  return (
    <div
      className={`relative flex items-center gap-4 rounded-lg border p-4 ${
        isCurrent
          ? "border-signal bg-signal/16"
          : isCompleted
            ? "border-tide/18 bg-tide/8"
            : "border-ink/8 bg-[#f6f8f3]"
      }`}
    >
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
          isCurrent
            ? "bg-signal text-ink"
            : isCompleted
              ? "bg-tide text-white"
              : "bg-white text-steel"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-ink">
          Rank {item.rank}
          {item.label ? ` - ${item.label}` : ""}
        </p>
        <p className="mt-1 text-sm font-semibold text-steel">
          {isCurrent ? "Current command post" : isCompleted ? "Completed" : "Locked"}
        </p>
      </div>
    </div>
  );
}

function RecentActivities({ activities }: { activities: CareerActivity[] }) {
  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Recent Activities</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Latest entries from your career record.
          </p>
        </div>
        <Clock3 className="h-6 w-6 text-tide" />
      </div>

      <div className="mt-6 grid gap-3">
        {activities.map((activity) => (
          <article
            key={activity.title}
            className="flex items-center gap-4 rounded-lg border border-ink/8 bg-[#f6f8f3] p-4"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-ink">{activity.title}</h3>
              <p className="mt-1 text-sm font-semibold text-steel">
                {activity.detail}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MotivationCard({ data }: { data: CareerProfileData }) {
  return (
    <section className="rounded-lg border border-ink/8 bg-ink p-6 text-white shadow-soft">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/10 text-signal">
          <Map className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Career Signal</h2>
          <p className="mt-3 text-sm leading-6 text-white/68">
            You have sailed further than {data.careerCompletionPercentage}% of your
            journey. Keep moving toward Captain Rank.
          </p>
        </div>
      </div>
    </section>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/42">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-ink/8 bg-[#f6f8f3] p-3">
      <span className="text-sm font-semibold text-steel">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </div>
  );
}
