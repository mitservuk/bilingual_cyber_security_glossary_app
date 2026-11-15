# Adding terms

The repeatable way to add a batch of terms: a certification, a framework, a
technology or a topic. In Claude Code, `/add-terms AWS` runs it.

It is built to be cheap. The Spanish is written from knowledge of how
professionals in Spain speak, and a script then finds evidence in pages the
glossary already cites. Nothing is researched term by term.

## 1. Decide the list

- **An exam:** fetch the issuer's current outline and note its date, domains
  and weights. Check whether a newer outline has been announced.
- **A framework or law:** take the terms it defines or relies on, from its own
  text, in Spanish where an official Spanish text exists.
- **A technology:** the platform's building blocks and its security-relevant
  services.

Leave out what is already there. Search `content/terms/` for the English and
the Spanish. A term that exists and also belongs to the new category is tagged
(step 2), not written again. Expect heavy overlap between certifications.

## 2. Update the taxonomy

`content/taxonomy.yaml`:

- An exam gets `outline`, `outlineLabel` and its `domains`.
- A framework that now has an entry of its own gets `entry: <id>`.
- A new technology or topic is added to its list.

To file existing terms under a new exam, add a second line to their
`curriculum`. Doing this by rule from each term's first topic is acceptable;
say so in the pull request.

## 3. Write the drafts

Write `drafts/<name>.yaml` (the folder is not committed). A draft is an entry
as described in `README.md`, without `sources`, `status` or `usedBy`.

- Ids take the prefix for their kind: `sec.`, `cloud.`, `grc.`, `law.`, `fw.`,
  `tech.`, `ai.`, `azure.`, `gcp.`, `ens.`. Add a prefix for a new platform.
- A Spanish concept with no real English name gets `headword: es`.
- Give the form people in Spain actually use as `primary`, then the
  alternatives: the vendor's translation, the English word if engineers keep
  it, the formal expansion of an acronym.
- Use `note` for who says which, `say` for how an acronym or loanword is
  pronounced, and `watchOut` for false friends, gender traps and Latin
  American variants.
- One short example sentence, in both languages.
- For an exam, put `domain: N` on each entry.

## 4. Attach the evidence

```bash
python3 scripts/attach_sources.py drafts/aws.yaml -o content/terms/aws.yaml \
  --title "Amazon Web Services: platform concepts and services."
```

Add `--cert CISSP --outline 2027-04` when the drafts carry `domain`, and
`--append` to add to a file that already exists.

The first run in a fresh checkout downloads about 750 pages into
`.cache/sources`, which takes a few minutes and needs the source sites to be
reachable. Later runs take seconds.

Then read the report:

- **`NO`** lines are entries whose main form was found nowhere. They stay
  `draft`. That is acceptable; do not go looking for sources one by one.
- **`ok`** and **`alt`** lines are single-word matches. Read each quoted
  sighting. If the word is there in another sense ("mensajería instantánea"
  for a snapshot), add `seek` to that form in the draft with phrases that pin
  the sense down, or `seek: []` to stop looking, and run the script again.

Where the script looks, in order: INCIBE's glossary, then vendor documentation
for technical ids or legislation for legal ones, then blogs and job adverts.
One sighting of the main form is enough; it cites at most two.

To bring in a page that is not yet cited anywhere, list it in
`content/extra-sources.yaml` as `- { label: ..., url: ... }`.

## 5. Check and ship

```bash
python3 scripts/check_sources.py content/terms/*.yaml
npm test
npm run build
```

Open the built app at phone size and look at a few of the new entries and at
the category they belong to. Then commit, push and open a pull request that
says how many terms were added, how many are sourced, how many are drafts, and
what was not checked.
