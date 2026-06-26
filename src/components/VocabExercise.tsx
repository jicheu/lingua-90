import { useMemo, useState } from "react";
import { Check, RotateCw, Star, Volume2 } from "lucide-react";
import type { Store } from "../state/store";
import type { Word } from "../data/types";
import { selectDailyWords } from "../data/vocabData";
import { pronounce } from "../lib/speech";
import { loc } from "../i18n/strings";
import { Button, Card, cn } from "./ui";

export function VocabExercise({
  store,
  day,
  onComplete,
}: {
  store: Store;
  day: number;
  onComplete: () => void;
}) {
  const { state, t } = store;
  const words = useMemo(
    () => selectDailyWords(state.language, day),
    [state.language, day],
  );
  const done = store.getDay(day).vocabDone;
  const [phase, setPhase] = useState<"learn" | "quiz">("learn");

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t("vocab.title")}</h2>
            <p className="text-sm text-slate-500">{t("vocab.hint")}</p>
          </div>
          {done && <DoneTag label={t("common.done")} />}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {words.map((w) => (
            <Flashcard key={w.term} word={w} store={store} />
          ))}
        </div>
      </Card>

      {phase === "learn" ? (
        <div className="flex justify-end">
          <Button onClick={() => setPhase("quiz")}>
            {done ? t("vocab.again") : `${t("vocab.test")} →`}
          </Button>
        </div>
      ) : (
        <MatchUp
          store={store}
          words={words}
          onPass={() => {
            store.completeExercise(day, "vocabDone");
            onComplete();
          }}
          onBack={() => setPhase("learn")}
        />
      )}
    </div>
  );
}

function DoneTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
      <Check size={13} strokeWidth={3} /> {label}
    </span>
  );
}

function Flashcard({ word, store }: { word: Word; store: Store }) {
  const [flipped, setFlipped] = useState(false);
  const { state, t } = store;
  const saved = store.isWordSaved(word.term);
  const showPhonetic = state.language === "en" || state.showPinyin;

  return (
    <div className="perspective h-56">
      <div
        className={cn(
          "preserve-3d relative h-full w-full cursor-pointer rounded-2xl transition-transform duration-500",
          flipped && "rotate-y-180",
        )}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* Front */}
        <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <span className="font-display text-3xl font-semibold">{word.term}</span>
          {showPhonetic && (
            <span className="mt-1 text-sm text-indigo-500">{word.phonetic}</span>
          )}
          <span className="mt-3 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
            {word.category}
          </span>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-slate-300 dark:text-slate-600">
            <RotateCw size={12} /> {t("vocab.flip")}
          </div>
        </div>

        {/* Back */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col rounded-2xl bg-slate-900 p-4 text-left text-white dark:bg-indigo-600">
          <p className="text-lg font-semibold">{loc(state.uiLang, word.translation)}</p>
          <p className="mt-1 text-sm text-slate-300 dark:text-indigo-100">
            {loc(state.uiLang, word.definition)}
          </p>
          <p className="mt-2 border-t border-white/15 pt-2 text-sm italic text-slate-200 dark:text-indigo-50">
            “{word.example}”
          </p>
          <div className="mt-auto flex gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                pronounce(word.term, state.language);
              }}
              className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1.5 text-xs font-medium hover:bg-white/25"
            >
              <Volume2 size={14} /> {t("common.listen")}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                saved
                  ? store.removeSavedWord(word.term)
                  : store.saveWord(word);
              }}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium",
                saved
                  ? "bg-amber-400 text-amber-900"
                  : "bg-white/15 hover:bg-white/25",
              )}
            >
              <Star size={14} fill={saved ? "currentColor" : "none"} />
              {saved ? t("common.saved") : t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MatchUp({
  store,
  words,
  onPass,
  onBack,
}: {
  store: Store;
  words: Word[];
  onPass: () => void;
  onBack: () => void;
}) {
  const { t } = store;
  const terms = useMemo(() => shuffle(words), [words]);
  const defs = useMemo(() => shuffle(words), [words]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const allMatched = matched.size === words.length;

  function pickDef(defTerm: string) {
    if (!selectedTerm) return;
    if (selectedTerm === defTerm) {
      setMatched((m) => new Set(m).add(defTerm));
      setSelectedTerm(null);
    } else {
      setWrong(defTerm);
      setTimeout(() => setWrong(null), 500);
      setSelectedTerm(null);
    }
  }

  return (
    <Card className="p-6">
      <h3 className="mb-1 text-lg font-semibold">{t("vocab.matchTitle")}</h3>
      <p className="mb-4 text-sm text-slate-500">{t("vocab.matchHint")}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {terms.map((w) => {
            const isMatched = matched.has(w.term);
            return (
              <button
                key={w.term}
                disabled={isMatched}
                onClick={() => setSelectedTerm(w.term)}
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-left font-medium transition",
                  isMatched &&
                    "border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
                  !isMatched && selectedTerm === w.term &&
                    "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400 dark:bg-indigo-500/15",
                  !isMatched && selectedTerm !== w.term &&
                    "border-slate-200 hover:border-indigo-400 dark:border-slate-700",
                )}
              >
                {w.term}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {defs.map((w) => {
            const isMatched = matched.has(w.term);
            return (
              <button
                key={w.term}
                disabled={isMatched}
                onClick={() => pickDef(w.term)}
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-left text-sm transition",
                  isMatched &&
                    "border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
                  wrong === w.term && "border-rose-400 bg-rose-50 dark:bg-rose-500/10",
                  !isMatched && wrong !== w.term &&
                    "border-slate-200 hover:border-indigo-400 dark:border-slate-700",
                )}
              >
                {loc(store.state.uiLang, w.translation)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← {t("vocab.reviewCards")}
        </Button>
        {allMatched ? (
          <Button variant="success" onClick={onPass}>
            <Check size={16} /> {t("vocab.perfect")}
          </Button>
        ) : (
          <span className="text-sm text-slate-400">
            {t("vocab.matched", { n: matched.size, total: words.length })}
          </span>
        )}
      </div>
    </Card>
  );
}
