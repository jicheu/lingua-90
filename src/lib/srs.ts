import type { SrsStat, Word } from "../data/types";

/**
 * Lightweight spaced-repetition for flashcard review.
 *
 * The more a word is known (higher `level`), the less often it is suggested;
 * the more it is missed (higher `wrong`, lower `level`), the more often it
 * comes back. A correct answer pushes the next review further out; a miss
 * brings it back almost immediately.
 */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// Review interval per mastery level (ms). Index = level (0–5).
const INTERVALS = [0, 8 * HOUR, DAY, 3 * DAY, 7 * DAY, 16 * DAY];

export function initSrs(): SrsStat {
  return { seen: 0, correct: 0, wrong: 0, level: 0 };
}

/** Update a word's stats after a flashcard answer. */
export function applyResult(stat: SrsStat | undefined, known: boolean): SrsStat {
  const s = stat ?? initSrs();
  const seen = s.seen + 1;
  if (known) {
    const level = Math.min(5, s.level + 1);
    return {
      seen,
      correct: s.correct + 1,
      wrong: s.wrong,
      level,
      due: Date.now() + INTERVALS[level],
    };
  }
  return {
    seen,
    correct: s.correct,
    wrong: s.wrong + 1,
    level: Math.max(0, s.level - 1),
    due: Date.now() + 10 * 60_000, // bring a missed word back in ~10 min
  };
}

/** Selection weight — higher means more likely / sooner in a session. */
export function wordWeight(stat: SrsStat | undefined, now: number): number {
  const s = stat ?? initSrs();
  const overdue = s.due == null || s.due <= now;
  // Struggled words (more misses, lower mastery) weigh more.
  const base = (1 + s.wrong * 2) / (1 + s.level);
  const newBoost = s.seen === 0 ? 2 : 0;
  // Words that aren't due yet are strongly de-prioritised but still possible
  // (so a session can always be filled).
  return Math.max(0.0001, overdue ? base + newBoost : base * 0.15);
}

/**
 * Pick up to `size` words for a session via weighted sampling without
 * replacement, so struggling/new/overdue words surface more often while
 * well-known ones appear rarely.
 */
export function pickSession(words: Word[], size: number): Word[] {
  const now = Date.now();
  const pool = words.map((w) => ({ w, weight: wordWeight(w.srs, now) }));
  const chosen: Word[] = [];
  const n = Math.min(size, pool.length);
  for (let k = 0; k < n; k++) {
    const total = pool.reduce((a, p) => a + p.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      r -= pool[idx].weight;
      if (r <= 0) break;
    }
    idx = Math.min(idx, pool.length - 1);
    chosen.push(pool[idx].w);
    pool.splice(idx, 1);
  }
  return chosen;
}

/** A human-friendly mastery label (0–5). */
export function masteryPercent(stat: SrsStat | undefined): number {
  return Math.round(((stat?.level ?? 0) / 5) * 100);
}
