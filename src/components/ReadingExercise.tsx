import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignLeft,
  Check,
  Languages,
  PartyPopper,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import type { Store } from "../state/store";
import type { LanguageCode, TopicId, UiLang } from "../data/types";
import { getLessonForDay } from "../data/topicData";
import { speakSentence, stopSpeaking } from "../lib/speech";
import { splitSentences } from "../lib/sentences";
import { translateText } from "../lib/translate";
import { loc } from "../i18n/strings";
import { Translatable } from "./Translatable";
import { Button, Card, cn } from "./ui";

type ReadMode = "normal" | "sentence" | "sync";

const LANG_LABEL: Record<LanguageCode | UiLang, string> = {
  en: "English",
  fr: "Français",
  zh: "中文",
};

export function ReadingExercise({
  store,
  day,
  topic,
}: {
  store: Store;
  day: number;
  topic: TopicId;
}) {
  const { state, t } = store;
  const lesson = getLessonForDay(state.language, topic, day);
  const { reading } = lesson;
  const done = store.getDay(day).readingDone;

  const [phase, setPhase] = useState<"read" | "quiz">("read");
  const [readingAloud, setReadingAloud] = useState(false);
  const [mode, setMode] = useState<ReadMode>("normal");
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Synchronised-translation state (online-only).
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [transError, setTransError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const isPlayer = mode === "sentence" || mode === "sync";
  // Synchronised translation is pointless when the interface language is the
  // same as the language being learned.
  const canSync = state.uiLang !== state.language;

  // Sentences grouped by paragraph, each tagged with a global index so we can
  // play them in order while keeping the original paragraph layout.
  const sentenceParas = useMemo(() => {
    let idx = 0;
    return reading.paragraphs.map((p) =>
      splitSentences(p, state.language).map((text) => ({ text, index: idx++ })),
    );
  }, [reading, state.language]);
  const sentences = useMemo(() => sentenceParas.flat(), [sentenceParas]);

  const sentencesRef = useRef(sentences);
  sentencesRef.current = sentences;
  const langRef = useRef(state.language);
  langRef.current = state.language;
  // Bumped whenever playback is (re)started or stopped; lets us ignore the
  // stale `onEnd` that fires when an in-flight utterance is cancelled.
  const tokenRef = useRef(0);
  const activeElRef = useRef<HTMLElement | null>(null);
  const setActiveEl = useCallback((el: HTMLElement | null) => {
    activeElRef.current = el;
  }, []);

  // Track connectivity so the sync button can be disabled when offline.
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Fetch translations for every sentence while in sync mode. Each result is
  // applied as soon as it arrives so highlighting can begin immediately.
  useEffect(() => {
    if (mode !== "sync") return;
    const controller = new AbortController();
    let cancelled = false;
    setTranslations({});
    setTransError(false);
    const list = sentences;
    (async () => {
      let anyError = false;
      await Promise.all(
        list.map(async (s) => {
          try {
            const tr = await translateText(
              s.text,
              state.language,
              state.uiLang,
              controller.signal,
            );
            if (!cancelled) {
              setTranslations((m) => ({ ...m, [s.index]: tr }));
            }
          } catch {
            if (!cancelled && !controller.signal.aborted) anyError = true;
          }
        }),
      );
      if (!cancelled) setTransError(anyError);
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [mode, sentences, state.language, state.uiLang, retryTick]);

  // Keep the active sentence in view as playback advances.
  useEffect(() => {
    if (isPlayer) {
      activeElRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [active, isPlayer]);

  // Play sentence `i`, then chain to the next one when it finishes.
  const playFrom = useCallback(function play(i: number) {
    const list = sentencesRef.current;
    if (i < 0 || i >= list.length) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    const token = ++tokenRef.current;
    setActive(i);
    setPlaying(true);
    const ok = speakSentence(list[i].text, langRef.current, {
      onEnd: () => {
        if (tokenRef.current !== token) return; // superseded by a newer action
        if (i + 1 < list.length) play(i + 1);
        else setPlaying(false);
      },
    });
    if (!ok) setPlaying(false);
  }, []);

  const pausePlayback = useCallback(() => {
    tokenRef.current++;
    stopSpeaking();
    setPlaying(false);
  }, []);

  function enterMode(next: "sentence" | "sync") {
    stopSpeaking();
    setReadingAloud(false);
    setActive(0);
    setMode(next);
    playFrom(0);
  }

  function exitMode() {
    pausePlayback();
    setMode("normal");
  }

  function togglePlay() {
    if (playing) pausePlayback();
    else playFrom(active);
  }

  // Stop any audio when the component unmounts.
  useEffect(
    () => () => {
      tokenRef.current++;
      stopSpeaking();
    },
    [],
  );

  function readAloud() {
    if (readingAloud) {
      tokenRef.current++;
      stopSpeaking();
      setReadingAloud(false);
      return;
    }
    setReadingAloud(true);
    const list = sentencesRef.current;
    const token = ++tokenRef.current;
    const step = (i: number) => {
      if (tokenRef.current !== token) return;
      if (i >= list.length) {
        setReadingAloud(false);
        return;
      }
      const ok = speakSentence(list[i].text, langRef.current, {
        onEnd: () => {
          if (tokenRef.current === token) step(i + 1);
        },
      });
      if (!ok) setReadingAloud(false);
    };
    step(0);
  }

  function goToQuiz() {
    pausePlayback();
    setMode("normal");
    setReadingAloud(false);
    stopSpeaking();
    setPhase("quiz");
  }

  const hintKey =
    mode === "sync"
      ? "read.syncHint"
      : mode === "sentence"
        ? "read.sentenceHint"
        : "read.hint";

  return (
    <div className="space-y-5">
      <Card className="p-7">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="font-display text-2xl font-semibold">{reading.title}</h2>
          {isPlayer ? (
            <button
              onClick={exitMode}
              className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 sm:w-auto dark:bg-slate-800 dark:text-slate-300"
            >
              {t("read.exitSentence")}
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
              <button
                onClick={readAloud}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition",
                  readingAloud
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
                )}
              >
                <Volume2 size={16} />{" "}
                {readingAloud ? t("read.stop") : t("read.readAloud")}
              </button>
              <button
                onClick={() => enterMode("sentence")}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-indigo-100 px-3.5 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300"
              >
                <AlignLeft size={16} /> {t("read.sentenceMode")}
              </button>
              {canSync && (
                <button
                  onClick={() => enterMode("sync")}
                  disabled={!online}
                  title={online ? undefined : t("read.syncOffline")}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-indigo-100 px-3.5 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-500/20 dark:text-indigo-300"
                >
                  <Languages size={16} /> {t("read.syncMode")}
                </button>
              )}
            </div>
          )}
        </div>
        <p className="mb-5 text-sm text-slate-500">{t(hintKey)}</p>

        {isPlayer && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl bg-slate-50 p-2 dark:bg-slate-800/60">
            <button
              onClick={() => playFrom(active - 1)}
              disabled={active <= 0}
              aria-label={t("read.prevSentence")}
              className="rounded-full p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              aria-label={playing ? t("read.pauseSentence") : t("read.playSentence")}
              className="rounded-full bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-500"
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={() => playFrom(active + 1)}
              disabled={active >= sentences.length - 1}
              aria-label={t("read.nextSentence")}
              className="rounded-full p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <SkipForward size={18} />
            </button>
            <span className="ml-auto pr-2 text-sm font-medium tabular-nums text-slate-500">
              {t("read.sentenceProgress", {
                current: active + 1,
                total: sentences.length,
              })}
            </span>
          </div>
        )}

        {mode === "sync" && transError && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <span>{t("read.translateError")}</span>
            <button
              onClick={() => setRetryTick((n) => n + 1)}
              className="shrink-0 font-medium underline"
            >
              {t("read.retry")}
            </button>
          </div>
        )}

        {mode === "sync" ? (
          <div className="grid grid-cols-2 gap-x-3 text-[13px] leading-7 sm:gap-x-5 sm:text-[15px]">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {LANG_LABEL[state.language]}
            </div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {LANG_LABEL[state.uiLang]}
            </div>
            {sentences.map((s) => {
              const isActive = s.index === active;
              const tr = translations[s.index];
              const hl = isActive
                ? "bg-indigo-100 dark:bg-indigo-500/25"
                : "";
              return (
                <Fragment key={s.index}>
                  <div
                    ref={isActive ? setActiveEl : undefined}
                    onClick={() => playFrom(s.index)}
                    className={cn(
                      "cursor-pointer rounded px-2 py-1.5 text-slate-700 transition dark:text-slate-200",
                      hl,
                    )}
                  >
                    <Translatable text={s.text} store={store} />
                  </div>
                  <div
                    onClick={() => playFrom(s.index)}
                    className={cn(
                      "cursor-pointer rounded px-2 py-1.5 text-slate-600 transition dark:text-slate-300",
                      hl,
                    )}
                  >
                    {tr !== undefined ? (
                      tr
                    ) : (
                      <span className="text-slate-400">{t("read.translating")}</span>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
        ) : (
          <article className="space-y-4 text-[17px] leading-8 text-slate-700 dark:text-slate-200">
            {mode === "sentence"
              ? sentenceParas.map((para, pi) => (
                  <p key={pi}>
                    {para.map((s) => {
                      const isActive = s.index === active;
                      return (
                        <span
                          key={s.index}
                          ref={isActive ? setActiveEl : undefined}
                          onClick={() => playFrom(s.index)}
                          className={cn(
                            "cursor-pointer rounded transition",
                            isActive &&
                              "bg-indigo-100 ring-1 ring-indigo-300 dark:bg-indigo-500/25 dark:ring-indigo-500/40",
                          )}
                        >
                          <Translatable text={s.text} store={store} />{" "}
                        </span>
                      );
                    })}
                  </p>
                ))
              : reading.paragraphs.map((p, i) => (
                  <p key={i}>
                    <Translatable text={p} store={store} />
                  </p>
                ))}
          </article>
        )}
      </Card>

      {phase === "read" ? (
        <div className="flex justify-end">
          <Button onClick={goToQuiz}>
            {done ? t("read.reviewQuiz") : `${t("read.takeQuiz")} →`}
          </Button>
        </div>
      ) : (
        <ComprehensionQuiz
          store={store}
          lesson={reading}
          alreadyDone={done}
          onPass={() => store.completeExercise(day, "readingDone")}
          onBack={() => setPhase("read")}
        />
      )}
    </div>
  );
}

function ComprehensionQuiz({
  store,
  lesson,
  alreadyDone,
  onPass,
  onBack,
}: {
  store: Store;
  lesson: ReturnType<typeof getLessonForDay>["reading"];
  alreadyDone: boolean;
  onPass: () => void;
  onBack: () => void;
}) {
  const { t } = store;
  const uiLang = store.state.uiLang;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const all = lesson.quiz.length;
  const correct = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
  const passed = submitted && correct === all;

  function submit() {
    setSubmitted(true);
    if (lesson.quiz.every((q, i) => answers[i] === q.answer)) onPass();
  }

  if (passed || (alreadyDone && submitted)) {
    return (
      <Card className="p-10 text-center">
        <PartyPopper className="mx-auto mb-3 text-emerald-500" size={40} />
        <h3 className="font-display text-2xl font-semibold">
          {t("read.dayComplete")} 🎉
        </h3>
        <p className="mt-1 text-slate-500">{t("read.dayCompleteMsg")}</p>
        <p className="mt-4 text-sm text-slate-400">{t("read.dayCompleteHint")}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">{t("read.quizTitle")}</h3>
      <div className="space-y-5">
        {lesson.quiz.map((q, qi) => (
          <div key={qi}>
            <p className="mb-2 font-medium">
              {qi + 1}. {loc(uiLang, q.question)}
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi;
                const isCorrect = q.answer === oi;
                const showState = submitted && (chosen || isCorrect);
                return (
                  <button
                    key={oi}
                    onClick={() =>
                      !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))
                    }
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-sm transition",
                      !showState && chosen &&
                        "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15",
                      !showState && !chosen &&
                        "border-slate-200 hover:border-indigo-400 dark:border-slate-700",
                      showState && isCorrect &&
                        "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                      showState && chosen && !isCorrect &&
                        "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                    )}
                  >
                    {loc(uiLang, opt)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← {t("read.backToText")}
        </Button>
        {submitted && !passed ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-rose-500">
              {t("read.score", { correct, total: all })}
            </span>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
            >
              {t("read.retry")}
            </Button>
          </div>
        ) : (
          <Button
            variant="success"
            disabled={Object.keys(answers).length < all}
            onClick={submit}
          >
            <Check size={16} /> {t("read.submit")}
          </Button>
        )}
      </div>
    </Card>
  );
}
