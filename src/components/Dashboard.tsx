import { Check, Flame, Lock, Play, Star, Target, Trophy } from "lucide-react";
import type { Store } from "../state/store";
import { TOTAL_DAYS } from "../data/types";
import { BADGES } from "../state/badges";
import { Card, ProgressBar, cn } from "./ui";

export function Dashboard({
  store,
  onOpenDay,
}: {
  store: Store;
  onOpenDay: (day: number) => void;
}) {
  const { state, t, completedCount, isDayComplete, isDayUnlocked } = store;
  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);
  const pct = Math.round((completedCount / TOTAL_DAYS) * 100);
  const earned = new Set(state.badges);
  const langLabel = t(state.language === "en" ? "lang.en" : "lang.zh");
  const curDay = Math.min(state.currentDay, TOTAL_DAYS);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("dash.title", { lang: langLabel })}
        </h1>
        <p className="mt-1 text-slate-500">
          {t("dash.subtitle", { day: curDay, done: completedCount })}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<Flame size={16} />} label={t("stat.streak")} value={`${state.streak}${t("unit.days")}`} />
          <Stat icon={<Star size={16} />} label={t("stat.xp")} value={`${state.xp}`} />
          <Stat icon={<Target size={16} />} label={t("stat.progress")} value={`${pct}%`} />
          <Stat icon={<Trophy size={16} />} label={t("stat.badges")} value={`${earned.size}/${BADGES.length}`} />
        </div>
        <div className="mt-4">
          <ProgressBar value={pct} />
        </div>
      </section>

      {/* Continue CTA */}
      <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-sm text-slate-500">{t("dash.resume")}</p>
          <p className="mt-0.5 text-lg font-medium">
            {t("dash.resumeDay", { day: curDay })}
          </p>
        </div>
        <button
          onClick={() => onOpenDay(curDay)}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500 active:scale-[0.97]"
        >
          <Play size={17} fill="currentColor" /> {t("dash.continue")}
        </button>
      </Card>

      {/* Calendar */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t("dash.calendar")}
        </h2>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
          {days.map((day) => {
            const done = isDayComplete(day);
            const unlocked = isDayUnlocked(day);
            const isCurrent = day === state.currentDay && !done;
            return (
              <button
                key={day}
                disabled={!unlocked}
                onClick={() => onOpenDay(day)}
                className={cn(
                  "relative grid aspect-square place-items-center rounded-xl text-sm font-medium transition",
                  done && "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
                  !done && isCurrent &&
                    "bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-200",
                  !done && !isCurrent && unlocked &&
                    "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-400 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800",
                  !unlocked &&
                    "cursor-not-allowed bg-slate-100/60 text-slate-300 dark:bg-slate-900/40 dark:text-slate-700",
                )}
              >
                {done ? (
                  <Check size={16} strokeWidth={3} />
                ) : !unlocked ? (
                  <Lock size={13} />
                ) : (
                  day
                )}
                {isCurrent && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t("dash.achievements")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => {
            const has = earned.has(b.id);
            return (
              <div
                key={b.id}
                title={b.description}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition",
                  has
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20"
                    : "bg-slate-100/60 text-slate-400 dark:bg-slate-900/40 dark:text-slate-600",
                )}
              >
                <span>{has ? b.emoji : "🔒"}</span>
                {b.label}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
