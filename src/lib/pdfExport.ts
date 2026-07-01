import type { UiLang, Word } from "../data/types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function loc(obj: Record<UiLang, string>, lang: UiLang): string {
  return obj[lang] || obj.en || "";
}

export function exportWordsPdf(words: Word[], uiLang: UiLang): void {
  if (words.length === 0) return;

  const cards = words
    .map((w) => {
      const translation = loc(w.translation, uiLang);
      const definition = loc(w.definition, uiLang);
      const isPlaceholder = translation === w.term;
      return `
        <div class="card">
          <div class="front">
            <div class="term">${esc(w.term)}</div>
            ${w.phonetic ? `<div class="phonetic">${esc(w.phonetic)}</div>` : ""}
            ${w.category ? `<div class="category">${esc(w.category)}</div>` : ""}
          </div>
          <div class="divider"></div>
          <div class="back">
            ${isPlaceholder
              ? `<div class="no-translation">—</div>`
              : `<div class="translation">${esc(translation)}</div>`}
            ${!isPlaceholder && definition
              ? `<div class="definition">${esc(definition)}</div>`
              : ""}
          </div>
        </div>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Lingua 90 – Word cards</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, "Songti SC", serif; background: white; color: #1e293b; padding: 8px; }
  h1 { text-align: center; font-size: 11px; color: #94a3b8; padding: 8px 0 12px; letter-spacing: 0.06em; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); }
  .card { border: 1px solid #e2e8f0; display: flex; flex-direction: column; min-height: 96px; page-break-inside: avoid; }
  .front, .back { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 8px; text-align: center; }
  .term { font-size: 20px; font-weight: bold; }
  .phonetic { font-size: 11px; color: #6366f1; margin-top: 2px; }
  .category { font-size: 9px; color: #94a3b8; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
  .divider { border-top: 1px dashed #cbd5e1; }
  .translation { font-size: 15px; color: #3730a3; font-weight: 500; }
  .no-translation { font-size: 20px; color: #cbd5e1; }
  .definition { font-size: 9px; color: #64748b; margin-top: 4px; line-height: 1.3; }
  @media print { h1 { display: none; } body { padding: 0; } }
</style>
</head>
<body>
<h1>Lingua 90 · ${words.length} word card${words.length === 1 ? "" : "s"} · Print &amp; cut along borders</h1>
<div class="grid">${cards}</div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}
