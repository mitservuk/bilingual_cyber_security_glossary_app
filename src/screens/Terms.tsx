import { useEffect, useMemo, useRef, useState } from 'react';
import { Empty, SearchField, TermList } from '../components/Common';
import { ClearIcon, FilterIcon } from '../components/Icons';
import { type Axis, type Term, certifications, frameworks, populated, technology, terms, termsFor, topics } from '../data';
import { createSearch } from '../search';
import { StudyButton } from './Study';

const search = createSearch(terms);

interface Option {
  id: string;
  label: string;
}

/** The four categories a term can be filtered by. Only values that have terms are offered. */
const GROUPS: { id: Axis; label: string; options: Option[] }[] = [
  {
    id: 'cert',
    label: 'Certification',
    options: certifications.filter((c) => termsFor('cert', c.id).length).map((c) => ({ id: c.id, label: c.name })),
  },
  {
    id: 'framework',
    label: 'Framework',
    options: frameworks.filter((f) => termsFor('framework', f.id).length).map((f) => ({ id: f.id, label: f.name })),
  },
  {
    id: 'tech',
    label: 'Technology',
    options: populated(technology, 'tech').map(({ item }) => ({ id: item.id, label: item.en })),
  },
  {
    id: 'topic',
    label: 'Topic',
    options: populated(topics, 'topic').map(({ item }) => ({ id: item.id, label: item.en })),
  },
];

/** Which terms each value covers, worked out once. */
const MEMBERS = new Map(
  GROUPS.flatMap((g) => g.options.map((o) => [`${g.id}/${o.id}`, new Set(termsFor(g.id, o.id).map((t) => t.id))])),
);

type Filters = Record<Axis, string[]>;

const NONE: Filters = { cert: [], framework: [], tech: [], topic: [] };

/**
 * Ticks in different categories narrow the list (CCSP and Cryptography);
 * ticks in the same category widen it (ENS or GDPR).
 */
const matches = (term: Term, filters: Filters) =>
  GROUPS.every((g) => {
    const chosen = filters[g.id];
    return chosen.length === 0 || chosen.some((id) => MEMBERS.get(`${g.id}/${id}`)?.has(term.id));
  });

const count = (n: number) => `${n} ${n === 1 ? 'term' : 'terms'}`;

// Remembered while the app is open, so coming back from an entry returns to
// the same search and the same filters.
let lastQuery = '';
let lastFilters: Filters = NONE;

/** Every term from A to Z, narrowed by typing or by the filter. */
export function Terms() {
  const [query, setQuery] = useState(lastQuery);
  const [filters, setFilters] = useState(lastFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const filterButton = useRef<HTMLButtonElement>(null);
  lastQuery = query;
  lastFilters = filters;

  const searching = query.trim().length > 0;
  const results = useMemo(
    () => (searching ? search(query) : terms).filter((t) => matches(t, filters)),
    [query, searching, filters],
  );

  const active = GROUPS.flatMap((g) =>
    g.options.filter((o) => filters[g.id].includes(o.id)).map((o) => ({ group: g.id, ...o })),
  );
  const toggle = (group: Axis, id: string) =>
    setFilters((f) => ({ ...f, [group]: f[group].includes(id) ? f[group].filter((x) => x !== id) : [...f[group], id] }));
  const closeSheet = () => {
    setSheetOpen(false);
    filterButton.current?.focus();
  };

  return (
    <main className="screen">
      <header className="title-block">
        <h1>Terms</h1>
      </header>

      <div className="search-row">
        <SearchField
          id="terms-q"
          label="Search all terms in English or Spanish"
          placeholder={`Search all ${terms.length} terms`}
          value={query}
          onChange={setQuery}
        />
        <button
          ref={filterButton}
          type="button"
          className={active.length ? 'filter-button on' : 'filter-button'}
          aria-label={active.length ? `Filter, ${active.length} chosen` : 'Filter'}
          aria-haspopup="dialog"
          onClick={() => setSheetOpen(true)}
        >
          <FilterIcon size={20} />
          {active.length > 0 && <span className="badge-count">{active.length}</span>}
        </button>
      </div>

      {active.length > 0 && (
        <div className="active-filters">
          {active.map((a) => (
            <button key={`${a.group}/${a.id}`} type="button" aria-label={`Remove filter ${a.label}`} onClick={() => toggle(a.group, a.id)}>
              {a.label}
              <ClearIcon size={11} />
            </button>
          ))}
          <span className="result-count" aria-live="polite">
            {count(results.length)}
          </span>
        </div>
      )}

      <StudyButton
        title={[...active.map((a) => a.label), ...(searching ? [`“${query.trim()}”`] : [])].join(' · ') || 'All terms'}
        terms={results}
      />

      {results.length ? (
        <TermList terms={results} />
      ) : (
        <Empty title="No matches">
          {searching ? `Nothing matches “${query.trim()}”` : 'Nothing matches'}
          {active.length ? ' with these filters. Try removing one.' : ' yet. Try the English or the Spanish word.'}
        </Empty>
      )}

      {sheetOpen && (
        <FilterSheet
          filters={filters}
          shown={results.length}
          onToggle={toggle}
          onClear={() => setFilters(NONE)}
          onClose={closeSheet}
        />
      )}
    </main>
  );
}

/** A category with more values than LONG shows the first SHORT, then "more". */
const LONG = 12;
const SHORT = 8;

function FilterSheet({
  filters,
  shown,
  onToggle,
  onClear,
  onClose,
}: {
  filters: Filters;
  shown: number;
  onToggle: (group: Axis, id: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<Axis[]>([]);
  const sheet = useRef<HTMLDivElement>(null);
  const anyChosen = GROUPS.some((g) => filters[g.id].length > 0);

  const close = useRef(onClose);
  close.current = onClose;

  // The page behind stays put while the sheet is open, and Escape closes it.
  useEffect(() => {
    sheet.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        ref={sheet}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grabber" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id="filter-title">Filter</h2>
          {anyChosen && (
            <button type="button" className="link" onClick={onClear}>
              Clear
            </button>
          )}
        </div>
        <div className="sheet-body">
          {GROUPS.map((g) => {
            const all = expanded.includes(g.id) || g.options.length <= LONG;
            // A ticked value stays visible even when the rest of its category is folded away.
            const options = all ? g.options : g.options.filter((o, i) => i < SHORT || filters[g.id].includes(o.id));
            return (
              <section key={g.id}>
                <h3 id={`filter-${g.id}`}>{g.label}</h3>
                <div className="chips filter" role="group" aria-labelledby={`filter-${g.id}`}>
                  {options.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={filters[g.id].includes(o.id)}
                      onClick={() => onToggle(g.id, o.id)}
                    >
                      {o.label}
                    </button>
                  ))}
                  {!all && (
                    <button type="button" className="more" onClick={() => setExpanded([...expanded, g.id])}>
                      {g.options.length - options.length} more
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
        <button type="button" className="sheet-done" onClick={onClose}>
          Show {count(shown)}
        </button>
      </div>
    </div>
  );
}
