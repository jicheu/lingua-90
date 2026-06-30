import { useMemo, useState } from "react";
import { Star, Volume2, X } from "lucide-react";
import type { Store } from "../state/store";
import type { LanguageCode } from "../data/types";
import { lookupWord, type Gloss } from "../lib/dictionary";
import { pronounce } from "../lib/speech";
import { loc } from "../i18n/strings";
import { cn } from "./ui";

interface PopoverState {
  gloss: Gloss;
  x: number;
  y: number;
}

interface Segment {
  text: string;
  clickable: boolean;
}

const BCP47: Record<LanguageCode, string> = { en: "en", zh: "zh" };

/**
 * Split text into word segments. Uses Intl.Segmenter when available so that
 * space-less Chinese caption text is broken into real words; falls back to
 * whitespace splitting otherwise.
 */
function segmentText(text: string, lang: LanguageCode): Segment[] {
  const Seg = (
    Intl as unknown as {
      Segmenter?: new (
        l: string,
        o: { granularity: string },
      ) => {
        segment: (t: string) => Iterable<{
          segment: string;
          isWordLike?: boolean;
        }>;
      };
    }
  ).Segmenter;

  if (Seg) {
    const seg = new Seg(BCP47[lang], { granularity: "word" });
    return Array.from(seg.segment(text)).map((s) => ({
      text: s.segment,
      clickable: Boolean(s.isWordLike),
    }));
  }
  return text
    .split(/(\s+)/)
    .map((t) => ({ text: t, clickable: t.trim().length > 0 }));
}

/**
 * Renders text where every word is clickable. Clicking a word opens a small
 * popover with its translation, a Listen button and a Save button.
 */
export function Translatable({
  text,
  store,
  className,
  onWordOpen,
}: {
  text: string;
  store: Store;
  className?: string;
  onWordOpen?: () => void;
}) {
  const [pop, setPop] = useState<PopoverState | null>(null);
  const { state } = store;
  const segments = useMemo(
    () => segmentText(text, state.language),
    [text, state.language],
  );

  function handleClick(e: React.MouseEvent, token: string) {
    // Stop the click from bubbling to wrappers (e.g. the sentence-by-sentence
    // reader uses a parent click handler to start playback).
    e.stopPropagation();
    const gloss = lookupWord(state.language, token);
    pronounce(token.replace(/[^\p{L}\p{N}]/gu, ""), state.language);
    if (!gloss) {
      setPop(null);
      return;
    }
    onWordOpen?.();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPop({
      gloss,
      x: rect.left + rect.width / 2,
      y: rect.bottom,
    });
  }

  return (
    <>
      <span className={className}>
        {segments.map((seg, i) =>
          !seg.clickable ? (
            <span key={i}>{seg.text}</span>
          ) : (
            <span
              key={i}
              onClick={(e) => handleClick(e, seg.text)}
              className="cursor-pointer rounded transition hover:bg-indigo-200/60 dark:hover:bg-indigo-500/30"
            >
              {seg.text}
            </span>
          ),
        )}
      </span>

      {pop && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPop(null)} />
          <div
            className="animate-pop fixed z-50 w-60 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            style={{
              left: Math.min(
                Math.max(pop.x, 130),
                window.innerWidth - 130,
              ),
              top: Math.min(pop.y + 8, window.innerHeight - 150),
            }}
          >
            <button
              onClick={() => setPop(null)}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
            <p className="font-display text-lg font-bold">{pop.gloss.term}</p>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {loc(state.uiLang, pop.gloss.translation)}
            </p>
            {pop.gloss.definition && (
              <p className="mt-1 text-xs text-slate-500">
                {loc(state.uiLang, pop.gloss.definition)}
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => pronounce(pop.gloss.term, state.language)}
                className="flex items-center gap-1 rounded-lg bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
              >
                <Volume2 size={13} /> {store.t("common.listen")}
              </button>
              <SaveBtn store={store} term={pop.gloss.term} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function SaveBtn({ store, term }: { store: Store; term: string }) {
  const saved = store.isWordSaved(term);
  return (
    <button
      onClick={() => {
        if (saved) {
          store.removeSavedWord(term);
        } else {
          const gloss = lookupWord(store.state.language, term);
          if (gloss) {
            store.saveWord({
              term: gloss.term,
              phonetic: "",
              translation: gloss.translation,
              definition: gloss.definition ?? { en: "", fr: "", zh: "" },
              example: "",
              category: "from reading",
            });
          }
        }
      }}
      className={cn(
        "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium",
        saved
          ? "bg-amber-400 text-amber-900"
          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
      )}
    >
      <Star size={13} fill={saved ? "currentColor" : "none"} />
      {saved ? store.t("common.saved") : store.t("common.save")}
    </button>
  );
}
