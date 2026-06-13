"use client";

import {
  ArrowLeft,
  Check,
  Headphones,
  Radio,
  RotateCcw,
  Ship,
  Sparkles,
  Trophy,
  Volume2,
  Waves
} from "lucide-react";
import { useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";

type FeedbackKey = "idle" | "correct" | "wrong";

const radioQuestions = [
  {
    sentence: "The ship is leaving the harbor.",
    options: [
      "The ship is leaving the harbor.",
      "The crew is loading the ship.",
      "The captain is calling the harbor.",
      "The storm is leaving the coast."
    ]
  },
  {
    sentence: "The captain is checking the cargo.",
    options: [
      "The captain is checking the cargo.",
      "The radio officer is checking the weather.",
      "The crew is cleaning the deck.",
      "The ship is entering the harbor."
    ]
  },
  {
    sentence: "The crew is preparing for the voyage.",
    options: [
      "The crew is preparing for the voyage.",
      "The captain is preparing the radio.",
      "The harbor is closing for the night.",
      "The cargo is arriving tomorrow."
    ]
  },
  {
    sentence: "A storm is approaching the ship.",
    options: [
      "A storm is approaching the ship.",
      "A ship is approaching the harbor.",
      "A captain is checking the storm.",
      "A crew member is leaving the ship."
    ]
  },
  {
    sentence: "The radio officer is sending a message.",
    options: [
      "The radio officer is sending a message.",
      "The deck officer is reading a map.",
      "The captain is opening the cargo hold.",
      "The crew is starting the voyage."
    ]
  }
];

export function RadioCheckMission() {
  const { t } = useI18n();
  const { completeRadioCheck } = usePlayerProgress();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answeredIndexes, setAnsweredIndexes] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackKey, setFeedbackKey] = useState<FeedbackKey>("idle");
  const [hasAwardedXp, setHasAwardedXp] = useState(false);

  const currentQuestion = radioQuestions[questionIndex];
  const isComplete = answeredIndexes.length === radioQuestions.length;
  const questionNumber = Math.min(questionIndex + 1, radioQuestions.length);
  const progressPercent = (answeredIndexes.length / radioQuestions.length) * 100;
  const progressLabel = t("radioCheck.progress")
    .replace("{current}", String(questionNumber))
    .replace("{total}", String(radioQuestions.length));

  const options = useMemo(
    () => currentQuestion.options,
    [currentQuestion]
  );

  function playAudio() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setFeedbackKey("idle");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentQuestion.sentence);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.pitch = 0.95;

    window.speechSynthesis.speak(utterance);
  }

  function selectOption(option: string) {
    if (isComplete) {
      return;
    }

    setSelectedOption(option);

    if (option !== currentQuestion.sentence) {
      setFeedbackKey("wrong");
      return;
    }

    const nextAnsweredIndexes = answeredIndexes.includes(questionIndex)
      ? answeredIndexes
      : [...answeredIndexes, questionIndex];

    setAnsweredIndexes(nextAnsweredIndexes);
    setFeedbackKey("correct");

    if (nextAnsweredIndexes.length === radioQuestions.length) {
      if (!hasAwardedXp) {
        completeRadioCheck();
        setHasAwardedXp(true);
      }

      return;
    }

    window.setTimeout(() => {
      setQuestionIndex((current) => current + 1);
      setSelectedOption(null);
      setFeedbackKey("idle");
    }, 700);
  }

  function resetMission() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setQuestionIndex(0);
    setAnsweredIndexes([]);
    setSelectedOption(null);
    setFeedbackKey("idle");
    setHasAwardedXp(false);
  }

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
              {t("radioCheck.nav.back")}
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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <Radio className="h-4 w-4 text-signal" />
                  {t("radioCheck.reward")}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {t("radioCheck.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {t("radioCheck.subtitle")}
                </p>
              </div>

              <div className="min-w-56 rounded-lg border border-white/12 bg-white/8 p-4">
                <p className="text-sm font-semibold text-white/70">{progressLabel}</p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/14">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        {isComplete ? (
          <CompletionPanel onReset={resetMission} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-steel">
                    {progressLabel}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-ink">
                    {t("radioCheck.panelTitle")}
                  </h2>
                </div>
                <Headphones className="h-6 w-6 text-tide" />
              </div>

              <div className="mt-7 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white">
                    <Waves className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-steel">
                      {t("radioCheck.incoming")}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {t("radioCheck.channel")}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={playAudio}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
              >
                <Volume2 className="h-5 w-5" />
                {t("radioCheck.playAudio")}
              </button>

              <button
                type="button"
                onClick={resetMission}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink/10 bg-[#f6f8f3] px-5 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" />
                {t("radioCheck.reset")}
              </button>
            </section>

            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("radioCheck.optionsTitle")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {t("radioCheck.optionsSubtitle")}
                  </p>
                </div>
                <StatusBadge feedbackKey={feedbackKey} />
              </div>

              <div className="mt-6 grid gap-3">
                {options.map((option) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQuestion.sentence;
                  const showCorrect = isSelected && isCorrect;
                  const showWrong = isSelected && !isCorrect;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectOption(option)}
                      className={`flex min-h-16 items-center justify-between rounded-lg border p-4 text-left font-semibold transition ${
                        showCorrect
                          ? "border-tide bg-tide/12 text-tide"
                          : showWrong
                            ? "border-red-200 bg-red-50 text-ink"
                            : "border-ink/8 bg-[#f7f9f4] text-ink hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white"
                      }`}
                    >
                      <span>{option}</span>
                      {showCorrect ? (
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-tide text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ feedbackKey }: { feedbackKey: FeedbackKey }) {
  const { t } = useI18n();

  return (
    <div
      className={`rounded-lg px-3 py-2 text-sm font-bold ${
        feedbackKey === "correct"
          ? "bg-tide/12 text-tide"
          : feedbackKey === "wrong"
            ? "bg-red-50 text-red-700"
            : "bg-signal/24 text-ink"
      }`}
    >
      {t(`radioCheck.feedback.${feedbackKey}`)}
    </div>
  );
}

function CompletionPanel({ onReset }: { onReset: () => void }) {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-ink/8 bg-white text-center shadow-soft">
      <div className="relative bg-ink p-8 text-white sm:p-10">
        <div className="absolute inset-0 bg-chart-grid bg-[size:40px_40px] opacity-10" />
        <div className="relative">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-lg bg-signal text-ink shadow-glow">
            <Trophy className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold sm:text-4xl">
            {t("radioCheck.completedTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-white/70">
            {t("radioCheck.completedBody")}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="mx-auto inline-flex items-center gap-3 rounded-lg bg-signal/20 px-4 py-3 text-lg font-bold text-ink">
          <Sparkles className="h-5 w-5 text-tide" />
          {t("radioCheck.completedReward")}
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-ink px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            {t("radioCheck.returnDashboard")}
          </a>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/10 bg-[#f6f8f3] px-6 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
          >
            <RotateCcw className="h-4 w-4" />
            {t("radioCheck.playAgain")}
          </button>
        </div>
      </div>
    </section>
  );
}
