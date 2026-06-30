import type { LanguageCode, UiLang } from "../data/types";

/**
 * Online sentence translation via Google's free, key-less "gtx" endpoint.
 * Used only by the synchronised-translation reading mode, which is explicitly
 * an online-only feature — the rest of the app stays fully offline.
 */

const GOOGLE_LANG: Record<LanguageCode | UiLang, string> = {
  en: "en",
  fr: "fr",
  zh: "zh-CN",
};

// Cache results for the session so re-entering the mode is instant and we
// don't hammer the endpoint.
const cache = new Map<string, string>();

export async function translateText(
  text: string,
  source: LanguageCode,
  target: UiLang,
  signal?: AbortSignal,
): Promise<string> {
  const clean = text.trim();
  if (!clean) return "";
  // Same language in and out — nothing to translate.
  if ((source as string) === (target as string)) return text;

  const key = `${source}|${target}|${clean}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const sl = GOOGLE_LANG[source];
  const tl = GOOGLE_LANG[target];
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx" +
    `&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(clean)}`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`translate failed: ${res.status}`);
  const data = await res.json();

  // Response shape: [ [ [translated, original, ...], ... ], ... ]
  const segments: unknown = Array.isArray(data) ? data[0] : null;
  const out = Array.isArray(segments)
    ? segments
        .map((seg) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
        .join("")
    : "";

  const result = out || clean;
  cache.set(key, result);
  return result;
}
