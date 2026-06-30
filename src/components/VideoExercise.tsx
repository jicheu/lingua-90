import { useEffect, useRef, useState } from "react";
import { Check, Gauge, Languages, Pause, Play, Youtube } from "lucide-react";
import type { Store } from "../state/store";
import type { TopicId } from "../data/types";
import { getLessonForDay } from "../data/topicData";
import { translateText } from "../lib/translate";
import { useYouTube } from "../hooks/useYouTube";
import { Translatable } from "./Translatable";
import { Button, Card, cn } from "./ui";

const RATES = [0.5, 0.75, 1];

export function VideoExercise({
  store,
  day,
  topic,
  onComplete,
}: {
  store: Store;
  day: number;
  topic: TopicId;
  onComplete: () => void;
}) {
  const { state, t } = store;
  const lesson = getLessonForDay(state.language, topic, day);
  const { video } = lesson;
  const done = store.getDay(day).videoDone;
  const savedTime = store.getDay(day).videoTime ?? 0;

  const [reached, setReached] = useState(false);
  const yt = useYouTube(video.youtubeId, () => setReached(true));
  const [rate, setRate] = useState(1);
  const activeRef = useRef<HTMLLIElement | null>(null);

  // Side-by-side translation (online only).
  const canTranslate = state.uiLang !== state.language;
  const [showTranslation, setShowTranslation] = useState(false);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [transError, setTransError] = useState(false);
  const [transRetry, setTransRetry] = useState(0);
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  const activeIdx = video.transcript.findIndex(
    (l) => yt.currentTime >= l.start && yt.currentTime < l.end,
  );

  // Resume where the learner left off (once, when the player is ready).
  const resumedRef = useRef(false);
  useEffect(() => {
    if (resumedRef.current || !yt.ready) return;
    resumedRef.current = true;
    const lastStart = video.transcript[video.transcript.length - 1]?.start ?? 0;
    if (savedTime > 3 && savedTime < lastStart) {
      yt.seekTo(savedTime);
    }
  }, [yt.ready, savedTime, video.transcript, yt]);

  // Persist the playback position as it advances (the store throttles writes).
  useEffect(() => {
    if (yt.currentTime > 0) store.setVideoProgress(day, yt.currentTime);
  }, [yt.currentTime, day, store]);

  useEffect(() => {
    if (
      yt.currentTime > 0 &&
      yt.currentTime >= video.transcript[video.transcript.length - 1].start - 1
    ) {
      setReached(true);
    }
  }, [yt.currentTime, video.transcript]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIdx]);

  // Connectivity (to gate the translation toggle).
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Fetch translations for every transcript line while translation is on.
  useEffect(() => {
    if (!showTranslation) return;
    const controller = new AbortController();
    let cancelled = false;
    setTranslations({});
    setTransError(false);
    (async () => {
      let anyError = false;
      await Promise.all(
        video.transcript.map(async (line, i) => {
          try {
            const tr = await translateText(
              line.text,
              state.language,
              state.uiLang,
              controller.signal,
            );
            if (!cancelled) setTranslations((m) => ({ ...m, [i]: tr }));
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
  }, [showTranslation, video.youtubeId, state.language, state.uiLang, transRetry]);

  function changeRate(r: number) {
    setRate(r);
    yt.setRate(r);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-black">
          {yt.failed ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-slate-300">
              <Youtube size={36} className="text-rose-500" />
              <p className="text-sm">{t("video.fallback")}</p>
              <a
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-400 underline"
              >
                {t("video.openYoutube")} ↗
              </a>
            </div>
          ) : (
            <div ref={yt.containerRef} className="h-full w-full" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 p-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => (yt.playing ? yt.pause() : yt.play())}
            disabled={!yt.ready}
          >
            {yt.playing ? <Pause size={16} /> : <Play size={16} />}
            {yt.playing ? t("common.pause") : t("common.play")}
          </Button>

          <div className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">
            <Gauge size={14} className="text-slate-400" />
            {RATES.map((r) => (
              <button
                key={r}
                onClick={() => changeRate(r)}
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium transition",
                  rate === r
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                {r}×
              </button>
            ))}
          </div>

          {done && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Check size={13} strokeWidth={3} /> {t("video.watched")}
            </span>
          )}
        </div>
      </Card>

      <Card className="flex flex-col p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">{video.title}</h2>
          {canTranslate && (
            <button
              onClick={() => setShowTranslation((v) => !v)}
              disabled={!online && !showTranslation}
              title={online ? undefined : t("read.syncOffline")}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
                showTranslation
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300",
              )}
            >
              <Languages size={14} /> {t("video.translation")}
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400">
          TED-Ed{video.author ? ` · ${video.author}` : ""} · {t("video.credit")}
        </p>
        <p className="mb-2 mt-1 text-sm text-slate-500">
          {t("video.hint", { duration: video.duration })}
        </p>

        {showTranslation && transError && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <span>{t("read.translateError")}</span>
            <button
              onClick={() => setTransRetry((n) => n + 1)}
              className="shrink-0 font-medium underline"
            >
              {t("read.retry")}
            </button>
          </div>
        )}

        <ul className="thin-scroll max-h-72 space-y-1 overflow-y-auto pr-2">
          {video.transcript.map((line, i) => {
            const active = i === activeIdx;
            const rowHl = active
              ? "bg-indigo-50 font-medium text-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-100"
              : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60";
            if (showTranslation) {
              const tr = translations[i];
              return (
                <li
                  key={i}
                  ref={active ? activeRef : null}
                  onClick={() => yt.seekTo(line.start)}
                  className={cn(
                    "grid cursor-pointer grid-cols-2 gap-3 rounded-xl px-3 py-2 text-[13px] leading-relaxed transition sm:text-[14px]",
                    rowHl,
                  )}
                >
                  <span>
                    <span className="mr-1.5 text-[11px] text-slate-300 dark:text-slate-600">
                      {fmt(line.start)}
                    </span>
                    <Translatable
                      text={line.text}
                      store={store}
                      onWordOpen={yt.pause}
                    />
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {tr !== undefined ? (
                      tr
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">
                        {t("read.translating")}
                      </span>
                    )}
                  </span>
                </li>
              );
            }
            return (
              <li
                key={i}
                ref={active ? activeRef : null}
                onClick={() => yt.seekTo(line.start)}
                className={cn(
                  "cursor-pointer rounded-xl px-3 py-2 text-[15px] leading-relaxed transition",
                  rowHl,
                )}
              >
                <span className="mr-2 text-xs text-slate-300 dark:text-slate-600">
                  {fmt(line.start)}
                </span>
                <Translatable
                  text={line.text}
                  store={store}
                  onWordOpen={yt.pause}
                />
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex justify-end">
          {done ? (
            <Button variant="success" onClick={onComplete}>
              {t("video.next")} →
            </Button>
          ) : (
            <Button
              variant={reached ? "success" : "outline"}
              disabled={!reached}
              onClick={() => {
                store.completeExercise(day, "videoDone");
                onComplete();
              }}
            >
              <Check size={16} />
              {reached ? t("video.markWatched") : t("video.watchToEnd")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
