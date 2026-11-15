# Content format

Terms live in YAML files under `content/terms/`. One entry is one English
term with its Spanish usage in Spain (es-ES). The app is built from these
files; nothing about a term is stored anywhere else.

## An entry

```yaml
- id: sec.firewall              # namespaced, never reused or renamed
  headword: es                  # optional: a Spanish concept, titled in Spanish
  en:
    term: firewall
    acronym: ...                # optional, e.g. DLP for data loss prevention
    expansion: ...              # optional, when the term itself is an acronym
    definition: ...             # one or two sentences, originally written
  es:
    verdict: both               # translated | english-kept | both
    acronym: ...                # optional: the acronym used in Spain
    forms:                      # what people actually say and write
      - text: cortafuegos
        article: el             # el | la | los | las; omitted for verbs/adjectives
        kind: noun              # noun | verb | adjective
        primary: true           # exactly one form per entry
        plural: los cortafuegos # optional, when not obvious
        register: formal        # optional: formal | informal; omitted = neutral
        usedBy: [official, google]  # optional: who was seen using this form
        headline: true          # optional: also show this form beside the term in lists
        note: ...               # optional, in English
    say: ...                    # optional: how an acronym or loanword is spoken
    definition: ...             # one line in Spanish
    examples:
      - es: ...
        en: ...
    watchOut: ...               # optional: false friends, gender traps, variants
  topics: [network]             # what it is (the 20 security domains)
  technology: [networking]      # where it lives (aws, azure, gcp, kubernetes, ...)
  curriculum:                   # optional: which exam outlines cover it
    - { cert: CCSP, outline: "2026-08", domain: 3 }
  frameworks: [ENS]             # optional: frameworks whose vocabulary it belongs to
  related: [sec.log]            # ids of other entries
  sources:
    - label: ...
      url: ...
      found: ["..."]            # text confirmed present in the fetched page
      checked: 2026-11-14       # the date it was fetched
    - label: ...
      url: ...
      lead: ...                 # text a search attributed to a page not yet read
  status: draft                 # draft | sourced | verified
```

## Verdict

- `translated`: Spanish professionals use a Spanish term.
- `english-kept`: they use the English word.
- `both`: both are in real use; the forms say which register each belongs to.

## Status

- `draft`: the main Spanish form has not yet been found in a checked source.
- `sourced`: the main Spanish form was found in at least one checked source.
  Alternative forms and notes may rest on working knowledge of usage in Spain;
  a form carries `usedBy` only where it was actually seen.
- `verified`: additionally confirmed by a native-speaking professional.

Sources come in two strengths. A source with `found` and `checked` was
fetched on that date and contains that text. A source with only a `lead`
carries text that a web search attributed to the URL; the page itself has not
been read, so it is a pointer for checking, not evidence.

## Where to look, in order

1. INCIBE's glossary of cyber security terms. If the word is there, start
   from it.
2. For a technical word, the Spanish documentation of Microsoft Azure and
   Google Cloud, then AWS and Oracle. For a legal, risk or framework word, the
   law or the framework itself: the BOE, the Spanish text of EU law, the ENS.
3. Spain-based engineering blogs and job adverts, mainly to see whether the
   English word is kept in everyday use.

One confirmed sighting of the main form is enough. Two is plenty.

## Certifications and frameworks

`content/taxonomy.yaml` lists them. A certification with no `domains` yet, or
a framework with no terms, shows in the app as "coming soon".

A term joins a framework through `frameworks`, and only when it is part of that
framework's own vocabulary. A general term such as encryption does not belong
to every framework that mentions it.

`headword: es` is for Spanish concepts that have no real English name, such as
the Esquema Nacional de Seguridad. The Spanish form becomes the title, it is
listed alphabetically under it, and `en.term` is shown as the English gloss.

## Who uses a form

`usedBy` records where a form was seen, and only from sources that were read:
`official` (Spanish public bodies and Spanish law, such as INCIBE, the AEPD and
the BOE), `eu` (the official Spanish text of EU law), `engineers` (Spain-based
engineering blogs and job adverts), and the vendors `google`, `microsoft`,
`oracle` and `aws` (their documentation for Spain).

Run `python3 scripts/check_sources.py content/terms/*.yaml` to re-read every
checked source and confirm each `found` text is still on its page.

## ID prefixes

`sec.` security concepts · `cloud.` cloud concepts · `grc.` governance, risk
and business terms · `ai.` artificial intelligence · `tech.` other technology ·
`law.` legal terms · `fw.` frameworks, standards and regulations · `azure.`
Microsoft Azure · `gcp.` Google Cloud. Later: `aws.`, `k8s.`, `tool.`,
`attack.`.
