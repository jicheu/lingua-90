import { useState } from "react";
import { Check, Eye, EyeOff, RefreshCw, Volume2, X } from "lucide-react";
import type { Store } from "../state/store";
import type { Word } from "../data/types";
import { pronounce } from "../lib/speech";
import { pickSession } from "../lib/srs";
import { loc } from "../i18n/strings";
import { Button, Card, ProgressBar, cn } from "./ui";

/**
 * Spaced-repetition flashcard session over the learner's saved words. Cards the
 * learner misses come back sooner and more often; well-known cards appear
 * rarely. Session length is configurable (Settings → cards per session).
 */
export function FlashcardReview({ store }: { store: Store }) {
  const { state, t } = store;

  const build = () =>
    pickSession(state.savedWords[state.language], state.sessionSize);

  const [session, setSession] = useState<Word[]>(build);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [missed, setMissed] = useState(0);

  const showPhonetic = state.language === "en" || state.showPinyin;
  const finished = i >= session.length;

  function answer(ok: boolean) {
    store.recordFlashcard(session[i].term, ok);
    if (ok) setKnown((k) => k + 1);
    else setMissed((m) => m + 1);
    setRevealed(false);
    setI((x) => x + 1);
  }

  function restart() {
    setSession(build());
    setI(0);
    setRevealed(false);
    setKnown(0);
    setMissed(0);
  }

  if (session.length === 0) {
    return null;
  }

  if (finished) {
    return (
      <Card className="p-8 text-center">
        <Check className="mx-auto mb-2 text-emerald-500" size={34} />
        <h2 className="font-display text-xl font-semibold">
          {t("srs.complete")}
        </h2>
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

      <div
        className="mx-auto mt-4 flex min-h-[14rem] max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900"
        onClick={() => setRevealed((r) => !r)}
      >
        <span className="font-display text-3xl font-semibold">{w.term}</span>
        {showPhonetic && w.phonetic && (
          <span className="mt-1 text-sm text-indigo-500">{w.phonetic}</span>
        )}
        {revealed ? (
          <div className="mt-4">
            <p className="text-lg font-medium">
              {loc(state.uiLang, w.translation)}
            </p>
            {loc(state.uiLang, w.definition) && (
              <p className="mt-1 text-sm text-slate-500">
                {loc(state.uiLang, w.definition)}
              </p>
            )}
            {w.example && (
              <p className="mt-2 text-sm italic text-slate-400">“{w.example}”</p>
            )}
          </div>
        ) : (
          <span className="mt-4 flex items-center gap-1 text-xs text-slate-400">
            <Eye size={12} /> {t("review.reveal")}
          </span>
        )}
        {revealed && (
          <span className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <EyeOff size={12} /> {t("review.hide")}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => pronounce(w.term, state.language)}
        >
          <Volume2 size={15} /> {t("common.listen")}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => answer(false)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3 text-sm font-medium transition",
            "border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10",
          )}
        >
          <X size={16} /> {t("srs.missed")}
        </button>
        <button
          onClick={() => answer(true)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3 text-sm font-medium transition",
            "border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/10",
          )}
        >
          <Check size={16} /> {t("srs.known")}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">{t("srs.hint")}</p>
    </Card>
  );
}
