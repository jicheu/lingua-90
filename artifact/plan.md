# Lingua 90 — Architecture & Implementation Plan

## Summary
A 90-day language-learning web app. English first, Chinese built in. Each day has
3 exercises: (1) learn 3 common words, (2) watch a ~5-min YouTube video, (3) read a
1-page document. Video and reading are chosen from a topic (History, Philosophy,
Sport, Science, Art). Built as a **static SPA** so it can be hosted on YunoHost with
zero backend.

## Why a static SPA on YunoHost
- Hosted via YunoHost **"My Webapp"** (Nginx serving static files) — 0 backend
  processes, no DB, minimal attack surface, near-zero idle resource use.
- All learner state in `localStorage`; works offline after first load.
- Cross-device "sync" via **Export / Import JSON** backup (no server needed).
- `vite.config.ts` sets `base: "./"` so the bundle works under any sub-path
  (e.g. `https://domain.tld/lingua/`).

## Tech stack
- Vite 6 + React 19 + TypeScript (strict)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- lucide-react icons
- YouTube IFrame Player API (loaded on demand)
- Web Speech API (`speechSynthesis`) for pronunciation / read-aloud

## Structure
```
src/
  data/      types.ts, vocabData.ts (EN+ZH pools), topicData.ts (topics+lessons)
  state/     store.ts (progress/streak/XP/badges), badges.ts
  hooks/     useLocalStorage.ts, useYouTube.ts
  lib/       speech.ts (TTS), dictionary.ts (click-to-translate lookup)
  components/ App shell, Dashboard, DayView, VocabExercise, VideoExercise,
              ReadingExercise, ReviewHub, Translatable, ui.tsx
```

## Core flows
- **Day gating:** sequential — day N unlocks when day N-1 is fully complete.
- **Day completion:** all 3 exercises done → +XP, streak update, next day unlock,
  badge checks.
- **Streak:** based on calendar date of last fully-completed day (consecutive days).
- **Vocabulary:** `selectDailyWords(lang, day)` picks a deterministic trio so a day
  always shows the same words.
- **Topic content:** `getLessonForDay(lang, topic, day)` cycles through each topic's
  lesson pool.

## Extensibility
- Add languages: extend `LanguageCode`, add pools in `vocabData.ts`, topics in
  `topicData.ts`.
- Add days of unique content: append `TopicLesson`s per topic.
- Swap illustrative transcripts for real YouTube captions for exact sync.
