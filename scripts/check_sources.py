#!/usr/bin/env python3
"""Re-read every checked source and confirm the cited text is really on the page.

    python3 scripts/check_sources.py content/terms/*.yaml

A source with `found` and `checked` claims that the page at `url` contains each
string in `found`. This fetches the page (or PDF), extracts its text, and fails
if any string is missing, so a claim can never rest on a page nobody read. It
also runs the same structural checks as the build, so it can be used on a
draft file before it is added to content/terms.

It needs network access, curl, and pdftotext for PDFs, so it is run by hand
when entries are written or re-reviewed, not as part of the build. Fetched
pages are kept in a cache folder so a second run is quick.
"""
import argparse
import hashlib
import html
import re
import subprocess
import sys
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import yaml

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0 Safari/537.36")
VERDICTS = {"translated", "english-kept", "both"}
STATUSES = {"draft", "sourced", "verified"}
KINDS = {"noun", "verb", "adjective"}
REGISTERS = {"formal", "informal"}
USED_BY = {"official", "eu", "engineers", "google", "microsoft", "oracle", "aws"}


def normalise(text):
    """Case, spacing and typographic differences should not fail a match."""
    text = unicodedata.normalize("NFC", text).replace(" ", " ").replace("­", "")
    text = text.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", text).strip().lower()


def fetch(url, cache):
    # Only a successful download is kept. Some sites answer "not found" now and
    # then for pages that exist, so a failure is retried rather than cached.
    path = cache / hashlib.sha1(url.encode()).hexdigest()
    for attempt in range(4):
        if path.exists() and path.stat().st_size > 0:
            break
        if attempt:
            time.sleep(3)
        result = subprocess.run(
            ["curl", "-sSL", "-m", "75", "--compressed", "-A", UA,
             "-H", "Accept-Language: es-ES,es;q=0.9", "-o", str(path), "-w", "%{http_code}", url],
            capture_output=True, text=True)
        if result.stdout.strip() != "200":
            path.unlink(missing_ok=True)
    if not path.exists():
        return None
    data = path.read_bytes()
    if data[:5] == b"%PDF-":
        out = subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True)
        return normalise(out.stdout.decode("utf-8", "replace"))
    page = data.decode("utf-8", "replace")
    page = re.sub(r"(?is)<(script|style|noscript)\b.*?</\1>", " ", page)
    return normalise(html.unescape(re.sub(r"<[^>]+>", " ", page)))


def structure_problems(entry):
    problems = []
    es = entry.get("es") or {}
    en = entry.get("en") or {}
    if not re.fullmatch(r"[a-z0-9]+\.[a-z0-9-]+", str(entry.get("id", ""))):
        problems.append('id must look like "prefix.name"')
    if not en.get("term") or not en.get("definition"):
        problems.append("en.term and en.definition are required")
    if es.get("verdict") not in VERDICTS:
        problems.append("es.verdict is missing or invalid")
    if not es.get("definition"):
        problems.append("es.definition is required")
    examples = es.get("examples") or []
    if not examples or any(not e.get("es") or not e.get("en") for e in examples):
        problems.append("at least one example with es and en is required")
    forms = es.get("forms") or []
    if sum(1 for f in forms if f.get("primary")) != 1:
        problems.append("exactly one form must be primary")
    for f in forms:
        if not f.get("text") or f.get("kind") not in KINDS:
            problems.append(f"form {f.get('text')!r}: text and a valid kind are required")
        if f.get("register") and f["register"] not in REGISTERS:
            problems.append(f"form {f.get('text')!r}: invalid register")
        for u in f.get("usedBy") or []:
            if u not in USED_BY:
                problems.append(f"form {f.get('text')!r}: unknown usedBy {u!r}")
    if not entry.get("topics"):
        problems.append("at least one topic is required")
    if entry.get("status") not in STATUSES:
        problems.append("status is missing or invalid")
    for s in entry.get("sources") or []:
        if not s.get("label") or not s.get("url"):
            problems.append("each source needs a label and a url")
        if bool(s.get("found")) != bool(s.get("checked")):
            problems.append(f"source {s.get('label')!r}: found and checked go together")
    if entry.get("status") != "draft" and not any(s.get("checked") for s in entry.get("sources") or []):
        problems.append("a sourced entry needs at least one checked source")
    return problems


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("files", nargs="+")
    parser.add_argument("--cache", default=".cache/sources", help="folder for fetched pages")
    args = parser.parse_args()
    cache = Path(args.cache)
    cache.mkdir(parents=True, exist_ok=True)

    entries = []
    for name in args.files:
        entries += yaml.safe_load(Path(name).read_text(encoding="utf-8")) or []

    failures = []
    seen = set()
    for entry in entries:
        if entry.get("id") in seen:
            failures.append(f"{entry.get('id')}: duplicate id")
        seen.add(entry.get("id"))
        failures += [f"{entry.get('id')}: {p}" for p in structure_problems(entry)]

    urls = sorted({s["url"] for e in entries for s in e.get("sources") or [] if s.get("found")})
    with ThreadPoolExecutor(6) as pool:
        pages = dict(zip(urls, pool.map(lambda u: fetch(u, cache), urls)))

    claims = 0
    for entry in entries:
        for source in entry.get("sources") or []:
            for text in source.get("found") or []:
                claims += 1
                page = pages.get(source["url"])
                if page is None:
                    failures.append(f"{entry['id']}: could not fetch {source['url']}")
                    break
                if normalise(str(text)) not in page:
                    failures.append(f"{entry['id']}: {text!r} is not on {source['url']}")

    print(f"{len(entries)} entries, {claims} cited texts on {len(urls)} pages")
    if failures:
        print(f"{len(failures)} problem(s):")
        for f in failures:
            print("  " + f)
        return 1
    print("every cited text was found")
    return 0


if __name__ == "__main__":
    sys.exit(main())
