import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type {
  AppState,
  DayProgress,
  LanguageCode,
  ThemeMode,
  TopicId,
  UiLang,
  WatchedVideo,
  Word,
} from "../data/types";
import { TOTAL_DAYS } from "../data/types";
import { makeT, type TFunc } from "../i18n/strings";
import { loadState, saveState } from "../lib/profile";
import { initSrs, applyResult } from "../lib/srs";

const STORAGE_KEY = "lingua90-state-v1";

const XP_PER_EXERCISE = 20;
const XP_DAY_BONUS = 40;

const initialState: AppState = {
  name: "Learner",
  language: "en",
  uiLang: "en",
  showPinyin: true,
  themeMode: "auto",
  currentDay: 1,
  xp: 0,
  streak: 0,
  progress: {},
  savedWords: { en: [], zh: [] },
  badges: [],
  sessionSize: 10,
  watchedVideos: [],
  videoExercises: {},
  updatedAt: 0,
};

/** Merge a (possibly partial) stored state onto the defaults. */
function hydrate(partial: Partial<AppState> | null | undefined): AppState {
  return {
    ...initialState,
    ...partial,
    savedWords: {
      en: partial?.savedWords?.en ?? [],
      zh: partial?.savedWords?.zh ?? [],
    },
  };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + "T00:00:00");
  const b = new Date(bISO + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export type ExerciseKey = "vocabDone" | "verbsDone" | "videoDone" | "readingDone";

export interface Store {
  state: AppState;
  t: TFunc;
  dayKey: (day: number) => string;
  getDay: (day: number) => DayProgress;
  isDayComplete: (day: number) => boolean;
  isDayUnlocked: (day: number) => boolean;
  completedCount: number;
  setName: (name: string) => void;
  setLanguage: (lang: LanguageCode) => void;
  setUiLang: (lang: UiLang) => void;
  setThemeMode: (mode: ThemeMode) => void;
  togglePinyin: () => void;
  setTopic: (day: number, topic: TopicId) => void;
  setVideoProgress: (day: number, seconds: number) => void;
  completeExercise: (day: number, key: ExerciseKey) => void;
  saveWord: (word: Word) => void;
  updateWord: (word: Word) => void;
  removeSavedWord: (term: string) => void;
  isWordSaved: (term: string) => boolean;
  /** Record a flashcard answer (spaced-repetition update). */
  recordFlashcard: (term: string, known: boolean) => void;
  addWatchedVideo: (video: WatchedVideo) => void;
  completeVideoExercise: (youtubeId: string) => void;
  /** Set how many cards a review session contains. */
  setSessionSize: (n: number) => void;
  exportState: () => string;
  importState: (json: string) => boolean;
  resetDay: (day: number) => void;
  resetAll: () => void;
}

export function useStore(profileId?: string | null): Store {
  const [state, setState, reset] = useLocalStorage<AppState>(
    profileId ? `${STORAGE_KEY}-${profileId}` : STORAGE_KEY,
    initialState,
  );

  /**
   * Apply a mutation and stamp `updatedAt` so the server sync can do
   * last-writer-wins. Every user-facing change goes through this.
   */
  const commit = useCallback(
    (updater: (s: AppState) => AppState) =>
      setState((s) => {
        const next = updater(s);
        return next === s ? s : { ...next, updatedAt: Date.now() };
      }),
    [setState],
  );

  // ── Server profile sync (no database; one JSON file per profile) ──
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastPushed = useRef(0);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On profile change: pull the server copy and adopt it if it's newer.
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    (async () => {
      const remote = await loadState(profileId);
      if (cancelled || !remote) return;
      const remoteAt = remote.updatedAt ?? 0;
      if (remoteAt >= (stateRef.current.updatedAt ?? 0)) {
        setState(hydrate(remote));
        lastPushed.current = remoteAt;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, setState]);

  // On local change: debounced push to the server.
  useEffect(() => {
    if (!profileId) return;
    if (state.updatedAt <= lastPushed.current) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      const ok = await saveState(profileId, stateRef.current);
      if (ok) lastPushed.current = stateRef.current.updatedAt;
    }, 1200);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [profileId, state.updatedAt]);

  const dayKey = useCallback(
    (day: number) => `${state.language}-${day}`,
    [state.language],
  );

  const getDay = useCallback(
    (day: number): DayProgress =>
      state.progress[`${state.language}-${day}`] ?? {
        vocabDone: false,
        verbsDone: false,
        videoDone: false,
        readingDone: false,
      },
    [state.progress, state.language],
  );

  const isDayComplete = useCallback(
    (day: number) => {
      const d = getDay(day);
      // Migration: if verbsDone is missing (old state) but the other three
      // are done, treat the day as complete so existing users don't regress.
      const verbsOk = d.verbsDone ?? (d.vocabDone && d.videoDone && d.readingDone);
      return d.vocabDone && verbsOk && d.videoDone && d.readingDone;
    },
    [getDay],
  );

  const isDayUnlocked = useCallback(
    // A day is unlocked if it's within the reached frontier, or — robustly —
    // if the previous day has been fully completed (so finishing a day always
    // opens the next one, even if currentDay didn't advance for some reason).
    (day: number) => day <= state.currentDay || (day > 1 && isDayComplete(day - 1)),
    [state.currentDay, isDayComplete],
  );

  const completedCount = useMemo(
    () =>
      Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).filter((d) => {
        const p = state.progress[`${state.language}-${d}`];
        return p && p.vocabDone && (p.verbsDone ?? true) && p.videoDone && p.readingDone;
      }).length,
    [state.progress, state.language],
  );

  const setName = useCallback(
    (name: string) => commit((s) => ({ ...s, name: name.trim() || s.name })),
    [commit],
  );
  const setLanguage = useCallback(
    (language: LanguageCode) => commit((s) => ({ ...s, language })),
    [commit],
  );
  const setUiLang = useCallback(
    (uiLang: UiLang) => commit((s) => ({ ...s, uiLang })),
    [commit],
  );
  const setThemeMode = useCallback(
    (themeMode: ThemeMode) => commit((s) => ({ ...s, themeMode })),
    [commit],
  );
  const togglePinyin = useCallback(
    () => commit((s) => ({ ...s, showPinyin: !s.showPinyin })),
    [commit],
  );

  const t = useMemo(() => makeT(state.uiLang), [state.uiLang]);

  const setTopic = useCallback(
    (day: number, topic: TopicId) =>
      commit((s) => {
        const key = `${s.language}-${day}`;
        const prev = s.progress[key] ?? {
          vocabDone: false,
          verbsDone: false,
          videoDone: false,
          readingDone: false,
        };
        return {
          ...s,
          lastTopic: topic,
          progress: { ...s.progress, [key]: { ...prev, topic } },
        };
      }),
    [commit],
  );

  const setVideoProgress = useCallback(
    (day: number, seconds: number) =>
      commit((s) => {
        const key = `${s.language}-${day}`;
        const prev = s.progress[key];
        if (!prev) return s; // no topic chosen yet; nothing to attach to
        // Avoid churn: only record meaningful jumps (≥3s difference).
        if (Math.abs((prev.videoTime ?? 0) - seconds) < 3) return s;
        return {
          ...s,
          progress: {
            ...s.progress,
            [key]: { ...prev, videoTime: Math.floor(seconds) },
          },
        };
      }),
    [commit],
  );

  const completeExercise = useCallback(
    (day: number, exKey: ExerciseKey) =>
      commit((s) => {
        const key = `${s.language}-${day}`;
        const prev = s.progress[key] ?? {
          vocabDone: false,
          verbsDone: false,
          videoDone: false,
          readingDone: false,
        };
        if (prev[exKey]) return s; // already done, no double XP

        const updated: DayProgress = { ...prev, [exKey]: true };
        let { xp, streak, currentDay, lastCompletedDate } = s;
        const badges = new Set(s.badges);
        xp += XP_PER_EXERCISE;

        const nowComplete =
          updated.vocabDone && (updated.verbsDone ?? true) && updated.videoDone && updated.readingDone;
        const wasComplete =
          prev.vocabDone && (prev.verbsDone ?? true) && prev.videoDone && prev.readingDone;

        if (nowComplete && !wasComplete) {
          updated.completedAt = new Date().toISOString();
          xp += XP_DAY_BONUS;

          // streak logic
          const today = todayISO();
          if (lastCompletedDate) {
            const gap = daysBetween(lastCompletedDate, today);
            if (gap === 0) {
              streak = streak < 1 ? 1 : streak;
            } else if (gap === 1) {
              streak += 1;
            } else {
              streak = 1;
            }
          } else {
            streak = 1;
          }
          lastCompletedDate = today;

          // unlock next day — whenever a day is completed, ensure the day
          // after it is reachable (robust to completing days out of order)
          if (day + 1 <= TOTAL_DAYS && day + 1 > currentDay) {
            currentDay = day + 1;
          }

          // badges tied to completion
          badges.add("first-step");
          if (streak >= 7) badges.add("streak-7");
          if (streak >= 30) badges.add("streak-30");
          if (day >= 45) badges.add("halfway");
        }

        const newProgress = { ...s.progress, [key]: updated };

        // explorer badge: all five topics tried (across this language)
        const triedTopics = new Set<string>();
        for (const k of Object.keys(newProgress)) {
          if (k.startsWith(`${s.language}-`) && newProgress[k].topic) {
            triedTopics.add(newProgress[k].topic as string);
          }
        }
        if (triedTopics.size >= 5) badges.add("explorer");

        // graduate badge
        const completed = Array.from(
          { length: TOTAL_DAYS },
          (_, i) => i + 1,
        ).filter((dd) => {
          const p = newProgress[`${s.language}-${dd}`];
        return p && p.vocabDone && (p.verbsDone ?? true) && p.videoDone && p.readingDone;
        }).length;
        if (completed >= TOTAL_DAYS) badges.add("graduate");

        return {
          ...s,
          progress: newProgress,
          xp,
          streak,
          currentDay,
          lastCompletedDate,
          badges: Array.from(badges),
        };
      }),
    [commit],
  );

  const saveWord = useCallback(
    (word: Word) =>
      commit((s) => {
        const list = s.savedWords[s.language];
        if (list.some((w) => w.term === word.term)) return s;
        const savedWords = {
          ...s.savedWords,
          [s.language]: [...list, { ...word, srs: word.srs ?? initSrs() }],
        };
        const badges = new Set(s.badges);
        const total = savedWords[s.language].length;
        if (total >= 30) badges.add("words-30");
        if (total >= 100) badges.add("words-100");
        return { ...s, savedWords, badges: Array.from(badges) };
      }),
    [commit],
  );

  const updateWord = useCallback(
    (word: Word) =>
      commit((s) => {
        const list = s.savedWords[s.language];
        const idx = list.findIndex((w) => w.term === word.term);
        if (idx < 0) return s;
        const next = [...list];
        next[idx] = { ...list[idx], ...word, srs: list[idx].srs };
        return { ...s, savedWords: { ...s.savedWords, [s.language]: next } };
      }),
    [commit],
  );

  const recordFlashcard = useCallback(
    (term: string, known: boolean) =>
      commit((s) => {
        const list = s.savedWords[s.language];
        const i = list.findIndex((w) => w.term === term);
        if (i < 0) return s;
        const next = [...list];
        next[i] = { ...list[i], srs: applyResult(list[i].srs, known) };
        return { ...s, savedWords: { ...s.savedWords, [s.language]: next } };
      }),
    [commit],
  );

  const addWatchedVideo = useCallback(
    (video: WatchedVideo) =>
      commit((s) => {
        const list = s.watchedVideos ?? [];
        if (list.some((v) => v.youtubeId === video.youtubeId && v.day === video.day)) return s;
        return { ...s, watchedVideos: [...list, video] };
      }),
    [commit],
  );

  const completeVideoExercise = useCallback(
    (youtubeId: string) =>
      commit((s) => ({
        ...s,
        videoExercises: { ...(s.videoExercises ?? {}), [youtubeId]: true },
        xp: s.xp + 20,
      })),
    [commit],
  );

  const setSessionSize = useCallback(
    (n: number) =>
      commit((s) => ({
        ...s,
        sessionSize: Math.max(3, Math.min(50, Math.round(n) || s.sessionSize)),
      })),
    [commit],
  );

  const removeSavedWord = useCallback(
    (term: string) =>
      commit((s) => ({
        ...s,
        savedWords: {
          ...s.savedWords,
          [s.language]: s.savedWords[s.language].filter(
            (w) => w.term !== term,
          ),
        },
      })),
    [commit],
  );

  const isWordSaved = useCallback(
    (term: string) =>
      state.savedWords[state.language].some((w) => w.term === term),
    [state.savedWords, state.language],
  );

  const exportState = useCallback(
    () => JSON.stringify(state, null, 2),
    [state],
  );

  const resetDay = useCallback(
    (day: number) =>
      commit((s) => {
        const key = `${s.language}-${day}`;
        if (!s.progress[key]) return s;
        const progress = { ...s.progress };
        delete progress[key];
        return { ...s, progress };
      }),
    [commit],
  );

  const importState = useCallback(
    (json: string) => {
      try {
        const parsed = JSON.parse(json) as AppState;
        if (typeof parsed !== "object" || parsed === null) return false;
        // shallow sanity check
        if (!("progress" in parsed) || !("currentDay" in parsed)) return false;
        setState({ ...hydrate(parsed), updatedAt: Date.now() });
        return true;
      } catch {
        return false;
      }
    },
    [setState],
  );

  return {
    state,
    t,
    dayKey,
    getDay,
    isDayComplete,
    isDayUnlocked,
    completedCount,
    setName,
    setLanguage,
    setUiLang,
    setThemeMode,
    togglePinyin,
    setTopic,
    setVideoProgress,
    completeExercise,
    saveWord,
    updateWord,
    removeSavedWord,
    isWordSaved,
    recordFlashcard,
    addWatchedVideo,
    completeVideoExercise,
    setSessionSize,
    exportState,
    importState,
    resetDay,
    resetAll: reset,
  };
}
