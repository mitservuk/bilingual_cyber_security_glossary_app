import { useEffect, useRef, useState } from 'react';
import { Empty, Segmented, SpeakButton } from '../components/Common';
import { CardsIcon, ClearIcon } from '../components/Icons';
import { type Term, formLabel, getTerm, primaryForm } from '../data';
import { goBack, href } from '../router';
import { type StudyDirection, markKnown, setDeck, setStudyDirection, useStore } from '../store';

const DIRECTIONS: { value: StudyDirection; label: string }[] = [
  { value: 'en-es', label: 'English → Spanish' },
  { value: 'es-en', label: 'Spanish → English' },
];

const count = (n: number) => `${n} ${n === 1 ? 'term' : 'terms'}`;

/** Starts a study session with whatever list is on screen as the deck. */
export function StudyButton({ title, terms }: { title: string; terms: Term[] }) {
  if (terms.length === 0) return null;
  return (
    <button
      type="button"
      className="study-button"
      onClick={() => {
        setDeck({ title, ids: terms.map((t) => t.id) });
        window.location.hash = '/study';
      }}
    >
      <CardsIcon size={20} />
      Study {terms.length === 1 ? 'this term' : `these ${count(terms.length)}`}
    </button>
  );
}

function shuffled<T>(list: T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** How far a card must be dragged before letting go counts as an answer. */
const SWIPE = 90;

export function Study() {
  const { deck, known, studyDirection } = useStore();
  const all = (deck?.ids ?? []).flatMap((id) => getTerm(id) ?? []);

  // A session starts with the cards not yet known, in a fresh order. If
  // every card is known, it goes through the whole deck again.
  const [queue, setQueue] = useState<Term[]>(() => {
    const fresh = all.filter((t) => !known.includes(t.id));
    return shuffled(fresh.length ? fresh : all);
  });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<Term[]>([]);
  const [drag, setDrag] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  const term = queue[index];
  const done = index >= queue.length;

  const answer = (knowIt: boolean) => {
    if (!term) return;
    markKnown(term.id, knowIt);
    if (!knowIt) setMissed((m) => [...m, term]);
    setFlipped(false);
    setDrag(0);
    setIndex((i) => i + 1);
  };

  const restart = (cards: Term[]) => {
    setQueue(shuffled(cards));
    setIndex(0);
    setMissed([]);
    setFlipped(false);
  };

  // Keyboard: space or Enter turns the card, the arrows answer it.
  const keys = useRef({ answer, flip: () => setFlipped((f) => !f) });
  keys.current = { answer, flip: () => setFlipped((f) => !f) };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') keys.current.answer(true);
      else if (e.key === 'ArrowLeft') keys.current.answer(false);
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        keys.current.flip();
      } else if (e.key === 'Escape') goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!deck || all.length === 0) {
    return (
      <main className="screen study">
        <TopBar />
        <Empty title="Nothing to study yet">Open any list of terms and tap Study to turn it into flashcards.</Empty>
      </main>
    );
  }

  if (done) {
    const knownNow = queue.length - missed.length;
    return (
      <main className="screen study">
        <TopBar />
        <div className="study-done">
          <h1>Session complete</h1>
          <p className="secondary">{deck.title}</p>
          <div className="study-stats">
            <div>
              <b>{knownNow}</b>
              <span>Know it</span>
            </div>
            <div>
              <b>{missed.length}</b>
              <span>Still learning</span>
            </div>
          </div>
          {missed.length > 0 ? (
            <button type="button" className="study-button" onClick={() => restart(missed)}>
              Go again with {missed.length === 1 ? 'that one' : `the ${missed.length}`}
            </button>
          ) : (
            <button type="button" className="study-button" onClick={() => restart(all)}>
              Go through all {all.length} again
            </button>
          )}
          <button type="button" className="link" onClick={goBack}>
            Back to the list
          </button>
        </div>
      </main>
    );
  }

  const form = primaryForm(term);
  const spanish = formLabel(form);
  const toSpanish = studyDirection === 'en-es';
  const question = toSpanish ? term.en.term : spanish;
  const example = term.es.examples[0];
  const leaning = drag > 30 ? 'right' : drag < -30 ? 'left' : '';

  return (
    <main className="screen study">
      <TopBar>
        <div className="study-progress" role="progressbar" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={index}>
          <i style={{ width: `${(index / queue.length) * 100}%` }} />
        </div>
        <span className="study-count">
          {index + 1} / {queue.length}
        </span>
      </TopBar>

      <Segmented label="Direction" options={DIRECTIONS} value={studyDirection} onChange={setStudyDirection} />

      <div
        className={`flashcard ${leaning}`}
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Flashcard, answer shown. Swipe right if you know it, left if still learning.' : 'Flashcard. Tap to see the answer.'}
        style={{
          transform: drag ? `translateX(${drag}px) rotate(${drag / 28}deg)` : undefined,
          transition: start.current ? 'none' : undefined,
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button, a')) return;
          start.current = { x: e.clientX, y: e.clientY };
          moved.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!start.current) return;
          const dx = e.clientX - start.current.x;
          if (Math.abs(dx) > 8) moved.current = true;
          if (moved.current) setDrag(dx);
        }}
        onPointerUp={() => {
          if (!start.current) return;
          start.current = null;
          if (!moved.current) setFlipped((f) => !f);
          else if (drag > SWIPE) answer(true);
          else if (drag < -SWIPE) answer(false);
          else setDrag(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDrag(0);
        }}
      >
        <div className="flashcard-deck">{deck.title}</div>
        {leaning && <div className={`flashcard-stamp ${leaning}`}>{leaning === 'right' ? 'Know it' : 'Still learning'}</div>}
        {flipped ? (
          <>
            <div className="secondary" lang={toSpanish ? 'en' : 'es'}>
              {question}
            </div>
            <div className={toSpanish ? 'flashcard-answer es' : 'flashcard-answer'} lang={toSpanish ? 'es' : 'en'}>
              {toSpanish ? spanish : term.en.term}
            </div>
            <div className="flashcard-speak">
              <SpeakButton text={spanish} label={spanish} large />
            </div>
            {example && (
              <>
                <div className="hairline" />
                <div>
                  <p className="flashcard-example" lang="es">
                    {example.es}
                  </p>
                  <p className="secondary">{example.en}</p>
                </div>
              </>
            )}
            <a className="flashcard-more" href={href(`/term/${term.id}`)}>
              Open the full entry
            </a>
          </>
        ) : (
          <>
            <div className={toSpanish ? 'flashcard-question' : 'flashcard-question es'} lang={toSpanish ? 'en' : 'es'}>
              {question}
            </div>
            <div className="flashcard-hint">Tap to see the {toSpanish ? 'Spanish' : 'English'}</div>
          </>
        )}
      </div>

      <div className="study-rate">
        <button type="button" className="again" onClick={() => answer(false)}>
          Still learning
        </button>
        <button type="button" className="got" onClick={() => answer(true)}>
          Know it
        </button>
      </div>
      <p className="study-tip">Swipe left for still learning, right for know it.</p>
    </main>
  );
}

function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="study-top">
      <button type="button" className="study-close" aria-label="Close" onClick={goBack}>
        <ClearIcon size={14} />
      </button>
      {children}
    </div>
  );
}
