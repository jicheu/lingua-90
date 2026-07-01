import { useMemo, useState } from "react";
import { Check, ChevronRight, RefreshCw, Zap } from "lucide-react";
import type { Store } from "../state/store";
import type { VerbEntry, VerbExample } from "../data/types";
import { VERBS_SESSION_SIZE, getVerbPool } from "../data/verbs";
import { loc, type StringKey } from "../i18n/strings";
import { Button, Card, ProgressBar, cn } from "./ui";

interface Prompt {
  verb: VerbEntry;
  example: VerbExample;
}

/**
 * Fill-in-the-blank drill over the growing pool of irregular verbs. Newer
 * verbs are weighted more heavily; each session tests ~5 prompts. Marks
 * `verbsDone` when the learner answers every prompt correctly.
 */
function buildSession(pool: VerbEntry[]): Prompt[] {
  if (pool.length === 0) return [];
  const prompts: Prompt[] = [];
  const weighted = pool.map((v, i) => ({ verb: v, weight: pool.length - i }));

  for (let n = 0; n < VERBS_SESSION_SIZE; n++) {
    const total = weighted.reduce((a, p) => a + p.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < weighted.length; idx++) {
      r -= weighted[idx].weight;
      if (r <= 0) break;
    }
    idx = Math.min(idx, weighted.length - 1);
    const verb = weighted[idx].verb;
    const example = verb.examples[Math.floor(Math.random() * verb.examples.length)];
    prompts.push({ verb, example });
  }
  return prompts;
}

function normalise(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?;:]/g, "");
}

export function VerbsExercise({
  store,
  day,
  onComplete,
}: {
  store: Store;
  day: number;
  onComplete: () => void;
}) {
  const { state, t } = store;
  const done = store.getDay(day).verbsDone;
  const pool = useMemo(
    () => getVerbPool(state.language, day),
    [state.language, day],
  );

  const [session, setSession] = useState<Prompt[]>(() => buildSession(pool));
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState<null | "correct" | "wrong">(null);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);

  function check() {
    if (showAnswer) return;
    const ok = normalise(input) === normalise(session[i].example.answer);
    setShowAnswer(ok ? "correct" : "wrong");
    if (ok) setRight((r) => r + 1);
    else setWrong((w) => w + 1);
  }

  function next() {
    setShowAnswer(null);
    setInput("");
    setI((x) => x + 1);
  }

  function restart() {
    setSession(buildSession(pool));
    setI(0);
    setInput("");
    setShowAnswer(null);
    setRight(0);
    setWrong(0);
  }

  const finished = i >= session.length;

  if (pool.length === 0 || session.length === 0) {
    return (
      <Card className="p-10 text-center text-slate-400">
        {t("verbs.noPool")}
      </Card>
    );
  }

  if (finished) {
    const perfect = wrong === 0;
    return (
      <Card className="p-8 text-center">
        <div className={cn(
          "mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full",
          perfect ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
        )}>
          {perfect ? <Check size={28} strokeWidth={3} /> : <RefreshCw size={26} />}
        </div>
        <h2 className="font-display text-xl font-semibold">
          {perfect ? t("verbs.perfect") : t("verbs.tryAgain")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {t("verbs.summary", { correct: right, total: session.length })}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="outline" onClick={restart}>
            <RefreshCw size={16} /> {t("verbs.again")}
          </Button>
          {perfect && (
            <Button
              variant="success"
              onClick={() => {
                if (!done) store.completeExercise(day, "verbsDone");
                onComplete();
              }}
            >
              {t("verbs.continue")} <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const prompt = session[i];
  const [before, after] = prompt.example.sentence.split("___");

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Zap size={13} /> {t("verbs.title")}
        </h2>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {i + 1} / {session.length}
        </span>
      </div>
      <ProgressBar value={(i / session.length) * 100} />

      <div className="mx-auto mt-5 max-w-lg text-center">
        <p className="mb-1 text-sm text-slate-500">
          {t("verbs.hint", {
            infinitive: prompt.verb.infinitive,
            translation: loc(state.uiLang, prompt.verb.translation),
          })}
        </p>
        <p className="text-xs uppercase tracking-wide text-indigo-500">
          {t(`verbs.tense.${prompt.example.tense}` as StringKey)}
        </p>

        <div className="mt-5 text-lg leading-relaxed sm:text-xl">
          <span>{before}</span>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (showAnswer) next();
                else check();
              }
            }}
            disabled={showAnswer !== null}
            placeholder="___"
            className={cn(
              "mx-1 inline-block w-40 rounded-lg border-b-2 bg-transparent px-2 py-1 text-center font-semibold outline-none transition",
              showAnswer === "correct" && "border-emerald-500 text-emerald-700 dark:text-emerald-300",
              showAnswer === "wrong" && "border-rose-500 text-rose-700 dark:text-rose-300",
              !showAnswer && "border-indigo-400 focus:border-indigo-600",
            )}
          />
          <span>{after}</span>
        </div>

        {showAnswer === "wrong" && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {t("verbs.correctAnswer")}: <strong>{prompt.example.answer}</strong>
          </p>
        )}
        {showAnswer === "correct" && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Check className="mr-1 inline" size={14} /> {t("verbs.nice")}
          </p>
        )}

        <div className="mt-5 flex justify-center gap-2">
          {showAnswer === null ? (
            <Button onClick={check} disabled={input.trim().length === 0}>
              {t("verbs.check")}
            </Button>
          ) : (
            <Button variant="success" onClick={next}>
              {t("verbs.next")} <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
