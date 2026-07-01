import { Star, Trash2, Volume2 } from "lucide-react";
import type { Store } from "../state/store";
import { pronounce } from "../lib/speech";
import { loc } from "../i18n/strings";
import { FlashcardReview } from "./FlashcardReview";
import { Card } from "./ui";

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

      {words.length > 0 && <FlashcardReview key={state.language} store={store} />}

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

    </div>
  );
}
