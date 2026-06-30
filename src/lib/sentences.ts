import type { LanguageCode } from "../data/types";

const BCP47: Record<LanguageCode, string> = { en: "en", zh: "zh" };

type SentenceSeg = new (
  l: string,
  o: { granularity: string },
) => { segment: (t: string) => Iterable<{ segment: string }> };

/**
 * Split a paragraph into sentences. Uses Intl.Segmenter with sentence
 * granularity when available (handles both English and space-less Chinese
 * correctly); falls back to a punctuation-based regex otherwise.
 */
export function splitSentences(text: string, lang: LanguageCode): string[] {
  const Seg = (Intl as unknown as { Segmenter?: SentenceSeg }).Segmenter;

  let parts: string[];
  if (Seg) {
    const seg = new Seg(BCP47[lang], { granularity: "sentence" });
    parts = Array.from(seg.segment(text)).map((s) => s.segment);
  } else {
    // Keep the sentence-ending punctuation attached to each sentence.
    parts = text.match(/[^.!?。！？]+[.!?。！？]*\s*/g) ?? [text];
  }

  return parts.map((s) => s.trim()).filter((s) => s.length > 0);
}
