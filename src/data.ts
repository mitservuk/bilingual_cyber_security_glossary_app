import raw from './generated/content.json';

export type Lang = 'en' | 'es';
export type Verdict = 'translated' | 'english-kept' | 'both';
export type Status = 'draft' | 'sourced' | 'verified';

export interface Form {
  text: string;
  article?: string;
  kind: 'noun' | 'verb' | 'adjective';
  primary?: boolean;
  headline?: boolean;
  plural?: string;
  register?: 'formal' | 'informal';
  note?: string;
  usedBy?: string[];
}

export interface Source {
  label: string;
  url: string;
  found?: string[];
  checked?: string;
  lead?: string;
}

export interface Term {
  id: string;
  en: { term: string; acronym?: string; expansion?: string; definition: string };
  es: {
    verdict: Verdict;
    acronym?: string;
    forms: Form[];
    say?: string;
    definition: string;
    examples: { es: string; en: string }[];
    watchOut?: string;
  };
  topics: string[];
  technology: string[];
  curriculum: { cert: string; outline: string; domain: number }[];
  related: string[];
  sources: Source[];
  status: Status;
}

export interface Named {
  id: string;
  en: string;
  es: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  outline: string;
  outlineLabel: string;
  domains: { n: number; name: string; weight: number }[];
}

interface Content {
  topics: Named[];
  technology: Named[];
  certifications: Certification[];
  terms: Term[];
}

const content = raw as unknown as Content;

export const terms = content.terms;
export const topics = content.topics;
export const technology = content.technology;
export const certifications = content.certifications;

const byId = new Map(terms.map((t) => [t.id, t]));
export const getTerm = (id: string) => byId.get(id);

export const formLabel = (f: Form) => (f.article ? `${f.article} ${f.text}` : f.text);

export const primaryForm = (t: Term) => t.es.forms.find((f) => f.primary) ?? t.es.forms[0];

/** The Spanish shown beside a term in lists: the primary form, plus any other headline forms. */
export function spanishSummary(t: Term) {
  return t.es.forms
    .filter((f) => f.primary || f.headline)
    .map(formLabel)
    .join(' · ');
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  translated: 'Translated',
  'english-kept': 'English kept',
  both: 'Both in use',
};

export const USED_BY_LABEL: Record<string, string> = {
  official: 'Official guidance',
  engineers: 'Engineers',
  google: 'Google',
  microsoft: 'Microsoft',
  oracle: 'Oracle',
  aws: 'AWS',
};

export type Axis = 'topic' | 'tech' | 'cert';

export function termsFor(axis: Axis, value: string, domain?: number): Term[] {
  if (axis === 'topic') return terms.filter((t) => t.topics.includes(value));
  if (axis === 'tech') return terms.filter((t) => t.technology.includes(value));
  return terms.filter((t) =>
    t.curriculum.some((c) => c.cert === value && (domain === undefined || c.domain === domain)),
  );
}

/** Categories that have at least one term, with their counts, largest first. */
export function populated(list: Named[], axis: 'topic' | 'tech') {
  return list
    .map((item) => ({ item, count: termsFor(axis, item.id).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count || a.item.en.localeCompare(b.item.en));
}

/** The same term for everyone on a given day, chosen without a server. */
export function wordOfTheDay(now = new Date()): Term {
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
  return terms[day % terms.length];
}
