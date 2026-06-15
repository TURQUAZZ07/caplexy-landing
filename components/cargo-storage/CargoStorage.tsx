"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Archive,
  Boxes,
  Check,
  ChevronRight,
  ClipboardList,
  Compass,
  Loader2,
  PackagePlus,
  Plus,
  Ship,
  Sparkles
} from "lucide-react";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
  cargoStudyRewardNm,
  completeCargoStudySession,
  createCargoHold,
  createCargoItem,
  getCargoHoldDetail,
  getCargoStorageOverview,
  type CargoHold,
  type CargoItem,
  type CargoStudyMode
} from "@/lib/cargo-storage";
import { useI18n } from "@/lib/i18n";

type CargoStorageProps = {
  holdId?: string;
};

const modeOptions: Array<{
  key: CargoStudyMode;
  title: string;
  shortTitle: string;
}> = [
  { key: "flashcard", title: "Flashcard", shortTitle: "Manifest Cards" },
  { key: "multiple-choice", title: "Multiple Choice", shortTitle: "Signal Check" },
  { key: "cargo-match", title: "Cargo Match", shortTitle: "Cargo Match" },
  { key: "review", title: "Review Mode", shortTitle: "Review Cargo" }
];

export function CargoStorage({ holdId }: CargoStorageProps) {
  return holdId ? <CargoHoldDetail holdId={holdId} /> : <CargoStorageHome />;
}

function CargoStorageHome() {
  const { locale } = useI18n();
  const [holds, setHolds] = useState<CargoHold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const totalItems = holds.reduce((total, hold) => total + hold.itemCount, 0);
  const latestHold = holds[0] ?? null;

  useEffect(() => {
    void loadHolds();
  }, []);

  async function loadHolds() {
    setIsLoading(true);
    const overview = await getCargoStorageOverview();

    setHolds(overview.holds);
    setMessage(overview.error ? getSyncMessage(overview.error, locale) : "");
    setIsLoading(false);
  }

  async function handleCreateHold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const result = await createCargoHold({ title, description });

    if (result.error) {
      setMessage(result.error);
    } else {
      setTitle("");
      setDescription("");
      setMessage(
        locale === "tr"
          ? "Yeni Cargo Hold manifestoya eklendi."
          : "New Cargo Hold added to the manifest."
      );
      await loadHolds();
    }

    setIsSaving(false);
  }

  return (
    <main className="min-h-screen bg-[#f3f6f1] text-ink">
      <CargoHeader />

      <section className="relative overflow-hidden bg-ink pb-16 pt-8 text-white">
        <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-10" />
        <div className="absolute left-1/2 top-0 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-tide/24 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#f3f6f1] to-transparent" />

        <div className="section-shell relative">
          <div className="dark-glass-panel rounded-lg p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                  <Archive className="h-4 w-4 text-signal" />
                  Cargo Storage
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {locale === "tr"
                    ? "Kelime hazineni Cargo Holds ile duzenle."
                    : "Organize vocabulary into Cargo Holds."}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {locale === "tr"
                    ? "Load Cargo, Review Cargo ve Cargo Match oturumlariyla kelime calismasini denizcilik manifestosuna donustur."
                    : "Turn vocabulary study into maritime cargo operations with Load Cargo, Review Cargo and Cargo Match sessions."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMetric label="Cargo Holds" value={String(holds.length)} />
                <HeroMetric label="Cargo Items" value={String(totalItems)} />
                <HeroMetric label="Session Reward" value={`+${cargoStudyRewardNm} NM`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell -mt-10 grid gap-6 pb-12 lg:grid-cols-[0.82fr_1.18fr]">
        <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ink text-white">
              <PackagePlus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-ink">Load Cargo Hold</h2>
              <p className="mt-2 text-sm leading-6 text-steel">
                {locale === "tr"
                  ? "Yeni bir kelime koleksiyonu olustur ve manifestoya ekle."
                  : "Create a vocabulary collection and add it to your manifest."}
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateHold} className="mt-6 grid gap-4">
            <FieldLabel label="Cargo Hold Name">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="YKS Vocabulary"
                className="h-12 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 text-sm font-semibold text-ink outline-none transition focus:border-tide"
              />
            </FieldLabel>
            <FieldLabel label="Manifest Note">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Exam-focused cargo for academic words."
                className="min-h-24 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 py-3 text-sm font-semibold leading-6 text-ink outline-none transition focus:border-tide"
              />
            </FieldLabel>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor disabled:cursor-not-allowed disabled:bg-steel disabled:hover:translate-y-0"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Load Cargo
            </button>
          </form>

          {message ? (
            <p className="mt-4 rounded-lg border border-ink/8 bg-[#f6f8f3] p-3 text-sm font-semibold text-steel">
              {message}
            </p>
          ) : null}
        </article>

        <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-tide/10 px-3 py-2 text-sm font-bold text-tide">
                <ClipboardList className="h-4 w-4" />
                Cargo Manifest
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-ink">Recent Cargo Holds</h2>
              <p className="mt-2 text-sm leading-6 text-steel">
                {locale === "tr"
                  ? "Son yuklenen kelime ambarlarini incele ve calismaya devam et."
                  : "Inspect your latest vocabulary holds and continue studying."}
              </p>
            </div>
            {latestHold ? (
              <a
                href={`/cargo-storage/${latestHold.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-tide px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
              >
                Continue Studying
                <ChevronRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <LoadingCard label="Loading cargo manifest..." />
            ) : holds.length > 0 ? (
              holds.map((hold) => <CargoHoldCard key={hold.id} hold={hold} />)
            ) : (
              <EmptyCargoState />
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function CargoHoldDetail({ holdId }: { holdId: string }) {
  const { locale } = useI18n();
  const [hold, setHold] = useState<CargoHold | null>(null);
  const [items, setItems] = useState<CargoItem[]>([]);
  const [activeMode, setActiveMode] = useState<CargoStudyMode>("flashcard");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    englishWord: "",
    nativeMeaning: "",
    exampleSentence: "",
    pronunciation: "",
    note: ""
  });

  useEffect(() => {
    void loadHold();
  }, [holdId]);

  async function loadHold() {
    setIsLoading(true);
    const detail = await getCargoHoldDetail(holdId);

    setHold(detail.hold);
    setItems(detail.items);
    setMessage(detail.error ? getSyncMessage(detail.error, locale) : "");
    setIsLoading(false);
  }

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hold) {
      return;
    }

    setIsSaving(true);
    const result = await createCargoItem({
      holdId: hold.id,
      ...form
    });

    if (result.error) {
      setMessage(result.error);
    } else {
      setForm({
        englishWord: "",
        nativeMeaning: "",
        exampleSentence: "",
        pronunciation: "",
        note: ""
      });
      setMessage("Cargo Item loaded into the manifest.");
      await loadHold();
    }

    setIsSaving(false);
  }

  return (
    <main className="min-h-screen bg-[#f3f6f1] text-ink">
      <CargoHeader />

      <section className="relative overflow-hidden bg-ink pb-16 pt-8 text-white">
        <div className="absolute inset-0 bg-chart-grid bg-[size:44px_44px] opacity-10" />
        <div className="absolute left-1/2 top-0 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-tide/24 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#f3f6f1] to-transparent" />

        <div className="section-shell relative">
          <div className="dark-glass-panel rounded-lg p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <a
                  href="/cargo-storage"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78 transition hover:bg-white/16"
                >
                  <Anchor className="h-4 w-4 text-signal" />
                  Cargo Storage
                </a>
                <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  {isLoading ? "Loading Cargo Hold" : hold?.title ?? "Cargo Hold"}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/68">
                  {hold?.description ||
                    "Load, review and match vocabulary cargo before your next voyage."}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMetric label="Cargo Items" value={String(items.length)} />
                <HeroMetric label="Study Modes" value="4" />
                <HeroMetric label="Reward" value={`+${cargoStudyRewardNm} NM`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell -mt-10 grid gap-6 pb-12 xl:grid-cols-[0.76fr_1.24fr]">
        <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ink text-white">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-ink">Load Cargo Item</h2>
              <p className="mt-2 text-sm leading-6 text-steel">
                Add words to this Cargo Hold. Each item belongs to the active manifest.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddItem} className="mt-6 grid gap-4">
            <FieldLabel label="English Word">
              <input
                value={form.englishWord}
                onChange={(event) =>
                  setForm((current) => ({ ...current, englishWord: event.target.value }))
                }
                placeholder="harbor"
                className="h-12 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 text-sm font-semibold text-ink outline-none transition focus:border-tide"
              />
            </FieldLabel>
            <FieldLabel label="Native Meaning">
              <input
                value={form.nativeMeaning}
                onChange={(event) =>
                  setForm((current) => ({ ...current, nativeMeaning: event.target.value }))
                }
                placeholder="liman"
                className="h-12 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 text-sm font-semibold text-ink outline-none transition focus:border-tide"
              />
            </FieldLabel>
            <FieldLabel label="Example Sentence">
              <textarea
                value={form.exampleSentence}
                onChange={(event) =>
                  setForm((current) => ({ ...current, exampleSentence: event.target.value }))
                }
                placeholder="The ship is leaving the harbor."
                className="min-h-24 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 py-3 text-sm font-semibold leading-6 text-ink outline-none transition focus:border-tide"
              />
            </FieldLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldLabel label="Pronunciation">
                <input
                  value={form.pronunciation}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, pronunciation: event.target.value }))
                  }
                  placeholder="/HAR-bor/"
                  className="h-12 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 text-sm font-semibold text-ink outline-none transition focus:border-tide"
                />
              </FieldLabel>
              <FieldLabel label="Cargo Note">
                <input
                  value={form.note}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, note: event.target.value }))
                  }
                  placeholder="Useful in travel routes"
                  className="h-12 rounded-lg border border-ink/10 bg-[#f6f8f3] px-4 text-sm font-semibold text-ink outline-none transition focus:border-tide"
                />
              </FieldLabel>
            </div>
            <button
              type="submit"
              disabled={isSaving || !hold}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor disabled:cursor-not-allowed disabled:bg-steel disabled:hover:translate-y-0"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Load Cargo
            </button>
          </form>

          {message ? (
            <p className="mt-4 rounded-lg border border-ink/8 bg-[#f6f8f3] p-3 text-sm font-semibold text-steel">
              {message}
            </p>
          ) : null}
        </article>

        <section className="grid gap-6">
          <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-signal/24 px-3 py-2 text-sm font-bold text-ink">
                  <Compass className="h-4 w-4" />
                  Study Modes
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-ink">Review Cargo Manifest</h2>
                <p className="mt-2 text-sm leading-6 text-steel">
                  Complete a full study session to earn NM. Clicking through individual cargo does not award NM.
                </p>
              </div>
              <span className="w-fit rounded-lg bg-tide/10 px-3 py-2 text-sm font-bold text-tide">
                +{cargoStudyRewardNm} NM per completed session
              </span>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-4">
              {modeOptions.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setActiveMode(mode.key)}
                  className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
                    activeMode === mode.key
                      ? "border-ink bg-ink text-white"
                      : "border-ink/8 bg-[#f6f8f3] text-ink hover:bg-white"
                  }`}
                >
                  {mode.title}
                </button>
              ))}
            </div>
          </article>

          <StudyModePanel
            key={`${holdId}-${activeMode}`}
            mode={activeMode}
            hold={hold}
            items={items}
          />

          <section className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-tide/10 text-tide">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-ink">Cargo Manifest</h2>
                <p className="mt-2 text-sm leading-6 text-steel">
                  Every Cargo Item in this hold, ready for voyage review.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {isLoading ? (
                <LoadingCard label="Loading cargo items..." />
              ) : items.length > 0 ? (
                items.map((item) => <CargoItemCard key={item.id} item={item} />)
              ) : (
                <EmptyCargoState />
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function StudyModePanel({
  mode,
  hold,
  items
}: {
  mode: CargoStudyMode;
  hold: CargoHold | null;
  items: CargoItem[];
}) {
  const [flashIndex, setFlashIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedCargoWord, setSelectedCargoWord] = useState<string | null>(null);
  const [matchedCargoIds, setMatchedCargoIds] = useState<string[]>([]);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [isRewarding, setIsRewarding] = useState(false);
  const [sessionResult, setSessionResult] = useState<{
    awarded: boolean;
    currentNm: number;
    error: string | null;
  } | null>(null);
  const activeMode = modeOptions.find((option) => option.key === mode);
  const totalItems = items.length;
  const currentItem = items[Math.min(flashIndex, Math.max(0, totalItems - 1))];
  const currentQuestion = items[Math.min(questionIndex, Math.max(0, totalItems - 1))];
  const multipleChoiceOptions = useMemo(
    () => buildChoiceOptions(items, currentQuestion),
    [items, currentQuestion]
  );
  const completion = getModeCompletion(mode, {
    totalItems,
    flashIndex,
    questionIndex,
    selectedAnswer,
    matchedCargoIds,
    reviewedIds
  });
  const canComplete = totalItems > 0 && completion.percent >= 100;

  async function finishSession() {
    if (!hold || sessionResult || !canComplete) {
      return;
    }

    setIsRewarding(true);
    const result = await completeCargoStudySession({
      holdId: hold.id,
      holdTitle: hold.title,
      mode
    });

    setSessionResult(result);
    setIsRewarding(false);
  }

  function answerQuestion(answer: string) {
    if (selectedAnswer) {
      return;
    }

    setSelectedAnswer(answer);

    if (answer === currentQuestion?.nativeMeaning) {
      setCorrectAnswers((current) => current + 1);
    }
  }

  function nextQuestion() {
    setSelectedAnswer(null);
    setQuestionIndex((current) => Math.min(totalItems, current + 1));
  }

  function chooseCargoMeaning(itemId: string) {
    if (!selectedCargoWord) {
      return;
    }

    if (selectedCargoWord === itemId) {
      setMatchedCargoIds((current) =>
        current.includes(itemId) ? current : [...current, itemId]
      );
    }

    setSelectedCargoWord(null);
  }

  return (
    <article className="rounded-lg border border-ink/8 bg-white p-6 shadow-soft">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-tide/10 px-3 py-2 text-sm font-bold text-tide">
            <Sparkles className="h-4 w-4" />
            {activeMode?.shortTitle ?? "Review Cargo"}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            {activeMode?.title ?? "Study Mode"} Session
          </h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Progress the session to 100%, then complete the manifest to earn NM.
          </p>
        </div>
        <div className="w-full rounded-lg border border-ink/8 bg-[#f6f8f3] p-4 sm:w-56">
          <div className="flex items-center justify-between text-sm font-bold text-steel">
            <span>Session</span>
            <span>{completion.percent}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-tide via-glass to-signal transition-all"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="mt-6 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5 text-sm font-semibold text-steel">
          Load at least one Cargo Item before starting a study session.
        </div>
      ) : null}

      {mode === "flashcard" && currentItem ? (
        <div className="mt-6 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
            Manifest Card {Math.min(flashIndex + 1, totalItems)} / {totalItems}
          </p>
          <h3 className="mt-3 text-4xl font-semibold text-ink">
            {currentItem.englishWord}
          </h3>
          {isRevealed ? (
            <div className="mt-5 grid gap-3">
              <p className="text-2xl font-semibold text-tide">{currentItem.nativeMeaning}</p>
              <p className="text-sm leading-6 text-steel">{currentItem.exampleSentence}</p>
              {currentItem.note ? (
                <p className="rounded-lg bg-white p-3 text-sm font-semibold text-ink">
                  {currentItem.note}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsRevealed(true)}
              className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
            >
              Reveal Cargo
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRevealed(false);
                setFlashIndex((current) => Math.min(totalItems, current + 1));
              }}
              disabled={!isRevealed}
              className="inline-flex items-center justify-center rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:text-steel disabled:hover:translate-y-0"
            >
              Next Cargo
            </button>
          </div>
        </div>
      ) : null}

      {mode === "multiple-choice" && currentQuestion && questionIndex < totalItems ? (
        <div className="mt-6 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
            Signal Check {questionIndex + 1} / {totalItems}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-ink">
            What does "{currentQuestion.englishWord}" mean?
          </h3>
          <div className="mt-5 grid gap-3">
            {multipleChoiceOptions.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.nativeMeaning;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => answerQuestion(option)}
                  className={`rounded-lg border p-3 text-left text-sm font-bold transition ${
                    selectedAnswer && isCorrect
                      ? "border-tide bg-tide/10 text-tide"
                      : isSelected
                        ? "border-coral/30 bg-coral/10 text-coral"
                        : "border-ink/8 bg-white text-ink hover:bg-[#f6f8f3]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-steel">
              Correct cargo: {correctAnswers} / {totalItems}
            </p>
            <button
              type="button"
              onClick={nextQuestion}
              disabled={!selectedAnswer}
              className="rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor disabled:cursor-not-allowed disabled:bg-steel disabled:hover:translate-y-0"
            >
              Next Signal
            </button>
          </div>
        </div>
      ) : null}

      {mode === "cargo-match" ? (
        <div className="mt-6 rounded-lg border border-ink/8 bg-[#f6f8f3] p-5">
          <p className="text-sm font-bold text-steel">
            Matched cargo: {matchedCargoIds.length} / {totalItems}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="grid gap-3">
              {items
                .filter((item) => !matchedCargoIds.includes(item.id))
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCargoWord(item.id)}
                    className={`rounded-lg border p-3 text-left text-sm font-bold transition ${
                      selectedCargoWord === item.id
                        ? "border-signal bg-signal/18 text-ink"
                        : "border-ink/8 bg-white text-ink hover:bg-[#f6f8f3]"
                    }`}
                  >
                    {item.englishWord}
                  </button>
                ))}
            </div>
            <div className="grid gap-3">
              {[...items]
                .reverse()
                .filter((item) => !matchedCargoIds.includes(item.id))
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseCargoMeaning(item.id)}
                    className="rounded-lg border border-ink/8 bg-white p-3 text-left text-sm font-bold text-ink transition hover:bg-[#f6f8f3]"
                  >
                    {item.nativeMeaning}
                  </button>
                ))}
            </div>
          </div>
        </div>
      ) : null}

      {mode === "review" ? (
        <div className="mt-6 grid gap-3">
          {items.map((item) => {
            const isReviewed = reviewedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setReviewedIds((current) =>
                    current.includes(item.id) ? current : [...current, item.id]
                  )
                }
                className={`flex items-start gap-3 rounded-lg border p-4 text-left transition ${
                  isReviewed
                    ? "border-tide bg-tide/10"
                    : "border-ink/8 bg-[#f6f8f3] hover:bg-white"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border ${
                    isReviewed ? "border-tide bg-tide text-white" : "border-steel/30 bg-white"
                  }`}
                >
                  {isReviewed ? <Check className="h-4 w-4" /> : null}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">
                    {item.englishWord} = {item.nativeMeaning}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-steel">
                    {item.exampleSentence}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-steel">
          {completion.label}
        </div>
        <button
          type="button"
          onClick={finishSession}
          disabled={!canComplete || isRewarding || Boolean(sessionResult)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-tide px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor disabled:cursor-not-allowed disabled:bg-steel disabled:hover:translate-y-0"
        >
          {isRewarding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Complete Session
        </button>
      </div>

      {sessionResult ? (
        <div className="mt-5 rounded-lg border border-signal/30 bg-signal/18 p-4">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-steel">
            Cargo Session Complete
          </p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            +{cargoStudyRewardNm} NM earned
          </p>
          <p className="mt-2 text-sm font-semibold text-steel">
            Current NM: {sessionResult.currentNm}
            {sessionResult.error ? ` - ${sessionResult.error}` : ""}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function CargoHeader() {
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
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/dashboard">
            Dashboard
          </a>
          <a className="rounded-lg bg-white/12 px-3 py-2 text-white" href="/cargo-storage">
            Cargo Storage
          </a>
          <a className="rounded-lg px-3 py-2 hover:bg-white/10" href="/academy">
            Academy
          </a>
          <AuthHeaderActions
            dashboardLabel="Dashboard"
            loginLabel="Login"
            registerLabel="Register"
            profileLabel="Profile"
            logoutLabel="Logout"
            compact
          />
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}

function CargoHoldCard({ hold }: { hold: CargoHold }) {
  return (
    <article className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-5 transition hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ink text-white">
          <Archive className="h-6 w-6" />
        </div>
        <span className="rounded-lg bg-signal/24 px-2.5 py-1 text-xs font-bold text-ink">
          {hold.itemCount} Cargo Items
        </span>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-ink">{hold.title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-steel">
        {hold.description || "Vocabulary cargo ready for review."}
      </p>
      <a
        href={`/cargo-storage/${hold.id}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-tide px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
      >
        Review Cargo
        <ChevronRight className="h-4 w-4" />
      </a>
    </article>
  );
}

function CargoItemCard({ item }: { item: CargoItem }) {
  return (
    <article className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">{item.englishWord}</h3>
          <p className="mt-1 text-sm font-bold text-tide">{item.nativeMeaning}</p>
        </div>
        {item.pronunciation ? (
          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-steel">
            {item.pronunciation}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-steel">{item.exampleSentence}</p>
      {item.note ? (
        <p className="mt-3 rounded-lg bg-white p-3 text-xs font-bold text-ink">
          {item.note}
        </p>
      ) : null}
    </article>
  );
}

function FieldLabel({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-steel">
        {label}
      </span>
      {children}
    </label>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/8 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/42">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-5 text-sm font-bold text-steel">
      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function EmptyCargoState() {
  return (
    <div className="rounded-lg border border-ink/8 bg-[#f6f8f3] p-5 text-sm font-semibold text-steel md:col-span-2">
      No cargo loaded yet. Create a Cargo Hold, then load Cargo Items into the manifest.
    </div>
  );
}

function getModeCompletion(
  mode: CargoStudyMode,
  state: {
    totalItems: number;
    flashIndex: number;
    questionIndex: number;
    selectedAnswer: string | null;
    matchedCargoIds: string[];
    reviewedIds: string[];
  }
) {
  if (state.totalItems <= 0) {
    return {
      percent: 0,
      label: "Load cargo before starting."
    };
  }

  if (mode === "flashcard") {
    const viewed = Math.min(state.totalItems, state.flashIndex);

    return {
      percent: Math.floor((viewed / state.totalItems) * 100),
      label: `${viewed} / ${state.totalItems} manifest cards reviewed`
    };
  }

  if (mode === "multiple-choice") {
    const answered =
      state.questionIndex >= state.totalItems
        ? state.totalItems
        : state.questionIndex + (state.selectedAnswer ? 1 : 0);

    return {
      percent: Math.floor((answered / state.totalItems) * 100),
      label: `${answered} / ${state.totalItems} signal checks answered`
    };
  }

  if (mode === "cargo-match") {
    return {
      percent: Math.floor((state.matchedCargoIds.length / state.totalItems) * 100),
      label: `${state.matchedCargoIds.length} / ${state.totalItems} cargo matched`
    };
  }

  return {
    percent: Math.floor((state.reviewedIds.length / state.totalItems) * 100),
    label: `${state.reviewedIds.length} / ${state.totalItems} cargo reviewed`
  };
}

function buildChoiceOptions(items: CargoItem[], currentItem: CargoItem | undefined) {
  if (!currentItem) {
    return [];
  }

  const options = [
    currentItem.nativeMeaning,
    ...items
      .filter((item) => item.id !== currentItem.id)
      .map((item) => item.nativeMeaning),
    "rota",
    "crew"
  ];

  return Array.from(new Set(options)).slice(0, 4).sort();
}

function getSyncMessage(error: string, locale: string) {
  if (error.includes("Sign in") || error.includes("No authenticated")) {
    return locale === "tr"
      ? "Giris yapinca Cargo Storage Supabase ile senkronlanir. Simdilik yerel manifesto kullaniliyor."
      : "Sign in to sync Cargo Storage with Supabase. A local manifest is available for now.";
  }

  return error;
}
