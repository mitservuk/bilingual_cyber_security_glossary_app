import { useMemo, useState } from 'react';
import { Empty, SpeakButton, TermList } from '../components/Common';
import { ClearIcon, SearchIcon } from '../components/Icons';
import {
  certifications,
  formLabel,
  getTerm,
  populated,
  primaryForm,
  technology,
  terms,
  topics,
  wordOfTheDay,
} from '../data';
import { href } from '../router';
import { createSearch } from '../search';
import { useStore } from '../store';

const search = createSearch(terms);

const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export function Home() {
  const [query, setQuery] = useState('');
  const { recent } = useStore();
  const results = useMemo(() => search(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <main className="screen">
      <header className="title-block">
        <div className="eyebrow">{today.format(new Date())}</div>
        <h1>{searching ? 'Search' : 'Today'}</h1>
      </header>

      <div className="search-field">
        <SearchIcon size={18} />
        <label className="visually-hidden" htmlFor="q">
          Search terms in English or Spanish
        </label>
        <input
          id="q"
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Search in English or Spanish"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && (
          <button type="button" className="clear" aria-label="Clear search" onClick={() => setQuery('')}>
            <ClearIcon size={14} />
          </button>
        )}
      </div>

      {searching ? (
        results.length ? (
          <TermList terms={results} showVerdict />
        ) : (
          <Empty title="No matches">Nothing matches “{query.trim()}” yet. Try the English or the Spanish word.</Empty>
        )
      ) : (
        <Modules recent={recent} />
      )}
    </main>
  );
}

function Modules({ recent }: { recent: string[] }) {
  const word = wordOfTheDay();
  const form = primaryForm(word);
  const example = word.es.examples[0];
  const recentTerms = recent.flatMap((id) => getTerm(id) ?? []).slice(0, 3);
  // Fixed entry points into the glossary, in alphabetical order.
  const tiles = [
    { label: 'All terms', count: terms.length, path: '/list/all' },
    { label: 'Certifications', count: certifications.length, path: '/browse/cert' },
    { label: 'Technologies', count: populated(technology, 'tech').length, path: '/browse/tech' },
    { label: 'Topics', count: populated(topics, 'topic').length, path: '/browse/topic' },
  ];

  return (
    <>
      <section className="card wotd" aria-labelledby="wotd">
        <h2 id="wotd" className="label accent">
          Word of the day
        </h2>
        <div className="wotd-head">
          <a className="wotd-term" href={href(`/term/${word.id}`)}>
            <span className={formLabel(form).length > 20 ? 'wotd-es long' : 'wotd-es'} lang="es">
              {formLabel(form)}
            </span>
            <span className="wotd-en">{word.en.term}</span>
          </a>
          <SpeakButton text={formLabel(form)} label={formLabel(form)} large />
        </div>
        <div className="hairline" />
        <div>
          <p className="example-es" lang="es">
            {example.es}
          </p>
          <p className="secondary">{example.en}</p>
        </div>
      </section>

      {recentTerms.length > 0 && (
        <section className="section">
          <h2>Recent</h2>
          <TermList terms={recentTerms} />
        </section>
      )}

      <section className="section">
        <h2>Browse</h2>
        <div className="tiles">
          {tiles.map((tile) => (
            <a key={tile.path} className="tile" href={href(tile.path)}>
              <span className="tile-title">{tile.label}</span>
              <span className="tile-count">{tile.count}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
