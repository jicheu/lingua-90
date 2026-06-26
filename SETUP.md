# Lingua 90 — Setup & YunoHost Deployment

A static, offline-capable web app for a 90-day language course (English now,
Chinese built in). No backend, no database — perfect for self-hosting on YunoHost.

## 1. Local development

```bash
cd ~/src/foreign-language
npm install
npm run dev        # http://localhost:5173
```

## 2. Build the static site

```bash
npm run build      # outputs to ./dist
npm run preview    # optional: preview the production build locally
```

`vite.config.ts` uses `base: "./"`, so the contents of `dist/` work whether the app
is served from a domain root or a sub-path (e.g. `https://your.tld/lingua/`).

## 3. Deploy on YunoHost (recommended: "My Webapp")

1. In the YunoHost admin, install the **My Webapp** app and assign it a domain or
   sub-path (e.g. `lingua.your-domain.tld` or `your-domain.tld/lingua`).
2. Upload the **contents of `dist/`** (not the folder itself) into the webapp's
   web root, typically:
   ```
   /var/www/my_webapp/www/
   ```
   You can use SFTP (My Webapp creates an SFTP user) or `scp`:
   ```bash
   # from your machine, after `npm run build`
   scp -r dist/* my_webapp@your-domain.tld:www/
   ```
3. Visit your domain. Done — it's a pure static site served by YunoHost's Nginx.

### Connecting from elsewhere
Because it's served over your YunoHost domain (with the free Let's Encrypt HTTPS
that YunoHost manages), you can open it from any device, anywhere. Each device keeps
its own progress in the browser; use **My Words → Export/Import backup** to move
progress between devices.

> Note: YouTube videos require the device to have internet access (they stream from
> YouTube). The app itself is served from your server. If a video can't load, the
> transcript still lets the learner complete the exercise.

## 4. Updating content

- **Vocabulary:** `src/data/vocabData.ts` (English & Chinese pools).
- **Readings / quizzes:** `src/data/topicData.ts` — hand-authored 1-page documents
  and comprehension questions per topic.
- **Videos & transcripts:** REAL YouTube captions, auto-generated into
  `src/data/videoLessons.generated.ts`. See "Refreshing video captions" below.
- Rebuild (`npm run build`) and re-upload `dist/`.

### Refreshing video captions (real YouTube data)

Transcripts are **real captions** pulled from curated [TED-Ed](https://ed.ted.com)
lessons — short (~5 min), learner-friendly, and shipping **manual, human-made**
subtitle tracks in English (`en`) and Simplified Chinese (`zh-CN`). The curated
list lives at the top of `scripts/fetch-captions.py`.

> Video-source research: round-ups from FluentU, Preply, StoryLearning and
> EnglishClub on "best YouTube channels to learn English" consistently recommend
> **TED-Ed** and **BBC Learning English** for short, captioned, educational clips.
> TED-Ed won because its community captions include high-quality `en` **and**
> `zh-CN` tracks from the same video — covering both course languages at once.

To change the videos or refresh the captions:

```bash
# one-time: get yt-dlp (https://github.com/yt-dlp/yt-dlp)
#   e.g. curl -L -o yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp && chmod +x yt-dlp

# edit the VIDEOS list in scripts/fetch-captions.py, then:
YTDLP=./yt-dlp npm run captions     # regenerates src/data/videoLessons.generated.ts
npm run build
```

The script downloads only caption tracks (`--skip-download`), parses the WebVTT
into timed `TranscriptLine[]`, strips TED-Ed translator-credit lines, and writes a
typed TS module. English cues are merged into sentence-like lines; Chinese cues are
kept native and segmented at runtime with `Intl.Segmenter` for click-to-translate.

### Pronunciation audio (text-to-speech)

Pronunciation uses the browser's built-in **Web Speech API** (`speechSynthesis`).
It is Baseline-supported and works out of the box on Safari/iPhone, Android,
macOS, Windows, and Chrome/Firefox — no install, no key, offline. The first tap
on a page unlocks the engine (an iOS Safari requirement).

As a guaranteed fallback for environments with **no system voices** (e.g. a
headless or engine-less Linux desktop, or fully offline use), every vocabulary
term and click-to-translate word also has a small prebuilt audio clip in
`public/audio/`. The app prefers the live system voice and only plays a clip
when no voice is available. Full-paragraph "read aloud" uses the live voice only
(its button is hidden when no voice is present).

Regenerate the clips — `npm run audio` manages an isolated virtualenv for you
(it creates `.venv/` and installs `edge-tts` there, so nothing touches the
system Python / avoids Ubuntu's PEP 668 error):

```bash
npm run audio               # -> public/audio/** + src/data/vocabAudio.generated.ts
npm run build
```

> Dev note: to hear *live* TTS on an engine-less Linux desktop you can install a
> system voice (`sudo apt install espeak-ng speech-dispatcher-espeak-ng`), but
> end users never need this — the prebuilt clips cover vocabulary regardless.

## 5. Adding a new language later

1. Add the code to `LanguageCode` in `src/data/types.ts`.
2. Add a word pool in `src/data/vocabData.ts` and topics in `src/data/topicData.ts`.
3. Add a BCP-47 voice mapping in `src/lib/speech.ts`.
4. Add a button in the language switch in `src/App.tsx`.
5. Run `npm run audio` to generate fallback clips for the new words.

## Features included
- 90-day journey with sequential unlocking, streaks, XP, and 8 achievement badges.
- Exercise 1 — flip-card vocabulary with text-to-speech and a match-up quiz.
- Exercise 2 — YouTube player with synced auto-scrolling transcript (real captions),
  click-to-pause word translation, and playback-speed control.
- Exercise 3 — one-page reader with click-to-translate, read-aloud, and a 3-question
  comprehension quiz that completes the day.
- English + Chinese (with toggleable Pinyin and Chinese TTS).
- Dark mode, mobile-friendly layout, and local backup/restore (JSON) for cross-device
  sync.
