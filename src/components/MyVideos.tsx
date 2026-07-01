import { useMemo, useState } from "react";
import { Check, ChevronLeft, Film, PartyPopper, Play } from "lucide-react";
import type { Store } from "../state/store";
import type { WatchedVideo } from "../data/types";
import { VIDEO_POOL_EN, VIDEO_POOL_ZH } from "../data/videoLessons.generated";
import { generateVideoQuiz } from "../lib/videoQuiz";
import { useYouTube } from "../hooks/useYouTube";
import { Translatable } from "./Translatable";
import { loc } from "../i18n/strings";
import { Button, Card, cn } from "./ui";

export function MyVideos({ store }: { store: Store }) {
  const { state, t } = store;
  const [active, setActive] = useState<WatchedVideo | null>(null);
  const videos = state.watchedVideos ?? [];
  const completed = state.videoExercises ?? {};

  if (active) {
    return (
      <VideoReplay
        store={store}
        video={active}
        onBack={() => setActive(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Film size={22} className="text-indigo-500" />
          {t("nav.videos")}
        </h1>
        <p className="text-sm text-slate-500">
          {videos.length > 0
            ? t("videos.count", { n: videos.length })
            : t("videos.empty")}
        </p>
      </div>

      {videos.length === 0 ? (
        <Card className="p-10 text-center text-slate-400">
          <Film className="mx-auto mb-2 text-slate-300" size={26} />
          {t("videos.empty")}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => {
            const isDone = completed[v.youtubeId];
            return (
              <button
                key={`${v.youtubeId}-${v.day}-${i}`}
                onClick={() => setActive(v)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 text-left transition hover:border-indigo-400 hover:shadow-lg dark:border-slate-700 dark:hover:border-indigo-500"
              >
                {isDone && (
                  <span className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white shadow">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
                <div className="relative aspect-video bg-slate-900">
                  <img
                    src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`}
                    alt={v.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-indigo-600">
                      <Play size={22} fill="currentColor" />
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium leading-snug">{v.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t("videos.day", { day: v.day })}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VideoReplay({
  store,
  video,
  onBack,
}: {
  store: Store;
  video: WatchedVideo;
  onBack: () => void;
}) {
  const { state, t } = store;
  const pool = state.language === "zh" ? VIDEO_POOL_ZH : VIDEO_POOL_EN;
  const lesson = useMemo(
    () => pool.find((v) => v.youtubeId === video.youtubeId),
    [pool, video.youtubeId],
  );

  const [reached, setReached] = useState(false);
  const [phase, setPhase] = useState<"watch" | "quiz" | "done">(
    store.state.videoExercises?.[video.youtubeId] ? "done" : "watch",
  );

  const yt = useYouTube(video.youtubeId, () => setReached(true));
  const transcript = lesson?.transcript ?? [];
  const lastStart = transcript[transcript.length - 1]?.start ?? 0;

  const activeIdx = transcript.findIndex(
    (l) => yt.currentTime >= l.start && yt.currentTime < l.end,
  );

  // Mark reached if near the end
  useMemo(() => {
    if (yt.currentTime > 0 && yt.currentTime >= lastStart - 1) setReached(true);
  }, [yt.currentTime, lastStart]);

  const quiz = useMemo(
    () => (lesson ? generateVideoQuiz(lesson, pool) : []),
    [lesson, pool],
  );

  function markSeen() {
    setPhase("quiz");
  }

  function onQuizPass() {
    store.completeVideoExercise(video.youtubeId);
    setPhase("done");
  }

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronLeft size={16} /> {t("nav.videos")}
      </button>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Player */}
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-black">
            {yt.failed ? (
              <div className="flex h-full items-center justify-center p-6 text-center text-slate-300">
                <p className="text-sm">{t("video.fallback")}</p>
              </div>
            ) : (
              <div ref={yt.containerRef} className="h-full w-full" />
            )}
          </div>
        </Card>

        {/* Transcript or quiz */}
        <Card className="flex flex-col p-5">
          <h2 className="mb-1 text-lg font-semibold">{video.title}</h2>
          <p className="mb-2 text-sm text-slate-500">
            {t("videos.day", { day: video.day })}
          </p>

          {phase === "watch" && (
            <>
              <ul className="thin-scroll max-h-72 space-y-1 overflow-y-auto pr-2">
                {transcript.map((line, i) => {
                  const active = i === activeIdx;
                  return (
                    <li
                      key={i}
                      onClick={() => yt.seekTo(line.start)}
                      className={cn(
                        "cursor-pointer rounded-xl px-3 py-2 text-[14px] leading-relaxed transition",
                        active
                          ? "bg-indigo-50 font-medium text-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-100"
                          : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60",
                      )}
                    >
                      <Translatable text={line.text} store={store} onWordOpen={yt.pause} />
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex justify-end">
                <Button
                  variant={reached ? "success" : "outline"}
                  disabled={!reached}
                  onClick={markSeen}
                >
                  <Check size={16} />
                  {reached ? t("videos.markSeen") : t("videos.watchToEnd")}
                </Button>
              </div>
            </>
          )}

          {phase === "quiz" && (
            <VideoQuiz
              store={store}
              quiz={quiz}
              onPass={onQuizPass}
              onBack={() => setPhase("watch")}
            />
          )}

          {phase === "done" && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <PartyPopper className="mb-3 text-emerald-500" size={36} />
              <h3 className="font-display text-xl font-semibold">
                {t("videos.complete")}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {t("videos.completeMsg")}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function VideoQuiz({
  store,
  quiz,
  onPass,
  onBack,
}: {
  store: Store;
  quiz: ReturnType<typeof generateVideoQuiz>;
  onPass: () => void;
  onBack: () => void;
}) {
  const { t, state } = store;
  const uiLang = state.uiLang;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const all = quiz.length;
  const correct = quiz.filter((q, i) => answers[i] === q.answer).length;
  const passed = submitted && correct === all;

  function submit() {
    setSubmitted(true);
    if (quiz.every((q, i) => answers[i] === q.answer)) onPass();
  }

  if (passed) return null;

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">{t("videos.quizTitle")}</h3>
      <div className="space-y-5">
        {quiz.map((q, qi) => (
          <div key={qi}>
            <p className="mb-2 font-medium">
              {qi + 1}. {loc(uiLang, q.question)}
            </p>
            <div className="grid gap-2">
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
              {t("videos.score", { correct, total: all })}
            </span>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
            >
              {t("videos.retry")}
            </Button>
          </div>
        ) : (
          <Button
            variant="success"
            disabled={Object.keys(answers).length < all}
            onClick={submit}
          >
            <Check size={16} /> {t("videos.submit")}
          </Button>
        )}
      </div>
    </div>
  );
}
