import { Layers, Star } from "lucide-react";
import type { Store } from "../state/store";
import { FlashcardReview } from "./FlashcardReview";
import { Card } from "./ui";

/**
 * Dedicated "Practice" page: a spaced-repetition flashcard session over the
 * learner's saved-word deck, with an empty state guiding them to collect words
 * from readings/videos first.
 */
export function PracticeView({ store }: { store: Store }) {
  const { state, t } = store;
  const words = state.savedWords[state.language];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Layers size={22} className="text-indigo-500" />
          {t("nav.practice")}
        </h1>
        <p className="text-sm text-slate-500">
          {words.length > 0
            ? t("practice.count", { n: words.length })
            : t("srs.hint")}
        </p>
      </div>

      {words.length > 0 ? (
        <FlashcardReview key={state.language} store={store} />
      ) : (
        <Card className="p-10 text-center text-slate-400">
          <Star className="mx-auto mb-2 text-amber-400" size={26} />
          <p>{t("practice.empty")}</p>
        </Card>
      )}
    </div>
  );
}