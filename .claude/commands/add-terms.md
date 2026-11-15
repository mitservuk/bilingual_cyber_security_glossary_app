---
description: Add a batch of terms to the glossary (a certification, framework, technology or topic)
argument-hint: <what to add, e.g. "AWS", "NIS2 vocabulary", "KCSA">
---

Add terms for: $ARGUMENTS

Follow `content/ADDING-TERMS.md` exactly. In short:

1. Work out the term list. For an exam, fetch the issuer's current outline and
   use its domains. Leave out anything already in `content/terms/` (search by
   English and Spanish); an existing term that belongs to the new category is
   tagged, not duplicated.
2. Update `content/taxonomy.yaml` if the category needs domains, a new
   technology or a framework `entry`.
3. Write the drafts yourself in `drafts/<name>.yaml`, from knowledge of how the
   term is used in Spain. Do not start research agents.
4. Run `scripts/attach_sources.py`, read its report, fix wrong-sense matches
   with `seek`, and run it again.
5. Run `scripts/check_sources.py`, `npm test` and `npm run build`, open the
   built app at phone size, then commit, push and open a pull request.

Report how many terms were added, how many are sourced and how many are
drafts, and anything that was not checked.
