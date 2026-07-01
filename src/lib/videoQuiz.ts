import type { QuizQuestion, VideoLesson } from "../data/types";
import type { UiLang } from "../data/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loc(en: string, fr: string, zh: string): Record<UiLang, string> {
  return { en, fr, zh };
}

/** Extract significant words (4+ letters, not common) from a transcript. */
function extractKeywords(transcript: { text: string }[], count: number): string[] {
  const STOP = new Set([
    "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
    "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
    "how", "its", "may", "new", "now", "old", "see", "two", "way", "who",
    "did", "got", "let", "say", "she", "too", "use", "with", "that", "this",
    "what", "when", "where", "which", "while", "have", "been", "were",
    "they", "your", "their", "there", "about", "would", "could", "should",
    "from", "them", "than", "then", "into", "also", "more", "most", "some",
    "such", "only", "very", "just", "like", "even", "well", "back",
  ]);
  const words = transcript
    .flatMap((l) => l.text.toLowerCase().split(/\W+/))
    .filter((w) => w.length >= 4 && !STOP.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w);
}

/**
 * Generate 3 template comprehension questions for a video, using its
 * transcript and the pool of all video titles (for distractors).
 * Deterministic per call (uses Math.random for shuffling — fine for a quiz).
 */
export function generateVideoQuiz(
  video: VideoLesson,
  allVideos: VideoLesson[],
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Q1: "What is this video about?" — correct title vs 2 random other titles
  const otherTitles = shuffle(allVideos.filter((v) => v.youtubeId !== video.youtubeId)).slice(0, 2);
  const q1Options = shuffle([
    video.title,
    ...otherTitles.map((v) => v.title),
  ]);
  questions.push({
    question: loc(
      "What is this video about?",
      "De quoi parle cette vidéo ?",
      "这段视频讲的是什么？",
    ),
    options: q1Options.map((t) => loc(t, t, t)),
    answer: q1Options.indexOf(video.title),
  });

  // Q2: "Which word appeared in the transcript?" — 1 real keyword + 2 from other transcripts
  const keywords = extractKeywords(video.transcript, 5);
  const otherVideos = allVideos.filter((v) => v.youtubeId !== video.youtubeId);
  const distractorWords = shuffle(
    otherVideos.flatMap((v) => extractKeywords(v.transcript, 3)),
  ).filter((w) => !keywords.includes(w)).slice(0, 2);

  if (keywords.length > 0) {
    const realWord = keywords[0];
    const q2Options = shuffle([realWord, ...distractorWords]);
    questions.push({
      question: loc(
        `Which word appeared in the transcript?`,
        `Quel mot est apparu dans la transcription ?`,
        `哪个词出现在字幕中？`,
      ),
      options: q2Options.map((w) => loc(w, w, w)),
      answer: q2Options.indexOf(realWord),
    });
  }

  // Q3: "True or false: the transcript mentioned '[keyword]'"
  if (keywords.length > 1) {
    const mentionedWord = keywords[1];
    const falseWord = distractorWords[0] ?? "xyzabc";
    const isTrue = Math.random() > 0.5;
    const target = isTrue ? mentionedWord : falseWord;
    questions.push({
      question: loc(
        `True or false: the transcript mentioned "${target}"`,
        `Vrai ou faux : la transcription a mentionné « ${target} »`,
        `对或错：字幕中提到了"${target}"`,
      ),
      options: [
        loc("True", "Vrai", "对"),
        loc("False", "Faux", "错"),
        loc("Can't tell", "Impossible à dire", "无法判断"),
      ],
      answer: isTrue ? 0 : 1,
    });
  }

  return questions;
}
