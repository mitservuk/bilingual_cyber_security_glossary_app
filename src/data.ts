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
  /** "es" for a Spanish concept with no real English name: the Spanish form is the title. */
  headword?: 'es';
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
  curriculum?: { cert: string; outline: string; domain: number }[];
  frameworks?: string[];
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
  fullName?: string;
  issuer: string;
  outline?: string;
  outlineLabel?: string;
  /** Empty until the exam's structure has been loaded; the app then shows "coming soon". */
  domains: { n: number; name: string; weight?: number | string }[];
}

export type Region = 'es' | 'eu' | 'uk' | 'us' | 'intl';

export const REGIONS: { id: Region; label: string }[] = [
  { id: 'es', label: 'Spain' },
  { id: 'eu', label: 'EU' },
  { id: 'uk', label: 'UK' },
  { id: 'us', label: 'US' },
  { id: 'intl', label: 'International' },
];

export interface Framework {
  id: string;
  name: string;
  fullName?: string;
  summary: string;
  region: Region;
  /** The glossary term that describes the framework itself. */
  entry?: string;
}

interface Content {
  topics: Named[];
  technology: Named[];
  certifications: Certification[];
  frameworks: Framework[];
  terms: Term[];
}

const content = raw as unknown as Content;

export const topics = content.topics;
export const technology = content.technology;

const byName = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' });

export const formLabel = (f: Form) => (f.article ? `${f.article} ${f.text}` : f.text);

export const primaryForm = (t: Term) => t.es.forms.find((f) => f.primary) ?? t.es.forms[0];

/** What a term is listed and sorted under: English, or Spanish for a Spanish-first entry. */
export const titleOf = (t: Term) => (t.headword === 'es' ? primaryForm(t).text : t.en.term);

export const alphabetical = (list: Term[]) => [...list].sort((a, b) => byName(titleOf(a), titleOf(b)));

export const terms = alphabetical(content.terms);

/** Alphabetical. Domains inside a certification keep their numbered order. */
export const certifications = [...content.certifications].sort((a, b) => byName(a.name, b.name));
export const frameworks = [...content.frameworks].sort((a, b) => byName(a.name, b.name));

const byId = new Map(terms.map((t) => [t.id, t]));
export const getTerm = (id: string) => byId.get(id);

/** The Spanish shown beside a term in lists: the primary form, plus any other headline forms. */
export function spanishSummary(t: Term) {
  return t.es.forms
    .filter((f) => f.primary || f.headline)
    .map(formLabel)
    .join(' · ');
}

/** Where a Spanish form was seen in use, from sources that were read. */
export const SEEN_IN_LABEL: Record<string, string> = {
  official: 'Spanish government',
  eu: 'EU law',
  engineers: 'Blogs and job ads',
  google: 'Google docs',
  microsoft: 'Microsoft docs',
  oracle: 'Oracle docs',
  aws: 'AWS docs',
};

export type Axis = 'topic' | 'tech' | 'cert' | 'framework';

export function termsFor(axis: Axis, value: string, domain?: number): Term[] {
  if (axis === 'topic') return terms.filter((t) => t.topics.includes(value));
  if (axis === 'tech') return terms.filter((t) => t.technology.includes(value));
  if (axis === 'framework') return terms.filter((t) => t.frameworks?.includes(value));
  return terms.filter((t) =>
    t.curriculum?.some((c) => c.cert === value && (domain === undefined || c.domain === domain)),
  );
}

/** Categories that have at least one term, with their counts, in alphabetical order. */
export function populated(list: Named[], axis: 'topic' | 'tech') {
  return list
    .map((item) => ({ item, count: termsFor(axis, item.id).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => byName(a.item.en, b.item.en));
}

/** The same term for everyone on a given day, chosen without a server. */
export function wordOfTheDay(now = new Date()): Term {
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
  return terms[day % terms.length];
}
