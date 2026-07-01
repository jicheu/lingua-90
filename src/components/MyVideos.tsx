import { useState } from "react";
import { Film, Play, X } from "lucide-react";
import type { Store } from "../state/store";
import type { WatchedVideo } from "../data/types";
import { Card } from "./ui";

export function MyVideos({ store }: { store: Store }) {
  const { state, t } = store;
  const [playing, setPlaying] = useState<WatchedVideo | null>(null);
  const videos = state.watchedVideos ?? [];

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
          {videos.map((v, i) => (
            <button
              key={`${v.youtubeId}-${v.day}-${i}`}
              onClick={() => setPlaying(v)}
              className="group overflow-hidden rounded-2xl border border-slate-200 text-left transition hover:border-indigo-400 hover:shadow-lg dark:border-slate-700 dark:hover:border-indigo-500"
            >
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
          ))}
        </div>
      )}

      {playing && (
        <VideoModal video={playing} onClose={() => setPlaying(null)} />
      )}
    </div>
  );
}

function VideoModal({
  video,
  onClose,
}: {
  video: WatchedVideo;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <X size={18} />
        </button>
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
