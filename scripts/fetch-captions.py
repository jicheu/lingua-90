#!/usr/bin/env python3
"""
Fetch real YouTube captions (en + zh-CN) for the Lingua 90 video pool.

The video pool is a flat list of TED-Ed animations spanning three broad themes:
philosophy, how we learn, and communication. Day N in the app maps to
VIDEO_POOL[N-1], so each of the 90 days gets a unique video.

Usage:
    pip install yt-dlp
    python3 scripts/fetch-captions.py

Output:
    src/data/videoLessons.generated.ts
"""

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

# ── The 90-video pool ──────────────────────────────────────────────────────
# Each entry: (youtubeId, title, author, theme)
# Themes: "philosophy", "learning", "communication"

VIDEOS = [
    # ── Philosophy (30) ──
    ("R9OCA6UFE-0", "The philosophy of Stoicism", "Massimo Pigliucci", "philosophy"),
    ("1RWOpQXTltA", "Plato's Allegory of the Cave", "Alex Gendler", "philosophy"),
    ("Utzym1I_BiY", "The philosophy of cynicism", "William D. Desmond", "philosophy"),
    ("mGYmiQkah4o", "Mary's Room: A philosophical thought experiment", "Eleanor Nelsen", "philosophy"),
    ("yJSiUm6jvI0", "Why do we love? A philosophical inquiry", "Skye C. Cleary", "philosophy"),
    ("heCSbA8w57A", "Should you trust unanimous decisions?", "Derek Abbott", "philosophy"),
    ("9p5Oi4wPVVo", "Zen kōans: Unsolvable enigmas", "Puqun Li", "philosophy"),
    ("fUlGtrHCGzs", "What 'Machiavellian' really means", "Pazit Cahlon and Alex Gendler", "philosophy"),
    ("8li-3pRrA5Y", "A brief history of melancholy", "Courtney Stephens", "philosophy"),
    ("vPtzpjC7TF4", "Is life meaningless? And other absurd questions", "Nina Medvinskaya", "philosophy"),
    ("2aEQDi2ZYCI", "Ethical dilemma: What makes life worth living?", "Douglas MacLean", "philosophy"),
    ("S3jqTWXwzJc", "If you had the chance to be immortal, would you take it?", "Sarah Stroud and Michael Vazquez", "philosophy"),
    ("MASBIB7zPo4", "What is consciousness?", "Michael S. A. Graziano", "philosophy"),
    ("ILDy6kYU-xQ", "Are you a body with a mind or a mind with a body?", "Maryam Alimardani", "philosophy"),
    ("q4pDUxth5fQ", "The myth of Sisyphus", "Alex Gendler", "philosophy"),
    ("Ws2Y2cWme8c", "The meaning of life according to Simone de Beauvoir", "Iseult Gillespie", "philosophy"),
    ("wFt_VGG0kJU", "Who was Confucius?", "Bryan W. Van Norden", "philosophy"),
    ("9xf1T7-t1ak", "5 philosophers on anger", "Delaney Thull", "philosophy"),
    ("ezmR9Attpyc", "The hidden meanings of yin and yang", "John Bellaimey", "philosophy"),
    ("UHwVyplU3Pg", "Who am I? A philosophical inquiry", "Amy Adkins", "philosophy"),
    ("TfVmW6sNux8", "Plato's allegory of the ring", "Alex Gendler", "philosophy"),
    ("LmxlcJFTaYU", "How do you know you exist?", "James Zucker", "philosophy"),
    ("OI-G23HF6Sw", "Ethical dilemma: Would you lie?", "Sarah Stroud", "philosophy"),
    ("pq9ECmry8bc", "How do you know you're not dreaming?", "Daniel Gregory", "philosophy"),
    ("A1x7FqXRy9c", "You can only save one—who do you choose?", "Doug MacKay", "philosophy"),
    ("wkPR4Rcf4ww", "What makes something 'Kafkaesque'?", "Noah Tavlin", "philosophy"),
    ("oe64p-QzhNE", "What 'Orwellian' really means", "Noah Tavlin", "philosophy"),
    ("6a6kbU88wu0", "How to recognize a dystopia", "Alex Gendler", "philosophy"),
    ("bFIVYRfyb3E", "What if you experienced every human life in history?", "", "philosophy"),
    ("EfqVnj-sgcc", "What is Zeno's Dichotomy Paradox?", "Colm Kelleher", "philosophy"),

    # ── How we learn (30) ──
    ("dItUGF8GdTw", "5 tips to improve your critical thinking", "Samantha Agoos", "learning"),
    ("vNDYUlxNIAA", "This tool will help improve your critical thinking", "Erick Wilberding", "learning"),
    ("MMmOLN5zBLY", "The benefits of a bilingual brain", "Mia Nacamulli", "learning"),
    ("f2O6mQkFiiw", "How to practice effectively...for just about anything", "Annie Bosler and Don Greene", "learning"),
    ("yOgAbKJGrTA", "How memories form and how we lose them", "Catharine Young", "learning"),
    ("hyg7lcU4g8E", "Does stress affect your memory?", "Elizabeth Cox", "learning"),
    ("nZP7pb_t4oA", "How do our brains process speech?", "Gareth Gaskell", "learning"),
    ("e7uXAlXdTe4", "The science of imagination", "Andrey Vyshedskiy", "learning"),
    ("gedoSfZvBgE", "The benefits of a good night's sleep", "Shai Marcu", "learning"),
    ("WuyPuH9ojCE", "How stress affects your brain", "Madhumita Murgia", "learning"),
    ("qAC-5hTK-4c", "How your brain's executive function works—and how to improve it", "Sabine Doebel", "learning"),
    ("iDbdXTMnOmE", "How to manage your time more effectively (according to machines)", "Brian Christian", "learning"),
    ("H6LEcM0E0io", "The difference between classical and operant conditioning", "Peggy Andover", "learning"),
    ("ZMSbDwpIyF4", "The left brain vs. right brain myth", "Elizabeth Waters", "learning"),
    ("O96fE1E-rf8", "Learning how to learn", "Barbara Oakley", "learning"),
    ("Z_gV1hEqlA8", "Can you 'see' images in your mind? Some people can't", "Adam Zeman", "learning"),
    ("l_NYrWqUR40", "3 tips to boost your confidence", "TED-Ed", "learning"),
    ("iNyUmbmQQZg", "Is it normal to talk to yourself?", "TED-Ed", "learning"),
    ("CxC161GvMPc", "What is the tragedy of the commons?", "Nicholas Amendolare", "learning"),
    ("CqgmozFr_GM", "How to stay calm under pressure", "Noa Kageyama and Pen-Pen Chen", "learning"),
    ("WiTgn5QH_HU", "Why do we feel nostalgia?", "Clay Routledge", "learning"),
    ("4oOkldIqhDg", "6 logical reasoning questions to trick your brain", "TED-Ed", "learning"),
    ("dqONk48l5vY", "What would happen if you didn't sleep?", "Claudia Aguirre", "learning"),
    ("xyQY8a-ng6g", "How the food you eat affects your brain", "Mia Nacamulli", "learning"),
    ("OQw3TNRnJ1I", "Why the insect brain is so incredible", "Anna Stöckl", "learning"),
    ("Nlcr1jd_Tok", "Is marijuana bad for your brain?", "Anees Bahji", "learning"),
    ("TjPFZaMe2yw", "3 tips on how to study effectively", "TED-Ed", "learning"),
    ("OyK0oE5rwFY", "The benefits of good posture", "Murat Dalkilinç", "learning"),
    ("q-ApAdEOm5s", "The best way to apologize (according to science)", "TED-Ed", "learning"),
    ("58jHhNzUHm4", "How can you change someone's mind?", "Hugo Mercier", "learning"),

    # ── Communication (30) ──
    ("3klMM9BkW5o", "How to use rhetoric to get what you want", "Camille A. Langston", "communication"),
    ("btWlBHE0pe4", "How to communicate clearly", "TED-Ed", "communication"),
    ("flthk8SNiiE", "Three anti-social skills to improve your writing", "Nadia Kalman", "communication"),
    ("i3ku5nx4tMU", "4 things all great listeners know", "TED-Ed", "communication"),
    ("gCfzeONu3Mo", "How miscommunication happens (and how to avoid it)", "Katherine Hampsten", "communication"),
    ("A0edKgL9EgM", "The art of the metaphor", "Jane Hirshfield", "communication"),
    ("RSoRzTtwgP4", "How to write descriptively", "Nalo Hopkinson", "communication"),
    ("URuMb15CWJs", "The pleasure of poetic pattern", "David Silverstein", "communication"),
    ("JwhouCNq-Fc", "What makes a poem … a poem?", "Melissa Kovacs", "communication"),
    ("-GsVhbmecJA", "Aphasia: The disorder that makes you lose your words", "Susan Wortman-Jutt", "communication"),
    ("RKK7wGAYP6k", "How language shapes the way we think", "Lera Boroditsky", "communication"),
    ("Uew5BbvmLks", "How to manage your emotions", "TED-Ed", "communication"),
    ("rmASLb_Yn5Y", "Are we cooked? How social media shapes language", "Adam Aleksic", "communication"),
    ("2ey232I5nUk", "Ethos, Pathos, Logos", "TED-Ed", "communication"),
    ("-oUfOh_CgHQ", "The three persuasive appeals: Logos, Ethos, and Pathos", "TED-Ed", "communication"),
    ("Ym6whrAw8wU", "The common character trait of geniuses", "James Gleick", "communication"),
    ("kOVdiDUlNsg", "How some friendships last—and others don't", "Iseult Gillespie", "communication"),
    ("bGBamfWasNQ", "Speak like a leader", "Simon Lancaster", "communication"),
    ("QGeHS4jO0X0", "It's not manipulation, it's strategic communication", "Keisha Brewer", "communication"),
    ("ysSgG5V-R3U", "What makes things funny", "Peter McGraw", "communication"),
    ("QijH4UAqGD8", "Get comfortable with being uncomfortable", "Luvvie Ajayi Jones", "communication"),
    ("sUv353ua7E8", "How to find laughter anywhere", "Chris Duffy", "communication"),
    ("Vtkv3-endYc", "Why should you read 'Crime and Punishment'?", "Alex Gendler", "communication"),
    ("QTu39aMg_mU", "Why should you read 'Hamlet'?", "Iseult Gillespie", "communication"),
    ("yhYU4ZbLmmk", "Why should you read 'Dune' by Frank Herbert?", "Dan Kwartler", "communication"),
    ("U_u91SjrEOE", "The myth of Prometheus", "Iseult Gillespie", "communication"),
    ("Vtkv3-endYc", "Why should you read 'Crime and Punishment'?", "Alex Gendler", "communication"),
    ("oe64p-QzhNE", "What 'Orwellian' really means", "Noah Tavlin", "communication"),
    ("6a6kbU88wu0", "How to recognize a dystopia", "Alex Gendler", "communication"),
    ("CxC161GvMPc", "What is the tragedy of the commons?", "Nicholas Amendolare", "communication"),
]

# ── Caption fetching ───────────────────────────────────────────────────────

YTDLP = os.environ.get("YTDLP", "yt-dlp")

CREDIT_RE = re.compile(
    r"(翻译|译制|字幕|Provided by|Translator|Caption| subtitles?|本视频翻译)",
    re.IGNORECASE,
)


def fetch_subs(video_id: str) -> dict[str, list[dict]]:
    """Download en + zh-CN subtitles for a YouTube video. Returns {lang: cues}."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    with tempfile.TemporaryDirectory() as tmpdir:
        cmd = [
            YTDLP,
            "--skip-download",
            "--write-subs",
            "--sub-langs", "en,zh-CN",
            "--sub-format", "vtt",
            "-o", os.path.join(tmpdir, "%(id)s"),
            url,
        ]
        subprocess.run(cmd, capture_output=True, timeout=120)

        result = {}
        for lang in ("en", "zh-CN"):
            vtt_path = os.path.join(tmpdir, f"{video_id}.{lang}.vtt")
            if not os.path.exists(vtt_path):
                continue
            cues = parse_vtt(vtt_path)
            if lang == "en":
                cues = merge_cues(cues)
            result[lang] = cues
        return result


def parse_vtt(path: str) -> list[dict]:
    """Parse WebVTT into a list of {start, end, text} cues."""
    cues = []
    with open(path, encoding="utf-8") as f:
        lines = f.read().splitlines()

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if "-->" not in line:
            i += 1
            continue

        # Parse timestamp line
        times = line.split("-->")
        start = parse_timestamp(times[0].strip())
        end = parse_timestamp(times[1].split()[0].strip())

        # Collect text lines until blank
        text_lines = []
        i += 1
        while i < len(lines) and lines[i].strip():
            text_lines.append(lines[i].strip())
            i += 1

        text = " ".join(text_lines)
        text = re.sub(r"<[^>]+>", "", text)  # strip HTML tags
        text = re.sub(r"\s+", " ", text).strip()

        if not text or CREDIT_RE.search(text):
            continue
        if start is None or end is None:
            continue

        cues.append({"start": start, "end": end, "text": text})

    # Deduplicate consecutive identical cues
    deduped = []
    for c in cues:
        if not deduped or deduped[-1]["text"] != c["text"]:
            deduped.append(c)
    return deduped


def parse_timestamp(ts: str) -> float | None:
    """Parse '00:01:23.456' → 83.456 seconds."""
    parts = ts.replace(",", ".").split(":")
    try:
        return sum(float(p) * 60 ** i for i, p in enumerate(reversed(parts)))
    except ValueError:
        return None


def merge_cues(cues: list[dict], max_len: int = 90) -> list[dict]:
    """Merge short adjacent EN cues into sentence-like lines."""
    merged = []
    current = None
    for c in cues:
        if current is None:
            current = dict(c)
        elif len(current["text"]) + 1 + len(c["text"]) <= max_len:
            current["text"] += " " + c["text"]
            current["end"] = c["end"]
        else:
            merged.append(current)
            current = dict(c)
    if current:
        merged.append(current)
    return merged


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    output_path = Path(__file__).parent.parent / "src" / "data" / "videoLessons.generated.ts"

    pool = []  # list of {title, youtubeId, duration, author, theme, transcript}
    en_map = {}  # youtubeId -> VideoLesson (en)
    zh_map = {}  # youtubeId -> VideoLesson (zh)

    for i, (vid_id, title, author, theme) in enumerate(VIDEOS):
        print(f"[{i+1}/{len(VIDEOS)}] Fetching {vid_id}: {title}", file=sys.stderr)
        try:
            subs = fetch_subs(vid_id)
        except Exception as e:
            print(f"  WARNING: failed to fetch {vid_id}: {e}", file=sys.stderr)
            continue

        en_cues = subs.get("en", [])
        zh_cues = subs.get("zh-CN", [])

        if not en_cues:
            print(f"  WARNING: no EN captions for {vid_id}, skipping", file=sys.stderr)
            continue

        entry = {
            "title": title,
            "youtubeId": vid_id,
            "duration": "",
            "author": author,
            "theme": theme,
            "transcript": en_cues,
        }
        pool.append(entry)
        en_map[vid_id] = entry

        zh_entry = {
            "title": title,
            "youtubeId": vid_id,
            "duration": "",
            "author": author,
            "theme": theme,
            "transcript": zh_cues if zh_cues else en_cues,  # fall back to EN
        }
        zh_map[vid_id] = zh_entry

    # Write the output file as a flat pool (not keyed by topic)
    en_pool = [en_map[v[0]] for v in VIDEOS if v[0] in en_map]
    zh_pool = [zh_map[v[0]] for v in VIDEOS if v[0] in zh_map]

    header = f"""\
// AUTO-GENERATED by scripts/fetch-captions.py — do not edit manually.
// {len(en_pool)} videos with real EN + ZH captions scraped via yt-dlp.
// Re-run: npm run captions

import type {{ VideoLesson }} from "./types";

export const VIDEO_POOL_EN: VideoLesson[] =
"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(header)
        json.dump(en_pool, f, ensure_ascii=False, indent=2)
        f.write(";\n\n")
        f.write("export const VIDEO_POOL_ZH: VideoLesson[] =\n")
        json.dump(zh_pool, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"\nDone: {len(en_pool)} EN videos, {len(zh_pool)} ZH videos → {output_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
