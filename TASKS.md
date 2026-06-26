# Lingua 90 — Implementation Tasks

**Goal:** A static, self-hostable (YunoHost) web app for a 90-day foreign-language
course (English first, Chinese built in) with 3 daily exercises: learn 3 words,
watch a 5-min YouTube video, read a 1-page document — video & reading chosen by topic.

- [x] Scaffold Vite + React 19 + TypeScript + Tailwind v4 (`base: "./"` for any sub-path)
- [x] Domain types (`src/data/types.ts`)
- [x] English + Chinese vocabulary pools (`src/data/vocabData.ts`, seeded from original `vocabulary.json`)
- [x] Topic content: History / Philosophy / Sport / Science / Art — video + transcript + article + quiz, EN & ZH (`src/data/topicData.ts`)
- [x] `useLocalStorage` persistence hook
- [x] State engine: streak, XP, day unlock, badges, save words, export/import (`src/state/store.ts`)
- [x] Achievements catalogue (`src/state/badges.ts`)
- [x] Speech (TTS) + dictionary lookup utilities (`src/lib/`)
- [x] App shell: header, language switch, dark mode, nav (`src/App.tsx`)
- [x] Dashboard: stats, 90-day grid, badges (`src/components/Dashboard.tsx`)
- [x] DayView: topic picker + 3-step flow (`src/components/DayView.tsx`)
- [x] Exercise 1 — Word Explorer: flip cards, TTS, match-up quiz
- [x] Exercise 2 — Interactive Cinema: YouTube IFrame API, synced transcript, click-to-pause lookup, speed control
- [x] Exercise 3 — Reader's Lounge: click-to-translate, read-aloud, comprehension quiz → completes day
- [x] Review Hub: saved words, quick practice, backup/restore, reset
- [x] Chinese mode: language toggle, Pinyin toggle, zh TTS, zh content
- [x] `npm run build` passes; preview serves HTTP 200
- [x] `SETUP.md` YunoHost deployment guide

## Real YouTube captions (follow-up)
- [x] Researched learner-friendly video sources (TED-Ed, BBC Learning English, etc.)
- [x] Verified TED-Ed clips ship MANUAL `en` + `zh-CN` caption tracks (~5 min)
- [x] `scripts/fetch-captions.py` — yt-dlp → WebVTT → typed `TranscriptLine[]`
      (strips translator-credit lines; merges EN cues into sentences)
- [x] Curated 9 TED-Ed videos across the 5 topics; generated
      `src/data/videoLessons.generated.ts` with real en + zh-CN transcripts
- [x] Refactored `topicData.ts`: authored readings + generated real-caption videos
- [x] Upgraded click-to-translate to `Intl.Segmenter` (segments Chinese captions)
- [x] Added TED-Ed/author attribution in the video player
- [x] `npm run captions` script + docs; rebuild passes

## Open questions / risks
- Videos are **real TED-Ed clips with real captions** (en + zh-CN). Some topics ship
  1 clip, others 2; video & reading cycle independently across the 90 days. Add more
  IDs to `VIDEOS` in `scripts/fetch-captions.py` and re-run `npm run captions` for
  more unique daily content.
- Captions are community/TED-Ed translations; `zh-CN` quality is good but occasional
  cues differ slightly from the spoken English. Sync is exact (real timestamps).
- Chinese reading articles remain hand-authored and space-segmented; video captions
  are segmented at runtime via `Intl.Segmenter`.
