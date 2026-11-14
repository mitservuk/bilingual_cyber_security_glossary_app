# Content format

Terms live in YAML files under `content/terms/`. One entry is one English
term with its Spanish usage in Spain (es-ES). The app is built from these
files; nothing about a term is stored anywhere else.

## An entry

```yaml
- id: sec.firewall              # namespaced, never reused or renamed
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
        note: ...               # optional, in English
    say: ...                    # optional: how an acronym or loanword is spoken
    definition: ...             # one line in Spanish
    examples:
      - es: ...
        en: ...
    watchOut: ...               # optional: false friends, gender traps, variants
  topics: [network]             # what it is (the 20 security domains)
  technology: [networking]      # where it lives (aws, azure, gcp, kubernetes, ...)
  curriculum:                   # which exam outlines cover it
    - { cert: CCSP, outline: "2026-08", domain: 3 }
  related: [sec.log]            # ids of other entries
  sources:
    - label: ...
      url: ...
      lead: ...                 # optional: text a search attributed to the URL
  status: draft                 # draft | sourced | verified
```

## Verdict

- `translated`: Spanish professionals use a Spanish term.
- `english-kept`: they use the English word.
- `both`: both are in real use; the forms say which register each belongs to.

## Status

- `draft`: written from general knowledge. Sources, if listed, have not been
  opened and read.
- `sourced`: every form and note has been checked against a listed source
  that was actually read.
- `verified`: additionally confirmed by a native-speaking professional.

A `lead` is text that a web search attributed to a URL. It is a pointer for
checking, not evidence. An entry moves to `sourced` only when the page itself
has been read.

## ID prefixes

`sec.` security concepts · `cloud.` cloud concepts · `law.` legal terms ·
`fw.` frameworks, standards and regulations. Later: `aws.`, `azure.`, `gcp.`,
`k8s.`, `tool.`, `attack.`.
