import { useEffect, useRef, useState } from "react";
import { Check, Gauge, Pause, Play, Youtube } from "lucide-react";
import type { Store } from "../state/store";
import type { TopicId } from "../data/types";
import { getLessonForDay } from "../data/topicData";
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

  const [reached, setReached] = useState(false);
  const yt = useYouTube(video.youtubeId, () => setReached(true));
  const [rate, setRate] = useState(1);
  const activeRef = useRef<HTMLLIElement | null>(null);

  const activeIdx = video.transcript.findIndex(
    (l) => yt.currentTime >= l.start && yt.currentTime < l.end,
  );

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
        <h2 className="text-lg font-semibold">{video.title}</h2>
        <p className="text-xs text-slate-400">
          TED-Ed{video.author ? ` · ${video.author}` : ""} · {t("video.credit")}
        </p>
        <p className="mb-2 mt-1 text-sm text-slate-500">
          {t("video.hint", { duration: video.duration })}
        </p>

        <ul className="thin-scroll max-h-72 space-y-1 overflow-y-auto pr-2">
          {video.transcript.map((line, i) => {
            const active = i === activeIdx;
            return (
              <li
                key={i}
                ref={active ? activeRef : null}
                onClick={() => yt.seekTo(line.start)}
                className={cn(
                  "cursor-pointer rounded-xl px-3 py-2 text-[15px] leading-relaxed transition",
                  active
                    ? "bg-indigo-50 font-medium text-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60",
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
