import type { LanguageCode } from "../data/types";
import { VOCAB_AUDIO } from "../data/vocabAudio.generated";

const BCP47: Record<LanguageCode, string> = {
  en: "en-US",
  zh: "zh-CN",
};

let voicesCache: SpeechSynthesisVoice[] = [];
let unlocked = false;
let audioEl: HTMLAudioElement | null = null;

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  return window.speechSynthesis;
}

function refreshVoices() {
  const s = synth();
  if (!s) return;
  const v = s.getVoices();
  if (v.length) voicesCache = v;
}

/**
 * Load voices eagerly and keep the cache fresh. Safari/Chrome populate the
 * list lazily (and fire `voiceschanged` later), so we both poll once and
 * subscribe.
 */
export function initSpeech() {
  const s = synth();
  if (!s) return;
  refreshVoices();
  s.addEventListener("voiceschanged", refreshVoices);
}

/**
 * Unlock the speech engine from within a real user gesture. iOS Safari only
 * allows speech that originates from a user interaction, and the very first
 * call must happen synchronously inside that gesture — so we speak a tiny
 * silent utterance the first time the user touches the page. Also primes the
 * HTML5 Audio element used for clip playback.
 */
export function unlockOnGesture() {
  if (unlocked) return;
  unlocked = true;
  const s = synth();
  if (s) {
    try {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      s.speak(u);
      s.cancel();
      refreshVoices();
    } catch {
      /* ignore */
    }
  }
  // Create the shared audio element so the first clip can play on iOS.
  if (typeof Audio !== "undefined" && !audioEl) {
    audioEl = new Audio();
  }
}

function pickVoice(lang: LanguageCode): SpeechSynthesisVoice | undefined {
  const list = voicesCache.length ? voicesCache : synth()?.getVoices() ?? [];
  const want = BCP47[lang].toLowerCase();
  const family = lang === "zh" ? "zh" : "en";
  return (
    list.find((v) => v.lang?.toLowerCase() === want) ||
    list.find((v) => v.lang?.toLowerCase().startsWith(want)) ||
    list.find((v) => v.lang?.toLowerCase().startsWith(family))
  );
}

/** True only once we know there is at least one usable system voice. */
export function hasVoices(): boolean {
  const s = synth();
  if (!s) return false;
  return voicesCache.length > 0 || s.getVoices().length > 0;
}

export function speechSupported(): boolean {
  return synth() !== null;
}

// Case-insensitive index for English term lookups (built once, lazily).
let enIndex: Record<string, string> | null = null;
function enLower(): Record<string, string> {
  if (!enIndex) {
    enIndex = {};
    for (const [term, rel] of Object.entries(VOCAB_AUDIO.en ?? {})) {
      enIndex[term.toLowerCase()] = rel;
    }
  }
  return enIndex;
}

function clipPath(term: string, lang: LanguageCode): string | null {
  let rel: string | undefined = VOCAB_AUDIO[lang]?.[term];
  if (!rel && lang === "en") rel = enLower()[term.toLowerCase()];
  if (!rel) return null;
  const base =
    (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
  return base + rel;
}

function playClip(src: string): boolean {
  if (typeof Audio === "undefined") return false;
  try {
    if (!audioEl) audioEl = new Audio();
    audioEl.src = src;
    audioEl.currentTime = 0;
    void audioEl.play();
    return true;
  } catch {
    return false;
  }
}

/**
 * Speak free-form text using the system voice. Must be called from within a
 * user gesture. Returns false if no system voice is available (the caller can
 * then decide to degrade gracefully).
 */
export function speak(text: string, lang: LanguageCode): boolean {
  const clean = text.trim();
  const s = synth();
  if (!clean || !s || !hasVoices()) return false;
  try {
    s.cancel();
  } catch {
    /* ignore */
  }
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = BCP47[lang];
  u.rate = lang === "zh" ? 0.85 : 0.95;
  u.pitch = 1;
  u.volume = 1;
  const v = pickVoice(lang);
  if (v) u.voice = v;
  s.resume();
  s.speak(u);
  return true;
}

/**
 * Pronounce a single known word (vocabulary or click-to-translate term).
 *
 * We PREFER the prebuilt clip when one exists: it is high-quality, consistent
 * across every device, and — crucially — works on browsers that advertise
 * voices but produce no audio (e.g. Chrome on Linux with no speech engine,
 * where `speak()` silently does nothing). Falls back to the live system voice
 * only when there is no clip for the term.
 */
export function pronounce(term: string, lang: LanguageCode) {
  const clip = clipPath(term, lang);
  if (clip && playClip(clip)) return;
  speak(term, lang);
}

export function stopSpeaking() {
  const s = synth();
  if (s) s.cancel();
  if (audioEl) {
    try {
      audioEl.pause();
    } catch {
      /* ignore */
    }
  }
}
