import { useRef, useState } from "react";
import { Check, RefreshCw, Volume2, X } from "lucide-react";
import type { Store } from "../state/store";
import type { Word } from "../data/types";
import { pronounce } from "../lib/speech";
import { pickSession } from "../lib/srs";
import { loc } from "../i18n/strings";
import { Button, Card, ProgressBar, cn } from "./ui";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildChoices(current: Word, pool: Word[]): Word[] {
  const others = shuffle(pool.filter((w) => w.term !== current.term)).slice(0, 4);
  const pos = Math.floor(Math.random() * (others.length + 1));
  const result = [...others];
  result.splice(pos, 0, current);
  return result;
}

export function FlashcardReview({ store }: { store: Store }) {
  const { state, t } = store;
  const allWords = state.savedWords[state.language];
  const choicesRef = useRef<Word[][]>([]);

  function buildSession(): Word[] {
    const s = pickSession(allWords, state.sessionSize);
    choicesRef.current = s.map((w) => buildChoices(w, allWords));
    return s;
  }

  const [session, setSession] = useState<Word[]>(buildSession);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<Word | null>(null);
  const [pending, setPending] = useState(false);
  const [known, setKnown] = useState(0);
  const [missed, setMissed] = useState(0);

  const showPhonetic = state.language === "en" || state.showPinyin;
  const finished = i >= session.length;

  function advance(ok: boolean) {
    store.recordFlashcard(session[i].term, ok);
    if (ok) setKnown((k) => k + 1);
    else setMissed((m) => m + 1);
    setTimeout(() => {
      setSelected(null);
      setPending(false);
      setI((x) => x + 1);
    }, 700);
  }

  function pick(choice: Word) {
    if (pending) return;
    setSelected(choice);
    setPending(true);
    advance(choice.term === w.term);
  }

  function miss() {
    if (pending) return;
    setPending(true);
    advance(false);
  }

  function restart() {
    const s = buildSession();
    setSession(s);
    setI(0);
    setSelected(null);
    setKnown(0);
    setMissed(0);
    setPending(false);
  }

  if (session.length === 0) return null;

  if (finished) {
    return (
      <Card className="p-8 text-center">
        <Check className="mx-auto mb-2 text-emerald-500" size={34} />
        <h2 className="font-display text-xl font-semibold">{t("srs.complete")}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {t("srs.summary", { known, missed })}
        </p>
        <Button className="mx-auto mt-5" onClick={restart}>
          <RefreshCw size={16} /> {t("srs.again")}
        </Button>
      </Card>
    );
  }

  const w = session[i];
  const choices = choicesRef.current[i] ?? [];

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t("srs.title")}
        </h2>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {t("srs.progress", { current: i + 1, total: session.length })}
        </span>
      </div>
      <ProgressBar value={(i / session.length) * 100} />

      <div className="mx-auto mt-4 flex min-h-[7rem] max-w-md flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <span className="font-display text-3xl font-semibold">{w.term}</span>
        {showPhonetic && w.phonetic && (
          <span className="mt-1 text-sm text-indigo-500">{w.phonetic}</span>
        )}
      </div>

      <div className="mt-3 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => pronounce(w.term, state.language)}
        >
          <Volume2 size={15} /> {t("common.listen")}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const isSelected = selected?.term === choice.term;
          const isCorrect = choice.term === w.term;
          let cls: string;
          if (isSelected && isCorrect) {
            cls = "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300";
          } else if (isSelected && !isCorrect) {
            cls = "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-500/10 dark:text-rose-300";
          } else if (pending && isCorrect) {
            cls = "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300";
          } else {
            cls = "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800";
          }
          return (
            <button
              key={choice.term}
              disabled={pending}
              onClick={() => pick(choice)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                cls,
              )}
            >
              {loc(state.uiLang, choice.translation)}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={miss}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-sm font-medium transition",
            "border-rose-300 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10",
          )}
        >
          <X size={15} /> {t("srs.missed")}
        </button>
      </div>
    </Card>
  );
}
