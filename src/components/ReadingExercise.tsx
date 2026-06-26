import { useState } from "react";
import { Check, PartyPopper, Volume2 } from "lucide-react";
import type { Store } from "../state/store";
import type { TopicId } from "../data/types";
import { getLessonForDay } from "../data/topicData";
import { speak, stopSpeaking, hasVoices } from "../lib/speech";
import { loc } from "../i18n/strings";
import { Translatable } from "./Translatable";
import { Button, Card, cn } from "./ui";

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

  function readAloud() {
    if (readingAloud) {
      stopSpeaking();
      setReadingAloud(false);
      return;
    }
    setReadingAloud(true);
    const full = reading.paragraphs.join(" ");
    speak(full, state.language);
    setTimeout(() => setReadingAloud(false), Math.max(4000, full.length * 90));
  }

  return (
    <div className="space-y-5">
      <Card className="p-7">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold">{reading.title}</h2>
          {hasVoices() && (
            <button
              onClick={readAloud}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition",
                readingAloud
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              <Volume2 size={16} /> {readingAloud ? t("read.stop") : t("read.readAloud")}
            </button>
          )}
        </div>
        <p className="mb-5 text-sm text-slate-500">{t("read.hint")}</p>

        <article className="space-y-4 text-[17px] leading-8 text-slate-700 dark:text-slate-200">
          {reading.paragraphs.map((p, i) => (
            <p key={i}>
              <Translatable text={p} store={store} />
            </p>
          ))}
        </article>
      </Card>

      {phase === "read" ? (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              stopSpeaking();
              setReadingAloud(false);
              setPhase("quiz");
            }}
          >
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
