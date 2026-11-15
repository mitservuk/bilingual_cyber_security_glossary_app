import { useMemo, useState } from 'react';
import { Empty, SearchField, SpeakButton, TermList } from '../components/Common';
import {
  certifications,
  formLabel,
  frameworks,
  populated,
  primaryForm,
  technology,
  terms,
  termsFor,
  topics,
  wordOfTheDay,
} from '../data';
import { PlayIcon } from '../components/Icons';
import { href } from '../router';
import { createSearch } from '../search';
import { useStore } from '../store';

const search = createSearch(terms);

export function Home() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => search(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <main className="screen">
      <header className="brand">
        <img src="icon-192.png" alt="" width="40" height="40" />
        <h1>Bilingual Cyber</h1>
      </header>

      <SearchField
        id="q"
        label="Search terms in English or Spanish"
        placeholder="Search in English or Spanish"
        value={query}
        onChange={setQuery}
      />

      {searching ? (
        results.length ? (
          <TermList terms={results} />
        ) : (
          <Empty title="No matches">Nothing matches “{query.trim()}” yet. Try the English or the Spanish word.</Empty>
        )
      ) : (
        <Modules />
      )}
    </main>
  );
}

function Modules() {
  const word = wordOfTheDay();
  const form = primaryForm(word);
  const example = word.es.examples[0];
  // The four ways into the glossary, in alphabetical order.
  const tiles = [
    { label: 'Certifications', count: certifications.filter((c) => c.domains.length > 0).length, path: '/browse/cert' },
    { label: 'Frameworks', count: frameworks.filter((f) => termsFor('framework', f.id).length > 0).length, path: '/browse/framework' },
    { label: 'Technologies', count: populated(technology, 'tech').length, path: '/browse/tech' },
    { label: 'Topics', count: populated(topics, 'topic').length, path: '/browse/topic' },
  ];

  const { deck, known } = useStore();
  const knownInDeck = deck ? deck.ids.filter((id) => known.includes(id)).length : 0;

  return (
    <>
      {deck && deck.ids.length > 0 && (
        <a className="study-card" href={href('/study')}>
          <span className="study-card-text">
            <b>Continue studying</b>
            <span>
              {deck.title} · {knownInDeck} of {deck.ids.length} known
            </span>
          </span>
          <span className="study-card-go">
            <PlayIcon />
          </span>
        </a>
      )}

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

      <section className="section">
        <div className="section-head">
          <h2>Browse</h2>
          <a href={href('/terms')}>All {terms.length} terms</a>
        </div>
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
