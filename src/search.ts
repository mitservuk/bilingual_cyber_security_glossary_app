import type { Term } from './data';

/** Lower-cases and strips accents, so "computacion" finds "computación". */
export function normalise(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

interface Field {
  text: string;
  weight: number;
}

function fields(t: Term): Field[] {
  const out: Field[] = [{ text: t.en.term, weight: 1 }];
  if (t.en.acronym) out.push({ text: t.en.acronym, weight: 1 });
  if (t.en.expansion) out.push({ text: t.en.expansion, weight: 0.9 });
  if (t.es.acronym) out.push({ text: t.es.acronym, weight: 1 });
  for (const f of t.es.forms) out.push({ text: f.text, weight: f.primary ? 1 : 0.9 });
  return out;
}

function score(field: string, q: string) {
  if (field === q) return 100;
  if (field.startsWith(q)) return 80;
  if (field.split(/[\s\-/]+/).some((w) => w.startsWith(q))) return 60;
  if (q.length >= 3 && field.includes(q)) return 40;
  return 0;
}

export function createSearch(terms: Term[]) {
  const index = terms.map((term) => ({
    term,
    fields: fields(term).map((f) => ({ text: normalise(f.text), weight: f.weight })),
  }));

  return function search(query: string): Term[] {
    const q = normalise(query);
    if (!q) return [];
    return index
      .map(({ term, fields }) => ({
        term,
        score: Math.max(...fields.map((f) => score(f.text, q) * f.weight)),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.term.en.term.localeCompare(b.term.en.term))
      .map((r) => r.term);
  };
}
