#!/usr/bin/env python3
"""Turn hand-written draft entries into finished ones by attaching evidence.

A draft is an ordinary entry (see content/README.md) without `sources`,
`status` or `usedBy`. For every Spanish form, this script searches the pages
the glossary already cites and attaches the best sightings as sources. An
entry whose main form is found becomes `sourced`; otherwise it is `draft`.

    python3 scripts/attach_sources.py drafts/aws.yaml -o content/terms/aws.yaml \
        --title "Amazon Web Services: platform concepts and services."

Extras a draft may use, all removed from the output:
  seek: [..]   on a form: search these phrases instead of the form's text.
               Use it to pin down the right sense of a common word, or to
               accept a plural. `seek: []` means do not look for this form.
  domain: N    on an entry, with --cert and --outline: files the entry under
               that exam domain.

The pages are the ones cited anywhere in content/terms, plus those listed in
content/extra-sources.yaml. They are downloaded once into the cache folder
(about 750 pages, a few minutes) and reused after that. The report printed at
the end lists entries with no evidence and every single-word match, which
should be read: a common word can match in the wrong sense.
"""
import argparse
import datetime
import glob
import hashlib
import html
import pickle
import re
import subprocess
import sys
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlparse

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_sources  # noqa: E402  (shares the downloader and its cache)

REPO = Path(__file__).resolve().parent.parent
GLOSSARY = "guia_glosario_ciberseguridad_2021.pdf"  # INCIBE's glossary: always the first place to look
ENGINEERS = ("paradigmadigital", "telefonicatech", "adictosaltrabajo", "elladodelmal", "tecnoempleo", "xataka", "genbeta")
LEGAL_FIRST = ["official", "eu", "microsoft", "google", "aws", "oracle", "engineers", "other"]
TECH_FIRST = ["microsoft", "google", "aws", "oracle", "official", "eu", "engineers", "other"]
# Which kind of page to prefer after the glossary, by the prefix of the entry's id.
ORDER = {
    "law": LEGAL_FIRST, "grc": LEGAL_FIRST, "fw": LEGAL_FIRST, "ens": LEGAL_FIRST,
    "azure": ["microsoft", "official", "eu", "engineers", "google", "aws", "oracle", "other"],
    "gcp": ["google", "official", "eu", "engineers", "microsoft", "aws", "oracle", "other"],
    "aws": ["aws", "official", "eu", "engineers", "microsoft", "google", "oracle", "other"],
}
FORM_KEYS = ["text", "article", "kind", "primary", "headline", "plural", "register", "usedBy", "note"]


def clean(text):
    """The same tidying as check_sources.normalise, but keeping capitals for quoting."""
    text = unicodedata.normalize("NFC", text).replace(" ", " ").replace("­", "")
    text = text.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", text).strip()


def text_of(path):
    data = path.read_bytes()
    if data[:5] == b"%PDF-":
        out = subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True)
        return clean(out.stdout.decode("utf-8", "replace"))
    page = data.decode("utf-8", "replace")
    page = re.sub(r"(?is)<(script|style|noscript)\b.*?</\1>", " ", page)
    return clean(html.unescape(re.sub(r"<[^>]+>", " ", page)))


def classify(url):
    host = urlparse(url).netloc.lower()
    if url.endswith(GLOSSARY):
        return "glossary"
    if "eur-lex" in host or ("boe.es" in host and "doue" in url.lower()):
        return "eu"
    if any(h in host for h in ("incibe.es", "aepd.es", "boe.es", "cni.es", ".gob.es")):
        return "official"
    for name, marker in (("microsoft", "microsoft.com"), ("google", "google.com"), ("aws", "amazon.com"), ("oracle", "oracle.com")):
        if marker in host:
            return name
    return "engineers" if any(h in host for h in ENGINEERS) else "other"


def spanish(text):
    words = re.findall(r"\w+", text[:200000].lower())
    if len(words) < 200:
        return False
    common = sum(1 for w in words if w in ("el", "la", "los", "las", "de", "que", "para", "una", "con", "del"))
    return common / len(words) > 0.12


def cited_pages():
    """Every page the glossary cites, with the label it is cited under."""
    labels = {}
    for f in sorted(glob.glob(str(REPO / "content/terms/*.yaml"))):
        for e in yaml.safe_load(open(f, encoding="utf-8")) or []:
            for s in e.get("sources") or []:
                if s.get("checked") and s.get("url"):
                    labels.setdefault(s["url"], s["label"])
    extra = REPO / "content/extra-sources.yaml"
    if extra.exists():
        for s in yaml.safe_load(open(extra, encoding="utf-8")) or []:
            labels.setdefault(s["url"], s["label"])
    return labels


def load_pages(cache, rebuild):
    index = cache / "index.pkl"
    labels = cited_pages()
    if index.exists() and not rebuild:
        saved = pickle.load(open(index, "rb"))
        if saved["urls"] == sorted(labels):
            return saved["pages"]
    print(f"reading {len(labels)} pages (downloading any not yet in {cache}) ...", file=sys.stderr)

    def load(url):
        if check_sources.fetch(url, cache) is None:
            return url, None
        path = cache / hashlib.sha1(url.encode()).hexdigest()
        text = text_of(path)
        if not spanish(text):
            return url, None
        day = datetime.date.fromtimestamp(path.stat().st_mtime)
        return url, {"url": url, "label": labels[url], "text": text, "cls": classify(url), "checked": day}

    with ThreadPoolExecutor(8) as pool:
        results = list(pool.map(load, sorted(labels)))
    pages = [p for _, p in results if p]
    pickle.dump({"urls": sorted(labels), "pages": pages}, open(index, "wb"))
    return pages


def find(phrase, page):
    """How often the phrase appears on the page as whole words, and one sighting to quote."""
    if phrase.lower() not in page["lower"]:
        return None
    acronym = phrase.upper() == phrase and any(c.isalpha() for c in phrase)
    pattern = r"(?<!\w)" + re.escape(phrase).replace(r"\ ", " ") + r"(?!\w)"
    hits = list(re.finditer(pattern, page["text"], 0 if acronym else re.I))
    if not hits:
        return None
    text, a, b = page["text"], hits[0].start(), hits[0].end()
    if len(phrase.split()) < 3:  # give a short phrase a word of context on each side
        before = re.search(r"(?<!\w)([^\W\d_]{2,}) $", text[max(0, a - 25):a])
        after = re.match(r" ([^\W\d_]{2,})(?!\w)", text[b:b + 25])
        a -= len(before.group(0)) if before else 0
        b += len(after.group(0)) if after else 0
    return len(hits), text[a:b]


class Dumper(yaml.SafeDumper):
    def increase_indent(self, flow=False, indentless=False):
        return super().increase_indent(flow, False)


def finish(entry, pages, known, args, report):
    dropped = [r for r in entry.get("related", []) if r not in known or r == entry["id"]]
    if dropped:
        report.append(f"   {entry['id']}: dropped unknown related {dropped}")
    sources, sourced = {}, False
    order = ["glossary"] + ORDER.get(entry["id"].split(".")[0], TECH_FIRST)
    for form in entry["es"]["forms"]:
        found = {}
        for page in pages:
            best = None
            for phrase in form["seek"] if "seek" in form else [form["text"]]:
                hit = find(phrase, page)
                if hit and (not best or hit[0] > best[0]):
                    best = hit
            if best and (page["cls"] not in found or best[0] > found[page["cls"]][0]):
                found[page["cls"]] = (*best, page)
        used = []
        for cls in order:
            if cls not in found or len(used) >= (2 if form.get("primary") else 1):
                continue
            _, quote, page = found[cls]
            if page["url"] not in sources and len(sources) >= 4:
                continue
            source = sources.setdefault(
                page["url"], {"label": page["label"], "url": page["url"], "found": [], "checked": page["checked"]})
            if quote not in source["found"]:
                source["found"].append(quote)
            used.append(cls)
        tags = list(dict.fromkeys("official" if c == "glossary" else c for c in used if c != "other"))
        if tags:
            form["usedBy"] = tags
        seen = "; ".join(f'{c}: "{found[c][1]}"' for c in used)
        if form.get("primary"):
            sourced = bool(used)
            if not used:
                report.append(f"NO  {entry['id']}: {form['text']}")
            elif len(form["text"].split()) == 1:
                report.append(f"ok  {entry['id']}: {form['text']} | {seen}")
        elif used and len(form["text"].split()) == 1:
            report.append(f"alt {entry['id']}: {form['text']} | {seen}")
    entry["es"]["forms"] = [{k: f[k] for k in FORM_KEYS if k in f} for f in entry["es"]["forms"]]
    out = {"id": entry["id"]}
    if "headword" in entry:
        out["headword"] = entry["headword"]
    out.update(en=entry["en"], es=entry["es"], topics=entry["topics"], technology=entry.get("technology", []))
    curriculum = list(entry.get("curriculum", []))
    if "domain" in entry:
        if not (args.cert and args.outline):
            sys.exit(f"{entry['id']} has a domain, so --cert and --outline are needed")
        curriculum.append({"cert": args.cert, "outline": args.outline, "domain": entry["domain"]})
    if curriculum:
        out["curriculum"] = curriculum
    if entry.get("frameworks"):
        out["frameworks"] = entry["frameworks"]
    out["related"] = [r for r in entry.get("related", []) if r not in dropped]
    out["sources"] = list(sources.values())
    out["status"] = "sourced" if sourced else "draft"
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("drafts", nargs="+", help="draft YAML files")
    parser.add_argument("-o", "--output", required=True, help="the file under content/terms to write")
    parser.add_argument("--title", help="first line of the comment at the top of a new file")
    parser.add_argument("--append", action="store_true", help="add to an existing file instead of replacing it")
    parser.add_argument("--cert", help="certification id for entries that carry a domain")
    parser.add_argument("--outline", help='that certification\'s outline, such as "2027-04"')
    parser.add_argument("--cache", default=".cache/sources", help="folder for downloaded pages")
    parser.add_argument("--rebuild", action="store_true", help="re-read every page into the index")
    args = parser.parse_args()

    output = Path(args.output)
    cache = Path(args.cache)
    cache.mkdir(parents=True, exist_ok=True)
    if output.exists() and not args.append and output.resolve().parent == (REPO / "content/terms").resolve():
        print(f"replacing {output}", file=sys.stderr)

    entries = [e for f in args.drafts for e in yaml.safe_load(open(f, encoding="utf-8"))]
    ids = [e["id"] for e in entries]
    known = set()
    for f in glob.glob(str(REPO / "content/terms/*.yaml")):
        if Path(f).resolve() == output.resolve() and not args.append:
            continue
        known |= {e["id"] for e in yaml.safe_load(open(f, encoding="utf-8"))}
    clash = sorted({i for i in ids if ids.count(i) > 1 or i in known})
    if clash:
        sys.exit(f"these ids already exist: {clash}")
    known |= set(ids)

    pages = load_pages(cache, args.rebuild)
    for page in pages:
        page["lower"] = page["text"].lower()

    report = []
    done = [finish(e, pages, known, args, report) for e in entries]
    body = "\n".join(
        yaml.dump([e], Dumper=Dumper, allow_unicode=True, sort_keys=False, width=88, default_flow_style=False)
        for e in done)
    if args.append and output.exists():
        output.write_text(output.read_text(encoding="utf-8").rstrip("\n") + "\n\n" + body, encoding="utf-8")
    else:
        header = f"# {args.title or output.stem}\n"
        header += (
            "# Format is described in content/README.md. These entries were written from\n"
            "# working knowledge of usage in Spain; each `found` text was then located in a\n"
            "# page the glossary already cites and confirmed with scripts/check_sources.py.\n"
            "# Forms with no usedBy have not been seen in a source.\n\n")
        output.write_text(header + body, encoding="utf-8")

    print("\n".join(report))
    n = sum(1 for e in done if e["status"] == "sourced")
    print(f"{len(done)} entries: {n} sourced, {len(done) - n} draft; {len(pages)} Spanish pages searched")


if __name__ == "__main__":
    main()
