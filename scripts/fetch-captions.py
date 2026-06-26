#!/usr/bin/env python3
"""
Fetch real YouTube captions for a curated set of TED-Ed educational videos and
generate src/data/videoLessons.generated.ts.

TED-Ed clips are ~5 minutes, learner-friendly, and (importantly) ship MANUAL,
human-made subtitle tracks in English (en) and Chinese (zh-CN) — so we get
high-quality, punctuated transcripts for both languages of the course.

Sources for picking learner-friendly channels (researched on the web):
  - TED-Ed (ed.ted.com) — short animated lessons, professional captions
  - FluentU / Preply / StoryLearning / EnglishClub "best YouTube channels to
    learn English" round-ups all recommend TED-Ed + BBC Learning English.

Usage:
  YTDLP=/tmp/opencode/yt-dlp python3 scripts/fetch-captions.py
"""
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

YTDLP = os.environ.get("YTDLP", "yt-dlp")
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "videoLessons.generated.ts"

# Curated TED-Ed videos per topic. All verified to have manual en + zh-CN subs.
# (videoId, title, author, topic) — title/author used for display + attribution.
VIDEOS = {
    "history": [
        ("Owf5Uq4oFps", "How the Normans changed the history of Europe", "Mark Robinson"),
        ("YeB-1F-UKO0", "A brief history of chess", "Alex Gendler"),
    ],
    "philosophy": [
        ("R9OCA6UFE-0", "The philosophy of Stoicism", "Massimo Pigliucci"),
        ("1RWOpQXTltA", "Plato's Allegory of the Cave", "Alex Gendler"),
    ],
    "sport": [
        ("VdHHus8IgYA", "The ancient origins of the Olympics", "Armand D'Angour"),
    ],
    "science": [
        ("DmUiCweDic4", "The beginning of the universe, for beginners", "Tom Whyntie"),
        ("WYQ3O8U6SMY", "How small are we in the scale of the universe?", "Alex Hofeldt"),
    ],
    "art": [
        ("yRK_uCMwZPY", "Why is the Mona Lisa so famous?", "Noah Charney"),
        ("pM_IzEAv5d4", "Why is Vermeer's 'Girl with the Pearl Earring' a masterpiece?", "James Earle"),
    ],
}

TS_RE = re.compile(
    r"(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})"
)
TAG_RE = re.compile(r"<[^>]+>")
# Translator / reviewer credit lines that TED-Ed adds to community captions.
CREDIT_RE = re.compile(
    r"(翻译人员|校对人员|审校|译者|Translator|Reviewer|Translated by|Reviewed by)",
    re.IGNORECASE,
)


def to_seconds(h, m, s, ms):
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000.0


def parse_vtt(path: Path):
    """Parse a WebVTT file into a list of {start, end, text} cues."""
    cues = []
    if not path.exists():
        return cues
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    i = 0
    while i < len(lines):
        m = TS_RE.search(lines[i])
        if not m:
            i += 1
            continue
        start = to_seconds(*m.group(1, 2, 3, 4))
        end = to_seconds(*m.group(5, 6, 7, 8))
        i += 1
        text_parts = []
        while i < len(lines) and lines[i].strip() != "":
            text_parts.append(TAG_RE.sub("", lines[i]).strip())
            i += 1
        text = " ".join(p for p in text_parts if p).strip()
        text = re.sub(r"\s+", " ", text)
        if text and not CREDIT_RE.search(text):
            cues.append({"start": round(start, 2), "end": round(end, 2), "text": text})
    return cues


def merge_cues(cues, max_chars=90):
    """Merge short adjacent cues into fuller sentence-like lines for readability."""
    merged = []
    for c in cues:
        if (
            merged
            and len(merged[-1]["text"]) + len(c["text"]) < max_chars
            and not re.search(r"[.!?。！？]$", merged[-1]["text"])
        ):
            merged[-1]["text"] += " " + c["text"]
            merged[-1]["end"] = c["end"]
        else:
            merged.append(dict(c))
    return merged


def fetch_subs(video_id, tmp):
    """Download manual en + zh-CN subtitle tracks for a video into `tmp`.

    NOTE: we must NOT pass --print here — it implies --simulate and would stop
    yt-dlp from writing the subtitle files to disk.
    """
    cmd = [
        YTDLP, "--skip-download", "--write-subs",
        "--sub-langs", "en,zh-CN", "--sub-format", "vtt",
        "-o", str(tmp / "%(id)s.%(ext)s"),
        f"https://www.youtube.com/watch?v={video_id}",
    ]
    subprocess.run(cmd, capture_output=True, text=True, timeout=120)


def label_duration(seconds):
    if not seconds:
        return "~5 min"
    return f"{round(seconds / 60)} min"


def main():
    data = {"en": {}, "zh": {}}
    sources = []  # (topic, id, title, author)

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        for topic, vids in VIDEOS.items():
            data["en"][topic] = []
            data["zh"][topic] = []
            for vid, title, author in vids:
                print(f"[fetch] {topic}: {vid} — {title}", file=sys.stderr)
                fetch_subs(vid, tmp)
                en = merge_cues(parse_vtt(tmp / f"{vid}.en.vtt"))
                zh = parse_vtt(tmp / f"{vid}.zh-CN.vtt")  # CJK: keep native cues
                if not en:
                    print(f"  !! no English captions for {vid}, skipping", file=sys.stderr)
                    continue
                duration = en[-1]["end"] if en else None
                dur = label_duration(duration)
                data["en"][topic].append(
                    {"title": title, "youtubeId": vid, "duration": dur,
                     "author": author, "transcript": en}
                )
                # Fall back to English transcript if no Chinese track was found.
                data["zh"][topic].append(
                    {"title": title, "youtubeId": vid, "duration": dur,
                     "author": author, "transcript": zh if zh else en}
                )
                sources.append((topic, vid, title, author))
                print(f"  ok: en={len(en)} cues, zh={len(zh)} cues, {dur}", file=sys.stderr)

    header = (
        "// AUTO-GENERATED by scripts/fetch-captions.py — do not edit by hand.\n"
        "// Real YouTube captions from TED-Ed lessons (manual en + zh-CN tracks).\n"
        "// Re-run:  YTDLP=/path/to/yt-dlp python3 scripts/fetch-captions.py\n"
        "//\n"
        "// Video sources (TED-Ed, https://ed.ted.com):\n"
        + "".join(
            f"//   [{t}] {title} — {author}  (youtu.be/{vid})\n"
            for (t, vid, title, author) in sources
        )
        + "\n"
        'import type { LanguageCode, TopicId, VideoLesson } from "./types";\n\n'
        "export const VIDEO_LESSONS: Record<LanguageCode, Record<TopicId, VideoLesson[]>> =\n"
    )
    body = json.dumps(data, ensure_ascii=False, indent=2)
    OUT.write_text(header + body + ";\n", encoding="utf-8")
    print(f"[done] wrote {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
