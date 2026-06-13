"use client";

import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  ClipboardCheck,
  FileText,
  RotateCcw,
  Ship,
  Sparkles,
  Trophy,
  Wrench
} from "lucide-react";
import { useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { usePlayerProgress } from "@/lib/progress";

type GrammarTopic =
  | "present-simple"
  | "present-continuous"
  | "to-be"
  | "subject-verb-agreement";

type LogRepairRecord = {
  id: string;
  topic: GrammarTopic;
  damagedRecord: string;
  correctRepair: string;
  options: string[];
};

type FeedbackKey = "idle" | "correct" | "wrong";

const logRepairRecords: LogRepairRecord[] = [
  {
    id: "captain-goes",
    topic: "present-simple",
    damagedRecord: "The captain go to the harbor.",
    correctRepair: "The captain goes to the harbor.",
    options: [
      "The captain goes to the harbor.",
      "The captain going to the harbor.",
      "The captain are go to the harbor.",
      "The captain go to the harbor."
    ]
  },
  {
    id: "crew-ready",
    topic: "to-be",
    damagedRecord: "The crew are ready.",
    correctRepair: "The crew is ready.",
    options: [
      "The crew is ready.",
      "The crew am ready.",
      "The crew be ready.",
      "The crew are ready."
    ]
  },
  {
    id: "she-works",
    topic: "subject-verb-agreement",
    damagedRecord: "She work on the ship.",
    correctRepair: "She works on the ship.",
    options: [
      "She works on the ship.",
      "She working on the ship.",
      "She are work on the ship.",
      "She work on the ship."
    ]
  },
  {
    id: "ship-leaves",
    topic: "present-simple",
    damagedRecord: "The ship leave at 8 o'clock.",
    correctRepair: "The ship leaves at 8 o'clock.",
    options: [
      "The ship leaves at 8 o'clock.",
      "The ship leaving at 8 o'clock.",
      "The ship are leave at 8 o'clock.",
      "The ship leave at 8 o'clock."
    ]
  },
  {
    id: "they-are",
    topic: "present-continuous",
    damagedRecord: "They is preparing the cargo.",
    correctRepair: "They are preparing the cargo.",
    options: [
      "They are preparing the cargo.",
      "They is preparing the cargo.",
      "They prepares the cargo.",
      "They am preparing the cargo."
    ]
  },
  {
    id: "radio-officer-sending",
    topic: "present-continuous",
    damagedRecord: "The radio officer are sending a message.",
    correctRepair: "The radio officer is sending a message.",
    options: [
      "The radio officer is sending a message.",
      "The radio officer are sending a message.",
      "The radio officer send a message.",
      "The radio officer am sending a message."
    ]
  },
  {
    id: "sailors-check",
    topic: "present-simple",
    damagedRecord: "The sailors checks the ropes.",
    correctRepair: "The sailors check the ropes.",
    options: [
      "The sailors check the ropes.",
      "The sailors checks the ropes.",
      "The sailors is checking the ropes.",
      "The sailors checking the ropes."
    ]
  },
  {
    id: "harbor-open",
    topic: "to-be",
    damagedRecord: "The harbor am open.",
    correctRepair: "The harbor is open.",
    options: [
      "The harbor is open.",
      "The harbor are open.",
      "The harbor am open.",
      "The harbor be open."
    ]
  },
  {
    id: "boatswain-inspects",
    topic: "subject-verb-agreement",
    damagedRecord: "The boatswain inspect the deck.",
    correctRepair: "The boatswain inspects the deck.",
    options: [
      "The boatswain inspects the deck.",
      "The boatswain inspect the deck.",
      "The boatswain are inspect the deck.",
      "The boatswain inspecting the deck."
    ]
  },
  {
    id: "we-are-entering",
    topic: "present-continuous",
    damagedRecord: "We is entering the harbor.",
    correctRepair: "We are entering the harbor.",
    options: [
      "We are entering the harbor.",
      "We is entering the harbor.",
      "We enters the harbor.",
      "We am entering the harbor."
    ]
  }
];

export function ShipLogRepairMission() {
  const { t } = useI18n();
  const { completeShipLogRepair } = usePlayerProgress();
  const [recordIndex, setRecordIndex] = useState(0);
  const [repairedRecordIds, setRepairedRecordIds] = useState<string[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<string | null>(null);
  const [feedbackKey, setFeedbackKey] = useState<FeedbackKey>("idle");
  const [hasAwardedXp, setHasAwardedXp] = useState(false);

  const currentRecord = logRepairRecords[recordIndex];
  const isComplete = repairedRecordIds.length === logRepairRecords.length;
  const recordNumber = Math.min(recordIndex + 1, logRepairRecords.length);
  const completionPercent = Math.round(
    (repairedRecordIds.length / logRepairRecords.length) * 100
  );
  const progressLabel = t("shipLogRepair.progress")
    .replace("{current}", String(recordNumber))
    .replace("{total}", String(logRepairRecords.length));
  const percentageLabel = t("shipLogRepair.percentage").replace(
    "{percent}",
    String(completionPercent)
  );

  const repairOptions = useMemo(
    () => currentRecord.options,
    [currentRecord]
  );

  function selectRepair(option: string) {
    if (isComplete) {
      return;
    }

    setSelectedRepair(option);

    if (option !== currentRecord.correctRepair) {
      setFeedbackKey("wrong");
      return;
    }

    const nextRepairedIds = repairedRecordIds.includes(currentRecord.id)
      ? repairedRecordIds
      : [...repairedRecordIds, currentRecord.id];

    setRepairedRecordIds(nextRepairedIds);
    setFeedbackKey("correct");

    if (nextRepairedIds.length === logRepairRecords.length) {
      if (!hasAwardedXp) {
        completeShipLogRepair();
        setHasAwardedXp(true);
      }

      return;
    }

    window.setTimeout(() => {
      setRecordIndex((current) => current + 1);
      setSelectedRepair(null);
      setFeedbackKey("idle");
    }, 700);
  }

  function resetMission() {
    setRecordIndex(0);
    setRepairedRecordIds([]);
    setSelectedRepair(null);
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
              {t("shipLogRepair.nav.back")}
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
                  <ClipboardCheck className="h-4 w-4 text-signal" />
                  {t("shipLogRepair.reward")}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {t("shipLogRepair.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {t("shipLogRepair.subtitle")}
                </p>
              </div>

              <div className="min-w-56 rounded-lg border border-white/12 bg-white/8 p-4">
                <div className="flex items-center justify-between gap-4 text-sm font-semibold text-white/70">
                  <span>{progressLabel}</span>
                  <span>{percentageLabel}</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/14">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
                    style={{ width: `${completionPercent}%` }}
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
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-steel">
                    {progressLabel}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-ink">
                    {t("shipLogRepair.logEntry")}
                  </h2>
                </div>
                <FileText className="h-6 w-6 text-tide" />
              </div>

              <div className="mt-7 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white">
                    <BookOpenCheck className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-steel">
                      {t("shipLogRepair.damagedRecord")}
                    </p>
                    <p className="mt-2 text-xl font-semibold leading-8 text-ink">
                      {currentRecord.damagedRecord}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-lg bg-tide/12 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-tide">
                  {t(`shipLogRepair.topics.${currentRecord.topic}`)}
                </span>
                <span className="rounded-lg bg-signal/24 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ink">
                  {t("shipLogRepair.officialRecord")}
                </span>
              </div>

              <button
                type="button"
                onClick={resetMission}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink/10 bg-[#f6f8f3] px-5 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" />
                {t("shipLogRepair.reset")}
              </button>
            </section>

            <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-ink">
                    {t("shipLogRepair.repairOptions")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    {t("shipLogRepair.repairInstruction")}
                  </p>
                </div>
                <StatusBadge feedbackKey={feedbackKey} />
              </div>

              <div className="mt-6 grid gap-3">
                {repairOptions.map((option) => {
                  const isSelected = selectedRepair === option;
                  const isCorrect = option === currentRecord.correctRepair;
                  const showCorrect = isSelected && isCorrect;
                  const showWrong = isSelected && !isCorrect;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectRepair(option)}
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
      {t(`shipLogRepair.feedback.${feedbackKey}`)}
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
            {t("shipLogRepair.completedTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-white/70">
            {t("shipLogRepair.completedBody")}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="mx-auto inline-flex items-center gap-3 rounded-lg bg-signal/20 px-4 py-3 text-lg font-bold text-ink">
          <Sparkles className="h-5 w-5 text-tide" />
          {t("shipLogRepair.completedReward")}
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-ink px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            {t("shipLogRepair.returnDashboard")}
          </a>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/10 bg-[#f6f8f3] px-6 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
          >
            <Wrench className="h-4 w-4" />
            {t("shipLogRepair.playAgain")}
          </button>
        </div>
      </div>
    </section>
  );
}
