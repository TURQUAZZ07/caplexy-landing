"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Anchor,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Medal,
  ScrollText,
  Ship,
  Sparkles
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
  getCareerEvents,
  type CareerEvent,
  type CareerEventType
} from "@/lib/career-events";
import { useI18n } from "@/lib/i18n";

const copy = {
  en: {
    backDashboard: "Dashboard",
    eyebrow: "Career record",
    title: "Career Log",
    subtitle:
      "Every completed mission, badge, academy milestone and promotion is recorded in your Caplexy maritime career.",
    entries: "Entries",
    nmLogged: "NM Logged",
    latestEntry: "Latest Entry",
    noLatest: "No entries yet",
    timelineTitle: "Timeline",
    timelineSubtitle: "A chronological log of your learning career actions.",
    emptyTitle: "No career events yet",
    emptyBody:
      "Complete a mission or academy module and your first log entry will appear here.",
    loading: "Loading career log...",
    eventType: "Event",
    nm: "NM",
    recentTitle: "Recent Career Log",
    recentBody: "Your last five recorded career actions.",
    viewFull: "View Full Log",
    promotionLadder: "View Promotion Ladder",
    unavailable:
      "Career Log will appear after you sign in and apply the Supabase migration."
  },
  tr: {
    promotionLadder: "Terfi Merdivenini Gor",
    backDashboard: "Dashboard",
    eyebrow: "Kariyer kaydi",
    title: "Seyir Defteri",
    subtitle:
      "Tamamlanan görevler, rozetler, akademi kilometre taslari ve terfiler Caplexy denizcilik kariyerine kaydedilir.",
    entries: "Kayit",
    nmLogged: "Kaydedilen NM",
    latestEntry: "Son Kayit",
    noLatest: "Henüz kayit yok",
    timelineTitle: "Zaman Cizelgesi",
    timelineSubtitle: "Ögrenme kariyerindeki önemli adimlarin sirali kaydi.",
    emptyTitle: "Henüz kariyer kaydi yok",
    emptyBody:
      "Bir görev veya akademi modülü tamamladiginda ilk seyir defteri kaydin burada görünecek.",
    loading: "Seyir defteri yükleniyor...",
    eventType: "Olay",
    nm: "NM",
    recentTitle: "Son Kariyer Kayitlari",
    recentBody: "Kaydedilen son bes kariyer adimin.",
    viewFull: "Tüm Defteri Gör",
    unavailable:
      "Seyir Defteri, giris yaptiktan ve Supabase migration uygulandiktan sonra görünecek."
  }
} as const;

const eventLabels: Record<
  "en" | "tr",
  Record<CareerEventType, string>
> = {
  en: {
    mission_completed: "Mission",
    nm_earned: "NM Earned",
    academy_completed: "Academy",
    badge_unlocked: "Badge",
    rank_promoted: "Promotion"
  },
  tr: {
    mission_completed: "Görev",
    nm_earned: "NM Kazanildi",
    academy_completed: "Akademi",
    badge_unlocked: "Rozet",
    rank_promoted: "Terfi"
  }
};

const eventIcons: Record<CareerEventType, LucideIcon> = {
  mission_completed: Anchor,
  nm_earned: Sparkles,
  academy_completed: GraduationCap,
  badge_unlocked: BadgeCheck,
  rank_promoted: Medal
};

export function CareerLog() {
  const { locale } = useI18n();
  const labels = copy[locale];
  const [events, setEvents] = useState<CareerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const totalNm = useMemo(
    () => events.reduce((total, event) => total + event.nmAmount, 0),
    [events]
  );
  const latestEntryLabel = events[0]
    ? formatCareerDate(events[0].createdAt, locale)
    : labels.noLatest;

  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
      setIsLoading(true);
      const result = await getCareerEvents(80);

      if (!isActive) {
        return;
      }

      setEvents(result.events);
      setErrorMessage(result.error);
      setIsLoading(false);
    }

    void loadEvents();

    return () => {
      isActive = false;
    };
  }, []);

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
            <a
              href="/promotion-ladder"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/18 bg-white/12 px-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
            >
              <Medal className="h-4 w-4" />
              {labels.promotionLadder}
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
                  <ScrollText className="h-4 w-4 text-signal" />
                  {labels.eyebrow}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {labels.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {labels.subtitle}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMetric label={labels.entries} value={String(events.length)} />
                <HeroMetric label={labels.nmLogged} value={String(totalNm)} />
                <HeroMetric label={labels.latestEntry} value={latestEntryLabel} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold text-ink">
                {labels.timelineTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-steel">
                {labels.timelineSubtitle}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg bg-tide/10 px-3 py-2 text-sm font-bold text-tide">
              <CalendarDays className="h-4 w-4" />
              {events.length} {labels.entries}
            </span>
          </div>

          {isLoading ? (
            <p className="mt-8 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5 text-sm font-semibold text-steel">
              {labels.loading}
            </p>
          ) : events.length === 0 ? (
            <EmptyState
              title={errorMessage ? labels.unavailable : labels.emptyTitle}
              body={errorMessage ?? labels.emptyBody}
            />
          ) : (
            <div className="mt-8 space-y-4">
              {events.map((event) => (
                <CareerEventRow
                  key={event.id}
                  event={event}
                  eventLabel={eventLabels[locale][event.eventType]}
                  eventTypeLabel={labels.eventType}
                  nmLabel={labels.nm}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export function RecentCareerLogCard() {
  const { locale } = useI18n();
  const labels = copy[locale];
  const [events, setEvents] = useState<CareerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
      const result = await getCareerEvents(5);

      if (!isActive) {
        return;
      }

      setEvents(result.events);
      setIsLoading(false);
    }

    void loadEvents();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-bold text-white">
            <ScrollText className="h-4 w-4 text-signal" />
            {labels.recentTitle}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            {locale === "tr" ? "Seyir Defteri" : "Career Log"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            {labels.recentBody}
          </p>
          <a
            href="/career-log"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-tide"
          >
            {labels.viewFull}
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
          {isLoading ? (
            <p className="text-sm font-semibold text-steel">{labels.loading}</p>
          ) : events.length === 0 ? (
            <p className="text-sm leading-6 text-steel">{labels.emptyBody}</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const Icon = eventIcons[event.eventType];

                return (
                  <a
                    key={event.id}
                    href="/career-log"
                    className="flex items-start gap-3 rounded-lg border border-ink/8 bg-white p-3 transition hover:-translate-y-0.5 hover:border-tide/30"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-tide/10 text-tide">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink">
                        {event.title}
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-steel">
                        {formatCareerDate(event.createdAt, locale)}
                        {event.nmAmount > 0 ? ` - +${event.nmAmount} NM` : ""}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CareerEventRow({
  event,
  eventLabel,
  eventTypeLabel,
  nmLabel,
  locale
}: {
  event: CareerEvent;
  eventLabel: string;
  eventTypeLabel: string;
  nmLabel: string;
  locale: "en" | "tr";
}) {
  const Icon = eventIcons[event.eventType];

  return (
    <article className="grid gap-4 rounded-lg border border-ink/8 bg-[#f6f8f3] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-start">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-bold text-steel sm:hidden">
          {formatCareerDate(event.createdAt, locale)}
        </span>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-tide/10 px-2.5 py-1 text-xs font-bold text-tide">
            {eventTypeLabel}: {eventLabel}
          </span>
          {event.nmAmount > 0 ? (
            <span className="rounded-lg bg-signal/24 px-2.5 py-1 text-xs font-bold text-ink">
              +{event.nmAmount} {nmLabel}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-ink">{event.title}</h3>
        <p className="mt-2 text-sm leading-6 text-steel">{event.description}</p>
      </div>

      <p className="hidden min-w-32 text-right text-sm font-semibold text-steel sm:block">
        {formatCareerDate(event.createdAt, locale)}
      </p>
    </article>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-4">
      <p className="text-sm font-semibold text-white/62">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-ink/16 bg-[#f6f8f3] p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-tide/10 text-tide">
        <ScrollText className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-steel">{body}</p>
    </div>
  );
}

function formatCareerDate(value: string, locale: "en" | "tr") {
  if (!value) {
    return locale === "tr" ? "Tarih yok" : "No date";
  }

  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
