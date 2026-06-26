import { useRef, useState } from "react";
import {
  Download,
  Eye,
  EyeOff,
  Shuffle,
  Star,
  Trash2,
  TriangleAlert,
  Upload,
  Volume2,
} from "lucide-react";
import type { Store } from "../state/store";
import { pronounce } from "../lib/speech";
import { loc } from "../i18n/strings";
import { Button, Card, cn } from "./ui";

export function ReviewHub({ store }: { store: Store }) {
  const { state, t } = store;
  const words = state.savedWords[state.language];
  const langLabel = t(state.language === "en" ? "lang.en" : "lang.zh");

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("review.title")}</h1>
        <p className="text-sm text-slate-500">
          {t("review.subtitle", { n: words.length, lang: langLabel })}
        </p>
      </div>

      {words.length > 0 && <Practice store={store} />}

      {words.length === 0 ? (
        <Card className="p-10 text-center text-slate-400">
          <Star className="mx-auto mb-2 text-amber-400" size={26} />
          {t("review.empty")}
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((w) => (
            <Card key={w.term} className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold">{w.term}</p>
                {w.phonetic && (
                  <p className="text-xs text-indigo-500">{w.phonetic}</p>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {loc(state.uiLang, w.translation)}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => pronounce(w.term, state.language)}
                  className="rounded-full p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/15"
                >
                  <Volume2 size={16} />
                </button>
                <button
                  onClick={() => store.removeSavedWord(w.term)}
                  className="rounded-full p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BackupRestore store={store} />
    </div>
  );
}

function Practice({ store }: { store: Store }) {
  const { state, t } = store;
  const words = state.savedWords[state.language];
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(false);

  const w = words[Math.min(idx, words.length - 1)];

  function next(random: boolean) {
    setReveal(false);
    setIdx((i) =>
      random ? Math.floor(Math.random() * words.length) : (i + 1) % words.length,
    );
  }

  return (
    <Card className="p-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {t("review.practice")}
      </h2>
      <div
        className="mx-auto flex max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900"
        onClick={() => setReveal((r) => !r)}
      >
        <span className="font-display text-3xl font-semibold">{w.term}</span>
        {(state.language === "en" || state.showPinyin) && w.phonetic && (
          <span className="mt-1 text-sm text-indigo-500">{w.phonetic}</span>
        )}
        <div
          className={cn(
            "mt-4 text-lg font-medium transition",
            reveal ? "opacity-100" : "select-none opacity-0",
          )}
        >
          {loc(state.uiLang, w.translation)}
        </div>
        <span className="mt-3 flex items-center gap-1 text-xs text-slate-400">          {reveal ? <EyeOff size={12} /> : <Eye size={12} />}
          {reveal ? t("review.hide") : t("review.reveal")}
        </span>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => pronounce(w.term, state.language)}>
          <Volume2 size={15} /> {t("common.listen")}
        </Button>
        <Button size="sm" onClick={() => next(false)}>
          {t("review.next")} →
        </Button>
        <Button variant="ghost" size="sm" onClick={() => next(true)}>
          <Shuffle size={15} /> {t("review.shuffle")}
        </Button>
      </div>
    </Card>
  );
}

function BackupRestore({ store }: { store: Store }) {
  const { t } = store;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function download() {
    const blob = new Blob([store.exportState()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lingua90-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg(t("backup.exported"));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = store.importState(String(reader.result));
      setMsg(ok ? t("backup.restored") : t("backup.badFile"));
    };
    reader.readAsText(file);
  }

  return (
    <Card className="p-6">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {t("backup.title")}
      </h2>
      <p className="mb-4 text-sm text-slate-500">{t("backup.desc")}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={download}>
          <Download size={16} /> {t("backup.export")}
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload size={16} /> {t("backup.import")}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onFile}
        />
        {!confirmReset ? (
          <Button
            variant="ghost"
            className="text-rose-500"
            onClick={() => setConfirmReset(true)}
          >
            <Trash2 size={16} /> {t("backup.reset")}
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 dark:bg-rose-500/10">
            <TriangleAlert size={16} className="text-rose-500" />
            <span className="text-sm text-rose-600 dark:text-rose-300">
              {t("backup.confirm")}
            </span>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-500"
              onClick={() => {
                store.resetAll();
                setConfirmReset(false);
                setMsg(t("backup.wasReset"));
              }}
            >
              {t("common.yes")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
              {t("common.no")}
            </Button>
          </div>
        )}
      </div>
      {msg && <p className="mt-3 text-sm text-emerald-600">{msg}</p>}
    </Card>
  );
}
