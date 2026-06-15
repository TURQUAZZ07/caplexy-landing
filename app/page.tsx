"use client";

import {
  Anchor,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Boxes,
  CalendarCheck,
  GraduationCap,
  Headphones,
  Map,
  Medal,
  Mic,
  Radar,
  Route,
  Ship,
  Sparkles,
  Trophy,
  UsersRound,
  Waves
} from "lucide-react";
import Image from "next/image";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { I18nProvider, useI18n } from "@/lib/i18n";

const featureIcons = [CalendarCheck, BookOpenCheck, Medal, Radar, Ship];

export default function Home() {
  return (
    <I18nProvider>
      <LandingPage />
    </I18nProvider>
  );
}

function LandingPage() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <ProductPreview />
      <RankSystem />
      <HiddenLearning />
      <TeacherMode />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Header() {
  const { t } = useI18n();

  return (
    <header className="absolute left-0 right-0 top-0 z-20">
      <div className="section-shell flex flex-wrap items-center justify-between gap-3 py-5">
        <a href="#" className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/25 bg-white/12 backdrop-blur">
            <Ship className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-wide">Caplexy</span>
        </a>

        <nav className="order-3 hidden w-full items-center gap-7 text-sm font-medium text-white/78 md:order-none md:flex md:w-auto">
          <a href="#how">{t("nav.howItWorks")}</a>
          <a href="#ranks">{t("nav.ranks")}</a>
          <a href="#teachers">{t("nav.teachers")}</a>
          <AuthHeaderActions
            dashboardLabel={t("nav.dashboard")}
            loginLabel={t("nav.login")}
            registerLabel={t("nav.register")}
            profileLabel={t("nav.profile")}
            logoutLabel={t("nav.logout")}
          />
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="flex items-center gap-2 md:hidden">
            <AuthHeaderActions
              dashboardLabel={t("nav.dashboard")}
              loginLabel={t("nav.login")}
              registerLabel={t("nav.register")}
              profileLabel={t("nav.profile")}
              logoutLabel={t("nav.logout")}
              compact
            />
          </div>
          <a
            href="#start"
            className="hidden items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:bg-foam md:inline-flex"
          >
            {t("nav.start")} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { t, list } = useI18n();
  const badges = list<string[]>("hero.badges");
  const stats = list<string[][]>("hero.stats");

  return (
    <section className="relative min-h-[92vh] bg-ink text-white">
      <Header />
      <Image
        src="/images/caplexy-hero.png"
        alt="Modern maritime learning journey"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/78 to-ink/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/34" />

      <div className="section-shell relative z-10 flex min-h-[92vh] items-center pb-16 pt-32 sm:pt-28">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/18 bg-white/12 px-3 py-2 text-sm font-medium text-white/86 backdrop-blur">
            <Sparkles className="h-4 w-4 text-signal" />
            {t("hero.eyebrow")}
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.04] tracking-normal sm:text-6xl lg:text-7xl">
            {t("hero.headline")}
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-white/78 sm:text-xl">
            {t("hero.subheadline")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#start"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-6 py-4 text-base font-bold text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-[#ffd166]"
            >
              {t("hero.primaryCta")} <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/22 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/16"
            >
              {t("hero.secondaryCta")}
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {badges.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/14 bg-white/10 px-4 py-3 text-sm font-semibold text-white/86 backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-shell relative z-10 -mt-20 hidden pb-8 lg:block">
        <div className="dark-glass-panel grid grid-cols-4 gap-4 rounded-lg p-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-md bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/46">{label}</p>
              <p className="mt-2 font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const { t, list } = useI18n();
  const cards = list<string[][]>("problem.cards");

  return (
    <section className="bg-foam py-20 sm:py-28">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionLabel icon={Waves}>{t("problem.label")}</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
            {t("problem.headline")}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map(([title, text]) => (
            <article key={title} className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <p className="font-semibold text-ink">{title}</p>
              <p className="mt-3 text-sm leading-6 text-steel">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const { t, list } = useI18n();
  const features = list<string[][]>("solution.features");

  return (
    <section className="relative bg-[#eef5f0] py-20 sm:py-28">
      <div className="absolute inset-0 bg-chart-grid bg-[size:40px_40px] opacity-70" />
      <div className="section-shell relative">
        <div className="max-w-3xl">
          <SectionLabel icon={Anchor}>{t("solution.label")}</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
            {t("solution.headline")}
          </h2>
          <p className="mt-5 text-lg leading-8 text-steel">{t("solution.body")}</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {features.map(([title, text], index) => {
            const Icon = featureIcons[index] ?? Ship;

            return (
              <article key={title} className="glass-panel rounded-lg p-5">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-tide text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t, list } = useI18n();
  const steps = list<string[]>("how.steps");

  return (
    <section id="how" className="bg-foam py-20 sm:py-28">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionLabel icon={Route}>{t("how.label")}</SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
              {t("how.headline")}
            </h2>
          </div>
          <div className="rounded-lg border border-ink/8 bg-white p-4 shadow-soft md:w-72">
            <p className="text-sm font-semibold text-ink">{t("how.progressLabel")}</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e6ede8]">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-tide via-glass to-signal" />
            </div>
            <p className="mt-3 text-sm text-steel">{t("how.progressValue")}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step} className="relative rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-sm font-bold text-white">
                  {index + 1}
                </span>
                <ArrowRight className="hidden h-5 w-5 text-glass md:block" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-ink">{step}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPreview() {
  const { t, list } = useI18n();
  const cards = list<string[]>("preview.cards");

  return (
    <section className="bg-[#eef5f0] py-20 sm:py-28">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionLabel icon={Map}>{t("preview.label")}</SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
              {t("preview.headline")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel">{t("preview.body")}</p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-ink/10 bg-white p-3 shadow-soft">
              <div className="rounded-md bg-ink p-4 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{t("preview.dashboard")}</p>
                  <span className="rounded-md bg-signal px-2.5 py-1 text-xs font-bold text-ink">
                    {t("preview.badge")}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-[1.3fr_0.7fr]">
                  <div className="rounded-md bg-white/10 p-4">
                    <div className="h-36 rounded-md bg-gradient-to-br from-tide via-glass to-signal" />
                    <div className="mt-4 h-2 w-2/3 rounded-full bg-white/22" />
                    <div className="mt-2 h-2 w-1/2 rounded-full bg-white/14" />
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-md bg-white/10 p-4">
                      <div className="h-2 w-20 rounded-full bg-white/26" />
                      <div className="mt-4 h-3 rounded-full bg-white/16">
                        <div className="h-3 w-2/3 rounded-full bg-signal" />
                      </div>
                    </div>
                    <div className="rounded-md bg-white/10 p-4">
                      <div className="h-2 w-24 rounded-full bg-white/26" />
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="h-8 rounded bg-white/14" />
                        <div className="h-8 rounded bg-white/14" />
                        <div className="h-8 rounded bg-white/14" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((title) => (
                <div key={title} className="rounded-lg border border-ink/8 bg-white p-5 shadow-soft">
                  <p className="font-semibold text-ink">{title}</p>
                  <div className="mt-5 h-28 rounded-md bg-gradient-to-br from-[#d9ece6] via-[#f7f9f4] to-[#f6d98f]" />
                  <div className="mt-4 h-2 w-3/4 rounded-full bg-ink/10" />
                  <div className="mt-2 h-2 w-1/2 rounded-full bg-ink/8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RankSystem() {
  const { t, list } = useI18n();
  const ranks = list<string[]>("ranks.items");

  return (
    <section id="ranks" className="bg-ink py-20 text-white sm:py-28">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel icon={Trophy} dark>
              {t("ranks.label")}
            </SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
              {t("ranks.headline")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/68">{t("ranks.body")}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ranks.map((rank, index) => (
              <div
                key={rank}
                className="rounded-lg border border-white/12 bg-white/8 p-4 backdrop-blur"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/42">
                      {t("ranks.rankPrefix")} {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 font-semibold text-white">{rank}</p>
                  </div>
                  <BadgeCheck className={index === ranks.length - 1 ? "h-5 w-5 text-signal" : "h-5 w-5 text-glass"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HiddenLearning() {
  const { t, list } = useI18n();
  const visibleSystem = list<string[]>("hiddenLearning.visible");
  const hiddenSystem = list<string[]>("hiddenLearning.hidden");
  const games = list<string[][]>("hiddenLearning.games");

  return (
    <section className="bg-[#f3f6f1] py-20 sm:py-28">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel icon={Boxes} center>
            {t("hiddenLearning.label")}
          </SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
            {t("hiddenLearning.headline")}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <SystemPanel
            title={t("hiddenLearning.userSees")}
            icon={Map}
            items={visibleSystem}
            accent="from-tide to-glass"
          />
          <SystemPanel
            title={t("hiddenLearning.systemTeaches")}
            icon={GraduationCap}
            items={hiddenSystem}
            accent="from-coral to-signal"
          />
        </div>

        <div className="mt-6 rounded-lg border border-tide/12 bg-white p-6 shadow-soft">
          <h3 className="font-semibold text-ink">{t("hiddenLearning.philosophyTitle")}</h3>
          <p className="mt-3 text-sm leading-6 text-steel">{t("hiddenLearning.philosophyBody")}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {games.map(([title, text]) => (
            <article key={title} className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-steel">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeacherMode() {
  const { t, list } = useI18n();
  const cards = list<string[][]>("teacher.cards");

  return (
    <section id="teachers" className="bg-foam py-20 sm:py-28">
      <div className="section-shell grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div>
          <SectionLabel icon={UsersRound}>{t("teacher.label")}</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
            {t("teacher.headline")}
          </h2>
          <p className="mt-5 text-lg leading-8 text-steel">{t("teacher.body")}</p>
        </div>

        <div className="rounded-lg border border-ink/8 bg-white p-5 shadow-soft">
          <div className="rounded-md bg-ink p-5 text-white">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{t("teacher.panelTitle")}</p>
              <span className="rounded-md bg-signal px-2.5 py-1 text-xs font-bold text-ink">
                {t("teacher.badge")}
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {cards.map(([title, text]) => (
                <div key={title} className="rounded-md bg-white/10 p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-white/62">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useI18n();

  return (
    <section id="start" className="relative bg-harbor py-20 text-white sm:py-28">
      <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-20" />
      <div className="section-shell relative text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-white text-harbor shadow-glow">
          <Ship className="h-8 w-8" />
        </div>
        <h2 className="mx-auto mt-7 max-w-3xl text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
          {t("finalCta.headline")}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/68">
          {t("finalCta.body")}
        </p>
        <a
          href="#"
          className="mt-9 inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-7 py-4 text-base font-bold text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-[#ffd166]"
        >
          {t("finalCta.button")} <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  const { t, list } = useI18n();
  const links = list<string[]>("footer.links");

  return (
    <footer className="bg-ink py-10 text-white">
      <div className="section-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/16 bg-white/8">
              <Ship className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold">Caplexy</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">{t("footer.tagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm font-semibold text-white/70">
          {links.map((link) => (
            <span key={link} className="rounded-lg border border-white/12 px-3 py-2">
              {link}
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function SectionLabel({
  children,
  icon: Icon,
  dark,
  center
}: {
  children: React.ReactNode;
  icon: typeof Ship;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${
        dark
          ? "border border-white/16 bg-white/8 text-white/78"
          : "border border-tide/12 bg-tide/8 text-tide"
      } ${center ? "justify-center" : ""}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
}

function SystemPanel({
  title,
  items,
  icon: Icon,
  accent
}: {
  title: string;
  items: string[];
  icon: typeof Ship;
  accent: string;
}) {
  return (
    <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={`grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br ${accent} text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-lg border border-ink/8 bg-[#f6f8f3] p-4"
          >
            {item.toLowerCase().includes("listening") ||
            item.toLowerCase().includes("dinleme") ||
            item.toLowerCase().includes("escuta") ||
            item.toLowerCase().includes("hören") ? (
              <Headphones className="h-5 w-5 text-tide" />
            ) : item.toLowerCase().includes("speaking") ||
              item.toLowerCase().includes("konuşma") ||
              item.toLowerCase().includes("fala") ||
              item.toLowerCase().includes("sprechen") ? (
              <Mic className="h-5 w-5 text-tide" />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-signal" />
            )}
            <span className="font-semibold text-ink">{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
