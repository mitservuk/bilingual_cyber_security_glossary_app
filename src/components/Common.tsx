import type { ReactNode } from 'react';
import { type Term, VERDICT_LABEL, spanishSummary } from '../data';
import { href } from '../router';
import { canSpeak, speak } from '../speech';
import { ChevronIcon, SpeakerIcon } from './Icons';

export function TermRow({ term, showVerdict = false }: { term: Term; showVerdict?: boolean }) {
  return (
    <a className="row" href={href(`/term/${term.id}`)}>
      <span className="row-text">
        <span className="row-title">{term.en.term}</span>
        <span className="row-es" lang="es">
          {spanishSummary(term)}
        </span>
      </span>
      {showVerdict && <span className="row-meta">{VERDICT_LABEL[term.es.verdict]}</span>}
      <ChevronIcon />
    </a>
  );
}

export function TermList({ terms, showVerdict }: { terms: Term[]; showVerdict?: boolean }) {
  return (
    <div className="card list">
      {terms.map((t) => (
        <TermRow key={t.id} term={t} showVerdict={showVerdict} />
      ))}
    </div>
  );
}

export function SpeakButton({ text, label, large }: { text: string; label: string; large?: boolean }) {
  if (!canSpeak) return null;
  return (
    <button
      type="button"
      className={large ? 'round speak speak-large' : 'round speak'}
      aria-label={`Hear ${label}`}
      onClick={() => speak(text)}
    >
      <SpeakerIcon size={large ? 24 : 22} />
    </button>
  );
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  compact,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'segmented compact' : 'segmented'} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
