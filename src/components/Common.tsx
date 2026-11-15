import type { ReactNode } from 'react';
import { type Term, spanishSummary, titleOf } from '../data';
import { href } from '../router';
import { canSpeak, speak } from '../speech';
import { ChevronIcon, ClearIcon, SearchIcon, SpeakerIcon } from './Icons';

export function TermRow({ term }: { term: Term }) {
  return (
    <a className="row" href={href(`/term/${term.id}`)}>
      {term.headword === 'es' ? (
        <span className="row-text">
          <span className="row-title" lang="es">
            {titleOf(term)}
          </span>
          <span className="secondary">{term.en.term}</span>
        </span>
      ) : (
        <span className="row-text">
          <span className="row-title">{term.en.term}</span>
          <span className="row-es" lang="es">
            {spanishSummary(term)}
          </span>
        </span>
      )}
      <ChevronIcon />
    </a>
  );
}

export function TermList({ terms }: { terms: Term[] }) {
  return (
    <div className="card list">
      {terms.map((t) => (
        <TermRow key={t.id} term={t} />
      ))}
    </div>
  );
}

export function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="search-field">
      <SearchIcon size={18} />
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="search"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value.trim().length > 0 && (
        <button type="button" className="clear" aria-label="Clear search" onClick={() => onChange('')}>
          <ClearIcon size={14} />
        </button>
      )}
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
