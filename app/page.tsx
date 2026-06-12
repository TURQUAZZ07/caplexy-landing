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

const ranks = [
  "Cadet",
  "Deck Cadet",
  "Able Seaman",
  "Boatswain",
  "Third Officer",
  "Second Officer",
  "Chief Officer",
  "Captain",
  "Commodore",
  "Admiral"
];

const habitFeatures = [
  {
    title: "Daily Watch Duty",
    text: "A short daily routine that keeps learners moving without making the app feel like homework.",
    icon: CalendarCheck
  },
  {
    title: "Voyage Log",
    text: "A motivating record of progress that replaces streak pressure with visible career momentum.",
    icon: BookOpenCheck
  },
  {
    title: "Rank Promotions",
    text: "Learners rise through 250 micro-ranks and 10 major ranks from Cadet to Admiral.",
    icon: Medal
  },
  {
    title: "Missions",
    text: "Vocabulary, grammar, listening, reading, and speaking become cargo checks, radio calls, and ship logs.",
    icon: Radar
  },
  {
    title: "Ships and Ports",
    text: "New routes, ports, and ships make progress feel like a career journey, not a lesson list.",
    icon: Ship
  }
];

const steps = [
  "Complete daily missions",
  "Earn XP and progress",
  "Unlock new ranks",
  "Learn English without feeling like grammar study"
];

const visibleSystem = ["Voyages", "Missions", "Ranks", "Ships", "Ports"];
const hiddenSystem = ["Vocabulary", "Grammar", "Listening", "Reading", "Speaking"];

export default function Home() {
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
    </main>
  );
}

function Header() {
  return (
    <header className="absolute left-0 right-0 top-0 z-20">
      <div className="section-shell flex items-center justify-between py-5">
        <a href="#" className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/25 bg-white/12 backdrop-blur">
            <Ship className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-wide">Caplexy</span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-white/78 md:flex">
          <a href="#how">How it works</a>
          <a href="#ranks">Ranks</a>
          <a href="#teachers">Teachers</a>
        </nav>

        <a
          href="#start"
          className="hidden items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:bg-foam md:inline-flex"
        >
          Start <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
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

      <div className="section-shell relative z-10 flex min-h-[92vh] items-center pb-16 pt-28">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/18 bg-white/12 px-3 py-2 text-sm font-medium text-white/86 backdrop-blur">
            <Sparkles className="h-4 w-4 text-signal" />
            English practice disguised as a naval career
          </div>

          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            Learn English. Rise from Cadet to Admiral.
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-white/78 sm:text-xl">
            Caplexy turns daily English practice into a naval career journey with
            missions, ranks, voyages, and rewards.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#start"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-6 py-4 text-base font-bold text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-[#ffd166]"
            >
              Start Your Voyage <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/22 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/16"
            >
              See How It Works
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {["Daily voyages", "250 micro-ranks", "No flashcards"].map((item) => (
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
          {[
            ["Current rank", "Deck Cadet 08"],
            ["Active route", "Harbor to Open Sea"],
            ["Today", "Watch Duty ready"],
            ["Next unlock", "Radio Check"]
          ].map(([label, value]) => (
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
  return (
    <section className="bg-foam py-20 sm:py-28">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionLabel icon={Waves}>The problem</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
            Most learners quit because English apps feel like homework.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Grammar first", "Learners see units, rules, and tests before they feel progress."],
            ["Weak habit loop", "A streak alone is not enough to make practice feel meaningful."],
            ["Flat identity", "Finishing another exercise rarely feels like becoming someone better."]
          ].map(([title, text]) => (
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
  return (
    <section className="relative bg-[#eef5f0] py-20 sm:py-28">
      <div className="absolute inset-0 bg-chart-grid bg-[size:40px_40px] opacity-70" />
      <div className="section-shell relative">
        <div className="max-w-3xl">
          <SectionLabel icon={Anchor}>The Caplexy solution</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
            Build the habit through voyages, missions, ranks, and promotions.
          </h2>
          <p className="mt-5 text-lg leading-8 text-steel">
            Caplexy keeps the learning engine underneath and gives learners a
            career journey on the surface. English practice becomes something to
            report for, complete, unlock, and remember.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {habitFeatures.map((feature) => (
            <article key={feature.title} className="glass-panel rounded-lg p-5">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-tide text-white">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-steel">{feature.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bg-foam py-20 sm:py-28">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionLabel icon={Route}>How it works</SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
              A simple daily route with a deeper learning engine underneath.
            </h2>
          </div>
          <div className="rounded-lg border border-ink/8 bg-white p-4 shadow-soft md:w-72">
            <p className="text-sm font-semibold text-ink">Daily progress</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e6ede8]">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-tide via-glass to-signal" />
            </div>
            <p className="mt-3 text-sm text-steel">68% to next promotion</p>
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
  return (
    <section className="bg-[#eef5f0] py-20 sm:py-28">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionLabel icon={Map}>Product preview</SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
              A learning dashboard that feels like mission control.
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel">
              The first product screens can showcase the Bridge dashboard,
              Voyage Mode, rank progress, and teacher view while the platform
              is still in development.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-ink/10 bg-white p-3 shadow-soft">
              <div className="rounded-md bg-ink p-4 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Bridge Dashboard</p>
                  <span className="rounded-md bg-signal px-2.5 py-1 text-xs font-bold text-ink">
                    Preview
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
              {["Voyage Mode", "Teacher Panel"].map((title) => (
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
  return (
    <section id="ranks" className="bg-ink py-20 text-white sm:py-28">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel icon={Trophy} dark>
              Rank system
            </SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
              Career progression from Cadet to Admiral.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/68">
              Caplexy uses 10 major ranks and 250 micro-ranks so every small
              session still feels like part of a larger career path.
            </p>
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
                      Rank {String(index + 1).padStart(2, "0")}
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
  return (
    <section className="bg-[#f3f6f1] py-20 sm:py-28">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel icon={Boxes} center>
            Hidden learning system
          </SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
            Learners see the journey. Caplexy handles the curriculum.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <SystemPanel
            title="User sees"
            icon={Map}
            items={visibleSystem}
            accent="from-tide to-glass"
          />
          <SystemPanel
            title="System teaches"
            icon={GraduationCap}
            items={hiddenSystem}
            accent="from-coral to-signal"
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Cargo Match", "Vocabulary appears as cargo, labels, manifests, and port requests."],
            ["Fix The Ship Log", "Grammar correction becomes a log repair before departure."],
            ["Radio Check", "Listening and speaking become realistic maritime communication."]
          ].map(([title, text]) => (
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
  return (
    <section id="teachers" className="bg-foam py-20 sm:py-28">
      <div className="section-shell grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div>
          <SectionLabel icon={UsersRound}>Teacher mode</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal text-ink sm:text-5xl">
            Built for future classrooms, tutors, and school programs.
          </h2>
          <p className="mt-5 text-lg leading-8 text-steel">
            Teachers will be able to create classes, assign missions, monitor
            hidden skill progress, and see which learners need support without
            breaking the learner-facing naval career fantasy.
          </p>
        </div>

        <div className="rounded-lg border border-ink/8 bg-white p-5 shadow-soft">
          <div className="rounded-md bg-ink p-5 text-white">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Class Mission Control</p>
              <span className="rounded-md bg-signal px-2.5 py-1 text-xs font-bold text-ink">
                Future
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {[
                ["Create classes", "Invite learners and organize cohorts."],
                ["Assign missions", "Choose skill targets under themed activities."],
                ["Track progress", "View vocabulary, grammar, listening, reading, and speaking growth."]
              ].map(([title, text]) => (
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
  return (
    <section id="start" className="relative bg-harbor py-20 text-white sm:py-28">
      <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-20" />
      <div className="section-shell relative text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-white text-harbor shadow-glow">
          <Ship className="h-8 w-8" />
        </div>
        <h2 className="mx-auto mt-7 max-w-3xl text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
          Your English journey starts with your first voyage.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/68">
          Start with one mission, build the habit, and turn daily English
          practice into visible career progress.
        </p>
        <a
          href="#"
          className="mt-9 inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-7 py-4 text-base font-bold text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-[#ffd166]"
        >
          Start Your Voyage <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
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
            {item === "Listening" ? (
              <Headphones className="h-5 w-5 text-tide" />
            ) : item === "Speaking" ? (
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
