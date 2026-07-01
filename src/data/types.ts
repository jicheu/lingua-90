// Core domain types for the Lingua 90 learning app.

export type LanguageCode = "en" | "zh";

/** Language of the app interface (chrome), independent of what's being learned. */
export type UiLang = "en" | "fr" | "zh";

/** Colour theme preference. "auto" follows the OS setting. */
export type ThemeMode = "light" | "dark" | "auto";

/** A short piece of text available in each interface language. */
export type Localized = Record<UiLang, string>;

export type TopicId =
  | "history"
  | "philosophy"
  | "sport"
  | "science"
  | "art"
  | "pedagogy"
  | "didactic";

/** Spaced-repetition stats attached to a saved word. */
export interface SrsStat {
  /** Times shown in a flashcard session. */
  seen: number;
  /** Times the learner knew it. */
  correct: number;
  /** Times the learner missed it. */
  wrong: number;
  /** Mastery level 0–5 (higher = better known = shown less). */
  level: number;
  /** Wall-clock ms when the card is eligible to reappear. */
  due?: number;
}

/** A single vocabulary item the learner studies on a flashcard. */
export interface Word {
  /** The headword in the target language (English word, or Chinese characters). */
  term: string;
  /** Phonetic aid: IPA-ish for English, Hanyu Pinyin for Chinese. */
  phonetic: string;
  /** Gloss shown in the learner's interface language (en / fr / zh). */
  translation: Localized;
  /** Short definition, shown in the interface language (en / fr / zh). */
  definition: Localized;
  /** Example sentence using the term in context (target language). */
  example: string;
  /** Loose register/category, mostly for display. */
  category: string;
  /** Spaced-repetition stats — present on saved words. */
  srs?: SrsStat;
}

/** A timed transcript line, synced to YouTube playback time (seconds). */
export interface TranscriptLine {
  start: number;
  end: number;
  text: string;
}

/** A multiple-choice comprehension question (shown in the interface language). */
export interface QuizQuestion {
  question: Localized;
  options: Localized[];
  /** Index into `options` of the correct answer. */
  answer: number;
}

/** The video exercise: a real YouTube clip + synced transcript. */
export interface VideoLesson {
  title: string;
  /** YouTube video id (the part after `v=`). */
  youtubeId: string;
  /** Approx clip duration label, e.g. "5 min". */
  duration: string;
  /** Creator / lesson author, for attribution (e.g. TED-Ed educator). */
  author?: string;
  transcript: TranscriptLine[];
}

/** The reading exercise: a one-page article + comprehension quiz. */
export interface ReadingLesson {
  title: string;
  /** Paragraphs of the article (each is plain text; words are tokenised at runtime). */
  paragraphs: string[];
  quiz: QuizQuestion[];
}

/** A full day of topic content (one video + one reading). */
export interface TopicLesson {
  video: VideoLesson;
  reading: ReadingLesson;
}

/** All content for a single topic in a single language. */
export interface Topic {
  id: TopicId;
  label: string;
  emoji: string;
  /** Pool of lessons; day N cycles through this list. */
  lessons: TopicLesson[];
}

export interface TopicMeta {
  id: TopicId;
  label: string;
  emoji: string;
}

/** Per-day progress record persisted to localStorage. */
export interface DayProgress {
  /** Topic the learner picked for this day. */
  topic?: TopicId;
  vocabDone: boolean;
  videoDone: boolean;
  readingDone: boolean;
  /** Playback position (seconds) the learner reached in the video, to resume. */
  videoTime?: number;
  /** ISO date string of completion (all three done). */
  completedAt?: string;
}

export interface AppState {
  /** Display name of the learner profile (shown on the profile picker). */
  name: string;
  language: LanguageCode;
  /** Interface language (en / fr / zh). */
  uiLang: UiLang;
  showPinyin: boolean;
  /** Theme preference: light, dark, or follow the system ("auto"). */
  themeMode: ThemeMode;
  /** Highest day unlocked (1-based). Day N unlocks when N-1 is complete. */
  currentDay: number;
  xp: number;
  /** Current consecutive-day streak. */
  streak: number;
  /** ISO date (YYYY-MM-DD) of the last fully completed day. */
  lastCompletedDate?: string;
  /** keyed by `${language}-${dayNumber}` */
  progress: Record<string, DayProgress>;
  /** Saved vocabulary the learner bookmarked, keyed by language. */
  savedWords: Record<LanguageCode, Word[]>;
  /** Achievement ids already unlocked. */
  badges: string[];
  /** How many cards a flashcard review session contains. */
  sessionSize: number;
  /** Last topic the learner chose (pre-selects the same topic for new days). */
  lastTopic?: TopicId;
  /** Wall-clock ms of the last local mutation; used for last-writer-wins sync. */
  updatedAt: number;
}

export const TOTAL_DAYS = 90;
