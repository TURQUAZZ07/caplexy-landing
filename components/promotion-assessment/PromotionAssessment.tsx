"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Headphones,
  Lock,
  Medal,
  Radio,
  RotateCw,
  Ship,
  Trophy,
  X
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
  getPromotionAssessmentStatus,
  submitPromotionAssessment,
  type PromotionAssessmentStatus
} from "@/lib/promotion-assessment";
import { useI18n } from "@/lib/i18n";

type AnswerKey = "multipleChoice" | "vocabulary" | "listening";

const cargoPairs = [
  { id: "ship", word: "ship", meaning: "gemi" },
  { id: "harbor", word: "harbor", meaning: "liman" }
];

const copy = {
  en: {
    backDashboard: "Dashboard",
    eyebrow: "Official maritime examination",
    title: "Promotion Assessment",
    subtitle:
      "Your NM requirement is only the clearance to enter. Pass the assessment to receive the next rank.",
    lockedTitle: "Promotion Assessment Locked",
    lockedBody: "Earn the required NM before requesting promotion clearance.",
    cooldownTitle: "Assessment cooling down",
    cooldownBody: "Review your feedback before retrying the official exam.",
    currentRank: "Current Rank",
    targetRank: "Target Rank",
    currentNm: "Current NM",
    requiredNm: "Required NM",
    passingScore: "Passing Score",
    multipleChoice: "Multiple choice",
    vocabulary: "Vocabulary check",
    listening: "Listening check",
    cargoMatch: "Cargo Match challenge",
    playAudio: "Play Radio Audio",
    questionOne: "Which official ship log sentence is correct?",
    vocabularyQuestion: "What does harbor mean?",
    listeningQuestion: "Which transmission did you hear?",
    submit: "Submit Assessment",
    reset: "Reset Assessment",
    retry: "Retry Assessment",
    passedTitle: "Promotion Granted",
    failedTitle: "Assessment Not Passed",
    passedBody: "You passed the official assessment. Your new rank has been granted.",
    failedBody: "Review the missed checks and retry after the cooldown.",
    score: "Score",
    continue: "Continue Career",
    startAssessment: "Start Assessment",
    feedback: "Assessment feedback",
    notReady: "Not ready",
    ready: "Ready for examination",
    latestScore: "Latest Score"
  },
  tr: {
    backDashboard: "Dashboard",
    eyebrow: "Resmi denizcilik sinavi",
    title: "Promotion Assessment",
    subtitle:
      "NM gereksinimi sadece sinava giris iznidir. Sonraki rutbeyi almak icin assessment'i gec.",
    lockedTitle: "Promotion Assessment Kilitli",
    lockedBody: "Terfi izni istemeden once gerekli NM miktarini kazan.",
    cooldownTitle: "Assessment beklemede",
    cooldownBody: "Resmi sinavi tekrar denemeden once geri bildirimi incele.",
    currentRank: "Mevcut Rutbe",
    targetRank: "Hedef Rutbe",
    currentNm: "Mevcut NM",
    requiredNm: "Gerekli NM",
    passingScore: "Gecme Puani",
    multipleChoice: "Coktan secmeli",
    vocabulary: "Kelime kontrolu",
    listening: "Dinleme kontrolu",
    cargoMatch: "Cargo Match meydan okumasi",
    playAudio: "Radyo Sesini Cal",
    questionOne: "Hangi resmi gemi gunlugu cumlesi dogru?",
    vocabularyQuestion: "Harbor ne anlama gelir?",
    listeningQuestion: "Hangi telsiz mesajini duydun?",
    submit: "Assessment Gonder",
    reset: "Assessment Sifirla",
    retry: "Tekrar Dene",
    passedTitle: "Promotion Granted",
    failedTitle: "Assessment Gecilemedi",
    passedBody: "Resmi assessment'i gectin. Yeni rutben verildi.",
    failedBody: "Eksik kontrolleri incele ve bekleme suresinden sonra tekrar dene.",
    score: "Puan",
    continue: "Kariyere Devam Et",
    startAssessment: "Assessment Baslat",
    feedback: "Assessment geri bildirimi",
    notReady: "Hazir degil",
    ready: "Sinava hazir",
    latestScore: "Son Puan"
  }
} as const;

type PromotionAssessmentCopy = (typeof copy)[keyof typeof copy];

export function PromotionAssessment() {
  const { locale } = useI18n();
  const labels = copy[locale];
  const [status, setStatus] = useState<PromotionAssessmentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<AnswerKey, string | null>>({
    multipleChoice: null,
    vocabulary: null,
    listening: null
  });
  const [matchedCargoIds, setMatchedCargoIds] = useState<string[]>([]);
  const [selectedCargoWord, setSelectedCargoWord] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    error: string | null;
  } | null>(null);
  const isLocked =
    !status || status.isMaxRank || status.currentNm < status.requiredNm;
  const isCoolingDown = Boolean(status && status.cooldownSeconds > 0);
  const canSubmit = Boolean(status?.isReady) && !isSubmitting;
  const scorePreview = useMemo(() => calculateScore(answers, matchedCargoIds), [
    answers,
    matchedCargoIds
  ]);

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function refreshStatus() {
    setIsLoading(true);
    const nextStatus = await getPromotionAssessmentStatus();

    setStatus(nextStatus);
    setIsLoading(false);
  }

  function setAnswer(key: AnswerKey, value: string) {
    setAnswers((current) => ({
      ...current,
      [key]: value
    }));
  }

  function playAudio() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      "The ship is leaving the harbor."
    );
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }

  function chooseCargoMeaning(meaningId: string) {
    if (!selectedCargoWord) {
      return;
    }

    if (selectedCargoWord === meaningId) {
      setMatchedCargoIds((current) =>
        current.includes(meaningId) ? current : [...current, meaningId]
      );
    }

    setSelectedCargoWord(null);
  }

  async function submitAssessment() {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    const score = calculateScore(answers, matchedCargoIds);
    const submission = await submitPromotionAssessment(score);

    setResult({
      score: submission.score,
      passed: submission.passed,
      error: submission.error
    });
    setStatus(submission.status);
    setIsSubmitting(false);
  }

  function resetAssessment() {
    setAnswers({
      multipleChoice: null,
      vocabulary: null,
      listening: null
    });
    setMatchedCargoIds([]);
    setSelectedCargoWord(null);
    setResult(null);
    void refreshStatus();
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
              {labels.backDashboard}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink pb-14 pt-6 text-white sm:pb-16">
        <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-10" />
        <div className="absolute left-1/2 top-0 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-tide/24 blur-3xl" />

        <div className="section-shell relative">
          <div className="dark-glass-panel rounded-lg p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <Medal className="h-4 w-4 text-signal" />
                  {labels.eyebrow}
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {labels.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {labels.subtitle}
                </p>
              </div>

              <div className="rounded-lg border border-white/12 bg-white/8 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <HeroMetric label={labels.currentRank} value={status?.currentRankName ?? "..."} />
                  <HeroMetric label={labels.targetRank} value={status?.targetRankName ?? "..."} />
                  <HeroMetric label={labels.currentNm} value={`${status?.currentNm ?? 0} NM`} />
                  <HeroMetric label={labels.requiredNm} value={`${status?.requiredNm ?? 0} NM`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-10 lg:py-12">
        {isLoading ? (
          <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold text-steel">
              {locale === "tr" ? "Assessment hazirlaniyor..." : "Preparing assessment..."}
            </p>
          </section>
        ) : isLocked || isCoolingDown || !status?.isAuthenticated ? (
          <LockedAssessment
            status={status}
            title={
              isCoolingDown
                ? labels.cooldownTitle
                : labels.lockedTitle
            }
            body={
              !status?.isAuthenticated
                ? status?.error ?? "Sign in to start promotion assessment."
                : isCoolingDown
                  ? labels.cooldownBody
                  : labels.lockedBody
            }
            labels={labels}
            onRefresh={refreshStatus}
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="grid gap-6">
              <AssessmentCard
                Icon={ClipboardCheck}
                eyebrow={labels.multipleChoice}
                title={labels.questionOne}
              >
                <OptionList
                  options={[
                    "The captain checks the cargo.",
                    "The captain check the cargo.",
                    "The captain checking cargo."
                  ]}
                  selected={answers.multipleChoice}
                  onSelect={(value) => setAnswer("multipleChoice", value)}
                />
              </AssessmentCard>

              <AssessmentCard
                Icon={BadgeCheck}
                eyebrow={labels.vocabulary}
                title={labels.vocabularyQuestion}
              >
                <OptionList
                  options={[
                    "A safe place for ships",
                    "A person who commands a ship",
                    "A strong wind at sea"
                  ]}
                  selected={answers.vocabulary}
                  onSelect={(value) => setAnswer("vocabulary", value)}
                />
              </AssessmentCard>

              <AssessmentCard
                Icon={Headphones}
                eyebrow={labels.listening}
                title={labels.listeningQuestion}
              >
                <button
                  type="button"
                  onClick={playAudio}
                  className="mb-4 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
                >
                  <Radio className="h-4 w-4" />
                  {labels.playAudio}
                </button>
                <OptionList
                  options={[
                    "The ship is leaving the harbor.",
                    "The captain is checking the cargo.",
                    "The crew is preparing for the voyage."
                  ]}
                  selected={answers.listening}
                  onSelect={(value) => setAnswer("listening", value)}
                />
              </AssessmentCard>

              <AssessmentCard
                Icon={Boxes}
                eyebrow={labels.cargoMatch}
                title="Match the official cargo terms."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-3">
                    {cargoPairs.map((pair) => (
                      <button
                        key={pair.word}
                        type="button"
                        onClick={() => setSelectedCargoWord(pair.id)}
                        disabled={matchedCargoIds.includes(pair.id)}
                        className={`rounded-lg border p-3 text-left text-sm font-bold transition ${
                          matchedCargoIds.includes(pair.id)
                            ? "border-tide bg-tide/10 text-tide"
                            : selectedCargoWord === pair.id
                              ? "border-signal bg-signal/18 text-ink"
                              : "border-ink/8 bg-[#f6f8f3] text-ink hover:bg-white"
                        }`}
                      >
                        {pair.word}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3">
                    {cargoPairs.map((pair) => (
                      <button
                        key={pair.meaning}
                        type="button"
                        onClick={() => chooseCargoMeaning(pair.id)}
                        disabled={matchedCargoIds.includes(pair.id)}
                        className={`rounded-lg border p-3 text-left text-sm font-bold transition ${
                          matchedCargoIds.includes(pair.id)
                            ? "border-tide bg-tide/10 text-tide"
                            : "border-ink/8 bg-[#f6f8f3] text-ink hover:bg-white"
                        }`}
                      >
                        {pair.meaning}
                      </button>
                    ))}
                  </div>
                </div>
              </AssessmentCard>
            </section>

            <aside className="grid content-start gap-6">
              <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-tide">
                      {labels.ready}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-ink">
                      {status.currentRankName} {"->"} {status.targetRankName}
                    </h2>
                  </div>
                  <Trophy className="h-7 w-7 text-tide" />
                </div>
                <div className="mt-5 grid gap-3">
                  <InfoRow label={labels.passingScore} value={`${status.passingScore}%`} />
                  <InfoRow label={labels.score} value={`${scorePreview}%`} />
                  {status.latestScore !== null ? (
                    <InfoRow
                      label={labels.latestScore}
                      value={`${status.latestScore}%`}
                    />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={submitAssessment}
                  disabled={!canSubmit}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor disabled:cursor-not-allowed disabled:bg-steel disabled:hover:translate-y-0"
                >
                  {labels.submit}
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={resetAssessment}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink/10 bg-[#f6f8f3] px-5 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <RotateCw className="h-4 w-4" />
                  {labels.reset}
                </button>
              </section>

              {result ? (
                <ResultPanel result={result} labels={labels} />
              ) : null}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function LockedAssessment({
  status,
  title,
  body,
  labels,
  onRefresh
}: {
  status: PromotionAssessmentStatus | null;
  title: string;
  body: string;
  labels: PromotionAssessmentCopy;
  onRefresh: () => void;
}) {
  return (
    <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-ink text-white">
            {status?.cooldownSeconds ? (
              <Clock3 className="h-7 w-7" />
            ) : (
              <Lock className="h-7 w-7" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-ink">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">{body}</p>
            {status ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <InfoRow label={labels.currentNm} value={`${status.currentNm} NM`} />
                <InfoRow label={labels.requiredNm} value={`${status.requiredNm} NM`} />
                <InfoRow
                  label={status.cooldownSeconds > 0 ? "Cooldown" : "NM Remaining"}
                  value={
                    status.cooldownSeconds > 0
                      ? `${Math.ceil(status.cooldownSeconds / 60)} min`
                      : `${status.nmRemaining} NM`
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
        >
          <RotateCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    </section>
  );
}

function AssessmentCard({
  Icon,
  eyebrow,
  title,
  children
}: {
  Icon: typeof Ship;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ink text-white">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function OptionList({
  options,
  selected,
  onSelect
}: {
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`rounded-lg border p-3 text-left text-sm font-bold transition ${
            selected === option
              ? "border-signal bg-signal/18 text-ink"
              : "border-ink/8 bg-[#f6f8f3] text-ink hover:bg-white"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function ResultPanel({
  result,
  labels
}: {
  result: { score: number; passed: boolean; error: string | null };
  labels: PromotionAssessmentCopy;
}) {
  return (
    <section
      className={`rounded-lg border p-6 shadow-soft ${
        result.passed
          ? "border-tide/20 bg-tide/10"
          : "border-coral/20 bg-white"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${
            result.passed ? "bg-tide text-white" : "bg-coral text-white"
          }`}
        >
          {result.passed ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-ink">
            {result.passed ? labels.passedTitle : labels.failedTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            {result.error ??
              (result.passed ? labels.passedBody : labels.failedBody)}
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-ink/8 bg-white p-4">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-steel">
          {labels.score}
        </p>
        <p className="mt-1 text-3xl font-semibold text-ink">{result.score}%</p>
      </div>
      {result.passed ? (
        <a
          href="/dashboard"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
        >
          {labels.continue}
          <ChevronRight className="h-4 w-4" />
        </a>
      ) : null}
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/42">
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function calculateScore(
  answers: Record<AnswerKey, string | null>,
  matchedCargoIds: string[]
) {
  const points = [
    answers.multipleChoice === "The captain checks the cargo.",
    answers.vocabulary === "A safe place for ships",
    answers.listening === "The ship is leaving the harbor.",
    matchedCargoIds.includes("ship"),
    matchedCargoIds.includes("harbor")
  ].filter(Boolean).length;

  return Math.floor((points / 5) * 100);
}
