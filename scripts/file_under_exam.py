#!/usr/bin/env python3
"""File existing terms under an exam's domains, by rule from each term's first topic.

    python3 scripts/file_under_exam.py --cert AZ-500 --outline 2026-01 --vendor azure \
        --map iam=1,authn=1,authz=1,network=2,data=3,detection=4

A term is filed if its first topic is in the map and it is relevant to the
exam: with --vendor, that means its id starts with the vendor's prefix, or its
technology names the vendor or one of the general cloud technologies. Without
--vendor every term with a mapped topic is filed. Terms already filed under
the exam are left alone. This is a first pass by rule, not a judgement term
by term; say so when you ship it.
"""
import argparse
import glob
import re
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parent.parent
GENERAL = {"cloud-general", "networking", "identity-platforms", "serverless", "containers-oci", "kubernetes", "iac", "ci-cd"}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--cert", required=True)
    parser.add_argument("--outline", required=True)
    parser.add_argument("--map", required=True, help="topic=domain pairs, comma separated")
    parser.add_argument("--vendor", help="id prefix and technology id of the platform, such as aws")
    args = parser.parse_args()
    domain_of = {k: int(v) for k, v in (pair.split("=") for pair in args.map.split(","))}

    counts = {}
    for f in sorted(glob.glob(str(REPO / "content/terms/*.yaml"))):
        text = open(f, encoding="utf-8").read()
        for e in yaml.safe_load(text):
            if any(c["cert"] == args.cert for c in e.get("curriculum") or []):
                continue
            domain = domain_of.get(e["topics"][0])
            tech = set(e.get("technology") or [])
            prefix = e["id"].split(".")[0]
            relevant = not args.vendor or prefix == args.vendor or args.vendor in tech or (
                prefix in ("sec", "cloud", "tech") and tech & GENERAL) or prefix == "cloud"
            if domain is None or not relevant:
                continue
            block = re.compile(r"^- id: " + re.escape(e["id"]) + r"\n(?:(?!^- id: ).*\n?)*", re.M).search(text)
            body = block.group(0)
            line = f'    - {{ cert: {args.cert}, outline: "{args.outline}", domain: {domain} }}\n'
            if re.search(r"^  curriculum:\n", body, re.M):
                at = re.search(r"^  curriculum:\n(?:    .*\n|      .*\n)*", body, re.M).end()
                new = body[:at] + line + body[at:]
            else:  # no curriculum yet: put it before frameworks or related
                at = re.search(r"^  (frameworks|related):", body, re.M).start()
                new = body[:at] + "  curriculum:\n" + line + body[at:]
            text = text[:block.start()] + new + text[block.end():]
            counts[domain] = counts.get(domain, 0) + 1
        open(f, "w", encoding="utf-8").write(text)
    print(args.cert, dict(sorted(counts.items())), "total", sum(counts.values()))


if __name__ == "__main__":
    main()
