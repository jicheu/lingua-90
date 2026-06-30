import { useEffect, useRef, useState } from "react";
import {
  Check,
  Languages,
  LogOut,
  Monitor,
  Moon,
  RotateCcw,
  Settings2,
  Sun,
  UserRound,
} from "lucide-react";
import type { LanguageCode, ThemeMode, UiLang } from "../data/types";
import { TOTAL_DAYS } from "../data/types";
import type { Store } from "../state/store";
import { UI_LANGS } from "../i18n/strings";
import { Segmented, cn } from "./ui";

export function SettingsMenu({
  store,
  sso = false,
  onSwitchProfile,
}: {
  store: Store;
  sso?: boolean;
  onSwitchProfile?: () => void;
}) {
  const { state, t } = store;
  const [open, setOpen] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const themeOpts: { value: ThemeMode; label: React.ReactNode }[] = [
    { value: "light", label: <Sun size={15} /> },
    { value: "dark", label: <Moon size={15} /> },
    { value: "auto", label: <Monitor size={15} /> },
  ];

  const learnLangs: { code: LanguageCode; label: string }[] = [
    { code: "en", label: "English" },
    { code: "zh", label: "中文" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("menu.settings")}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full transition-colors",
          open
            ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white"
            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
        )}
      >
        <Settings2 size={18} />
      </button>

      {open && (
        <div className="animate-pop absolute right-0 top-11 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Settings2 size={13} /> {t("menu.settings")}
          </p>

          {/* Profile */}
          <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-700">
            <p className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <UserRound size={14} /> {t("profile.title")}
            </p>
            <input
              value={state.name}
              onChange={(e) => store.setName(e.target.value)}
              disabled={sso}
              aria-label={t("profile.name")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800"
            />
            {sso ? (
              <p className="mt-1.5 px-1 text-xs text-slate-400">
                {t("profile.ssoNote")}
              </p>
            ) : (
              onSwitchProfile && (
                <button
                  onClick={onSwitchProfile}
                  className="mt-2 flex w-full items-center gap-2 rounded-xl px-1 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <LogOut size={15} /> {t("profile.switch")}
                </button>
              )
            )}
          </div>

          {/* Theme */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {t("menu.theme")}
            </span>
            <Segmented
              value={state.themeMode}
              options={themeOpts}
              onChange={store.setThemeMode}
              size="sm"
            />
          </div>

          {/* Interface language */}
          <div className="mb-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Languages size={14} /> {t("menu.interface")}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {UI_LANGS.map((l) => (
                <Choice
                  key={l.code}
                  active={state.uiLang === l.code}
                  onClick={() => store.setUiLang(l.code as UiLang)}
                  label={l.label}
                />
              ))}
            </div>
          </div>

          {/* Learning language */}
          <div className="mb-4">
            <p className="mb-1.5 text-sm text-slate-600 dark:text-slate-300">
              {t("menu.learning")}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {learnLangs.map((l) => (
                <Choice
                  key={l.code}
                  active={state.language === l.code}
                  onClick={() => store.setLanguage(l.code)}
                  label={l.label}
                />
              ))}
            </div>
          </div>

          {/* Pinyin toggle (only relevant for Chinese) */}
          {state.language === "zh" && (
            <button
              onClick={store.togglePinyin}
              className="flex w-full items-center justify-between rounded-xl px-1 py-1.5 text-sm text-slate-600 dark:text-slate-300"
            >
              <span>Pinyin</span>
              <span
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  state.showPinyin
                    ? "bg-indigo-600"
                    : "bg-slate-300 dark:bg-slate-600",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
                    state.showPinyin ? "left-[18px]" : "left-0.5",
                  )}
                />
              </span>
            </button>
          )}

          {/* Reset the current day's progress */}
          <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
            <button
              onClick={() => {
                const day = Math.min(state.currentDay, TOTAL_DAYS);
                store.resetDay(day);
                setResetMsg(t("menu.resetDayDone", { day }));
                setTimeout(() => setResetMsg(null), 2500);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-1 py-1.5 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <RotateCcw size={15} />
              {t("menu.resetDay", { day: Math.min(state.currentDay, TOTAL_DAYS) })}
            </button>
            {resetMsg && (
              <p className="mt-1 px-1 text-xs text-emerald-600">{resetMsg}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Choice({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-sm transition-colors",
        active
          ? "border-indigo-500 bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200"
          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
      )}
    >
      {active && <Check size={13} />}
      {label}
    </button>
  );
}
