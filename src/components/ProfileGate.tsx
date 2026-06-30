import { useEffect, useState } from "react";
import { Plus, UserRound, ArrowRight } from "lucide-react";
import type { UiLang } from "../data/types";
import { makeT } from "../i18n/strings";
import {
  listProfiles,
  createProfile,
  type ProfileInfo,
} from "../lib/profile";
import { Button, Card, cn } from "./ui";

/** Best-effort UI language for the pre-login screen (before a profile loads). */
function detectUiLang(): UiLang {
  try {
    const l = (navigator.language || "en").slice(0, 2);
    if (l === "fr") return "fr";
    if (l === "zh") return "zh";
  } catch {
    /* ignore */
  }
  return "en";
}

/**
 * The "who's learning?" landing page. Shown when the app is not behind a
 * YunoHost SSO login. Lists existing server profiles and lets the learner pick
 * one or create a new one. Picking a profile hands its id back to the app,
 * which then loads that profile's state from the server.
 */
export function ProfileGate({ onPick }: { onPick: (id: string) => void }) {
  const t = makeT(detectUiLang());
  const [profiles, setProfiles] = useState<ProfileInfo[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listProfiles().then((list) => {
      if (!cancelled) setProfiles(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function create() {
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    const created = await createProfile(trimmed);
    setBusy(false);
    if (created) onPick(created.id);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-900 font-display text-lg text-white dark:bg-white dark:text-slate-900">
            语
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Lingua<span className="text-indigo-500">90</span>
          </h1>
          <p className="mt-2 text-slate-500">{t("profile.whoLearning")}</p>
        </div>

        <Card className="p-5">
          {profiles === null ? (
            <p className="py-6 text-center text-sm text-slate-400">
              {t("profile.loading")}
            </p>
          ) : (
            <div className="space-y-2">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPick(p.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left transition",
                    "hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10",
                  )}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <UserRound size={18} />
                  </span>
                  <span className="flex-1 font-medium">{p.name}</span>
                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
                  />
                </button>
              ))}

              {profiles.length === 0 && !creating && (
                <p className="py-2 text-center text-sm text-slate-400">
                  {t("profile.none")}
                </p>
              )}

              {creating ? (
                <div className="flex gap-2 pt-1">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") create();
                      if (e.key === "Escape") setCreating(false);
                    }}
                    placeholder={t("profile.namePlaceholder")}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <Button onClick={create} disabled={!name.trim() || busy}>
                    {t("profile.create")}
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-left text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <Plus size={18} />
                  </span>
                  <span className="font-medium">{t("profile.newLearner")}</span>
                </button>
              )}
            </div>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-slate-400">
          {t("profile.hint")}
        </p>
      </div>
    </div>
  );
}
