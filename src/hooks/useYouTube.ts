import { useEffect, useRef, useState } from "react";

// Minimal typings for the YouTube IFrame API (avoids an extra @types dep).
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setPlaybackRate(rate: number): void;
  unMute(): void;
  setVolume(v: number): void;
  destroy(): void;
}

interface YTNamespace {
  Player: new (el: HTMLElement, opts: unknown) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadApi(): Promise<YTNamespace> {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return apiPromise;
}

export interface YouTubeController {
  containerRef: React.RefObject<HTMLDivElement | null>;
  ready: boolean;
  playing: boolean;
  currentTime: number;
  failed: boolean;
  play: () => void;
  pause: () => void;
  seekTo: (s: number) => void;
  setRate: (r: number) => void;
}

export function useYouTube(
  videoId: string,
  onEnded?: () => void,
): YouTubeController {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [failed, setFailed] = useState(false);
  const endedRef = useRef(onEnded);
  endedRef.current = onEnded;

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      if (!cancelled && !playerRef.current) setFailed(true);
    }, 6000);

    loadApi().then((YT) => {
      if (cancelled || !containerRef.current) return;
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            // Ensure audio is on (some embeds initialise muted).
            try {
              playerRef.current?.unMute();
              playerRef.current?.setVolume(100);
            } catch {
              /* ignore */
            }
            setReady(true);
            clearTimeout(timeout);
            interval = setInterval(() => {
              const p = playerRef.current;
              if (p) setCurrentTime(p.getCurrentTime());
            }, 250);
          },
          onError: () => setFailed(true),
          onStateChange: (e: { data: number }) => {
            setPlaying(e.data === YT.PlayerState.PLAYING);
            if (e.data === YT.PlayerState.ENDED) endedRef.current?.();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [videoId]);

  return {
    containerRef,
    ready,
    playing,
    currentTime,
    failed,
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    seekTo: (s: number) => playerRef.current?.seekTo(s, true),
    setRate: (r: number) => playerRef.current?.setPlaybackRate(r),
  };
}
