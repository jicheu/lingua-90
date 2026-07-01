import { useEffect, useState } from "react";
import { ArrowLeft, Check, Film, BookText, SpellCheck2 } from "lucide-react";
import type { Store } from "../state/store";
import type { TopicId } from "../data/types";
import { TOPIC_META } from "../data/topicData";
import type { StringKey } from "../i18n/strings";
import { Card, cn } from "./ui";
import { VocabExercise } from "./VocabExercise";
import { VideoExercise } from "./VideoExercise";
import { ReadingExercise } from "./ReadingExercise";

type Step = "vocab" | "video" | "reading";

export function DayView({
  store,
  day,
  onBack,
}: {
  store: Store;
  day: number;
  onBack: () => void;
}) {
  const { t, state } = store;
  const progress = store.getDay(day);
  const [step, setStep] = useState<Step>("vocab");

  // Pre-select the last used topic for days that don't have one yet.
  useEffect(() => {
    if (!progress.topic && state.lastTopic) {
      store.setTopic(day, state.lastTopic);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps: {
    key: Step;
    label: string;
    icon: React.ReactNode;
    done: boolean;
  }[] = [
    { key: "vocab", label: t("step.words"), icon: <SpellCheck2 size={17} />, done: progress.vocabDone },
    { key: "video", label: t("step.video"), icon: <Film size={17} />, done: progress.videoDone },
    { key: "reading", label: t("step.reading"), icon: <BookText size={17} />, done: progress.readingDone },
  ];

  const topic = progress.topic;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} /> {t("day.back")}
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("day.title", { day })}
        </h1>
        {store.isDayComplete(day) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Check size={14} strokeWidth={3} /> {t("day.completed")}
          </span>
        )}
      </div>

      {/* Topic picker */}
      <div>
        <p className="mb-2 text-sm text-slate-500">{t("day.pickTopic")}</p>
        <div className="flex flex-wrap gap-2">
          {TOPIC_META.map((tp) => (
            <button
              key={tp.id}
              onClick={() => store.setTopic(day, tp.id as TopicId)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                topic === tp.id
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500",
              )}
            >
              <span>{tp.emoji}</span>
              {t(`topic.${tp.id}` as StringKey)}
            </button>
          ))}
        </div>
      </div>

      {!topic ? (
        <Card className="p-12 text-center text-slate-400">
          {t("day.pickPrompt")}
        </Card>
      ) : (
        <>
          {/* Step tabs */}
          <div className="flex gap-2">
            {steps.map((s) => (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition",
                  step === s.key
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full text-xs",
                    s.done
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-700",
                  )}
                >
                  {s.done ? <Check size={14} strokeWidth={3} /> : s.icon}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          <div key={step} className="animate-fade-in">
            {step === "vocab" && (
              <VocabExercise
                store={store}
                day={day}
                onComplete={() => setStep("video")}
              />
            )}
            {step === "video" && (
              <VideoExercise
                store={store}
                day={day}
                topic={topic}
                onComplete={() => setStep("reading")}
              />
            )}
            {step === "reading" && (
              <ReadingExercise store={store} day={day} topic={topic} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
