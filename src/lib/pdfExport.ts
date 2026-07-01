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

  // Group words by category; uncategorised go last under "Collected".
  const groups = new Map<string, Word[]>();
  for (const w of words) {
    const key = w.category?.trim() || "collected";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(w);
  }

  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let rowIndex = 0;
  let body = "";

  for (const [category, group] of groups) {
    const label = category.charAt(0).toUpperCase() + category.slice(1);
    body += `
      <tr class="section-header">
        <td colspan="3">${esc(label)}</td>
      </tr>`;
    for (const w of group) {
      rowIndex++;
      const translation = loc(w.translation, uiLang);
      const definition = loc(w.definition, uiLang);
      const isPlaceholder = translation === w.term;
      const even = rowIndex % 2 === 0;
      body += `
      <tr class="${even ? "even" : ""}">
        <td class="idx">${rowIndex}</td>
        <td class="term-cell">
          <span class="term">${esc(w.term)}</span>
          ${w.phonetic ? `<span class="phonetic">${esc(w.phonetic)}</span>` : ""}
        </td>
        <td class="trans-cell">
          ${isPlaceholder
            ? `<span class="placeholder">·</span>`
            : `<span class="translation">${esc(translation)}</span>`}
          ${!isPlaceholder && definition
            ? `<br/><span class="definition">${esc(definition)}</span>`
            : ""}
        </td>
      </tr>`;
    }
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Lingua 90 – Vocabulary Memo</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: 13px;
    color: #1e293b;
    background: white;
    padding: 24px 28px;
  }

  /* Header */
  .page-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 2px solid #1e293b;
    padding-bottom: 10px;
    margin-bottom: 18px;
  }
  .page-header h1 {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .page-header h1 span { color: #4f46e5; }
  .page-header .meta {
    font-size: 11px;
    color: #64748b;
    text-align: right;
    line-height: 1.5;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
  }
  tr.section-header td {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    padding: 14px 6px 4px;
  }
  tr:not(.section-header) td {
    padding: 7px 6px;
    vertical-align: top;
    border-bottom: 1px solid #f1f5f9;
  }
  tr.even td { background: #f8fafc; }

  .idx {
    width: 28px;
    color: #cbd5e1;
    font-size: 11px;
    text-align: right;
    padding-right: 10px;
    white-space: nowrap;
  }
  .term-cell { width: 32%; }
  .term { font-weight: 600; font-size: 14px; }
  .phonetic { display: block; font-size: 10px; color: #6366f1; margin-top: 1px; }
  .trans-cell { width: 58%; }
  .translation { font-weight: 500; color: #1e293b; }
  .definition { font-size: 11px; color: #64748b; line-height: 1.4; }
  .placeholder { color: #cbd5e1; }

  /* Footer */
  .page-footer {
    margin-top: 24px;
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
    font-size: 10px;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
  }

  @media print {
    body { padding: 12px 16px; }
    tr.even td { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-footer { position: fixed; bottom: 0; left: 16px; right: 16px; }
  }
</style>
</head>
<body>
<div class="page-header">
  <h1>Lingua<span>90</span> — Vocabulary Memo</h1>
  <div class="meta">
    ${esc(date)}<br/>
    ${words.length} word${words.length === 1 ? "" : "s"}
  </div>
</div>

<table>
  <tbody>${body}</tbody>
</table>

<div class="page-footer">
  <span>Lingua 90</span>
  <span>${esc(date)}</span>
</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
