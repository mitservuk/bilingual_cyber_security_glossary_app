import { useEffect } from 'react';
import { Empty, Segmented, SpeakButton, TermList } from '../components/Common';
import { BackIcon, BookmarkIcon, WarningIcon } from '../components/Icons';
import {
  type Form,
  type Lang,
  type Source,
  type Term,
  USED_BY_LABEL,
  VERDICT_LABEL,
  certifications,
  formLabel,
  getTerm,
  topics,
} from '../data';
import { goBack } from '../router';
import { addRecent, setLang, toggleSaved, useStore } from '../store';

const STATUS: Record<Term['status'], { label: string; explain: string }> = {
  draft: { label: 'Draft', explain: 'Parts of this entry have not yet been checked against a source.' },
  sourced: { label: 'Sourced', explain: 'Every form and note here is backed by a source that was read.' },
  verified: { label: 'Verified', explain: 'Sourced, and confirmed by a native-speaking professional.' },
};

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'es', label: 'ES' },
];

const checkedDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function categoryLine(term: Term, lang: Lang) {
  const parts: string[] = [];
  const topic = topics.find((t) => t.id === term.topics[0]);
  if (topic) parts.push(topic[lang]);
  const c = term.curriculum[0];
  if (c) parts.push(`${c.cert} ${lang === 'es' ? 'Dominio' : 'Domain'} ${c.domain}`);
  return parts.join(' · ');
}

function formDetail(f: Form) {
  const parts: string[] = [];
  if (f.register === 'formal') parts.push('Formal');
  if (f.register === 'informal') parts.push('Informal');
  if (f.kind === 'verb') parts.push('Verb');
  if (f.kind === 'adjective') parts.push('Adjective');
  if (f.plural) parts.push(`plural ${f.plural}`);
  const line = parts.join(' · ');
  return line.charAt(0).toUpperCase() + line.slice(1);
}

export function Entry({ id }: { id: string }) {
  const term = getTerm(id);
  const { saved, lang } = useStore();

  useEffect(() => {
    if (term) addRecent(term.id);
  }, [term]);

  if (!term) {
    return (
      <main className="screen">
        <TopBar />
        <Empty title="Term not found">This entry may have been renamed or removed.</Empty>
      </main>
    );
  }

  const isSaved = saved.includes(term.id);
  const related = term.related.flatMap((r) => getTerm(r) ?? []);
  const cert = term.curriculum[0] && certifications.find((c) => c.id === term.curriculum[0].cert);

  return (
    <main className="screen entry">
      <TopBar>
        <button
          type="button"
          className="round"
          aria-label={isSaved ? 'Remove from saved' : 'Save this term'}
          aria-pressed={isSaved}
          onClick={() => toggleSaved(term.id)}
        >
          <BookmarkIcon size={20} filled={isSaved} />
        </button>
      </TopBar>

      <header className="entry-head">
        <div className="entry-title">
          <h1>
            {term.en.term}
            {term.en.acronym && <span className="acronym"> ({term.en.acronym})</span>}
          </h1>
          <Segmented label="Definition language" options={LANGS} value={lang} onChange={setLang} compact />
        </div>
        {term.en.expansion && <div className="secondary">{term.en.expansion}</div>}
        <div className="secondary" lang={lang}>
          {categoryLine(term, lang)}
        </div>
        <p className="definition" lang={lang}>
          {lang === 'es' ? term.es.definition : term.en.definition}
        </p>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>In Spain</h2>
          <span className="secondary">{VERDICT_LABEL[term.es.verdict]}</span>
        </div>
        <div className="card forms">
          {term.es.forms.map((f) => (
            <div key={f.text} className={f.primary ? 'form primary' : 'form'}>
              <div className="form-text">
                <div className="form-es" lang="es">
                  {formLabel(f)}
                </div>
                {formDetail(f) && <div className="secondary">{formDetail(f)}</div>}
                {f.note && <p className="note">{f.note}</p>}
                {f.usedBy && (
                  <div className="chips" aria-label="Used by">
                    {f.usedBy.map((u) => (
                      <span key={u} className="chip">
                        {USED_BY_LABEL[u] ?? u}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <SpeakButton text={formLabel(f)} label={formLabel(f)} />
            </div>
          ))}
        </div>
        {term.es.say && <p className="footnote">{term.es.say}</p>}
      </section>

      {term.es.examples.map((ex) => (
        <section key={ex.es} className="card example">
          <div className="form-text">
            <h3 className="label">Example</h3>
            <p className="example-es" lang="es">
              {ex.es}
            </p>
            <p className="secondary">{ex.en}</p>
          </div>
          <SpeakButton text={ex.es} label="the example" />
        </section>
      ))}

      {term.es.watchOut && (
        <section className="card watch">
          <span className="watch-icon">
            <WarningIcon size={18} />
          </span>
          <div className="form-text">
            <h3 className="label warn">Watch out</h3>
            <p className="note">{term.es.watchOut}</p>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section">
          <h2>Related</h2>
          <TermList terms={related} />
        </section>
      )}

      <Sources term={term} />

      {cert && <p className="footnote">{cert.outlineLabel}</p>}
    </main>
  );
}

function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="top-bar">
      <button type="button" className="round" aria-label="Back" onClick={goBack}>
        <BackIcon size={20} />
      </button>
      {children}
    </div>
  );
}

function Sources({ term }: { term: Term }) {
  const status = STATUS[term.status];
  const checked = term.sources.filter((s) => s.checked).length;
  return (
    <details className="card sources">
      <summary>
        <span className="row-title regular">Sources</span>
        <span className={`pill ${term.status}`}>{status.label}</span>
        <span className="row-meta grow">
          {term.sources.length ? `${checked} of ${term.sources.length} checked` : 'None yet'}
        </span>
      </summary>
      <p className="note sources-explain">{status.explain}</p>
      {term.sources.map((s) => (
        <SourceRow key={s.url + s.label} source={s} />
      ))}
    </details>
  );
}

function SourceRow({ source }: { source: Source }) {
  return (
    <div className="source">
      <a href={source.url} target="_blank" rel="noreferrer">
        {source.label}
      </a>
      {source.checked ? (
        <div className="secondary small">
          Checked {checkedDate.format(new Date(source.checked))}
          {source.found?.length ? ` · found “${source.found.join('”, “')}”` : ''}
        </div>
      ) : (
        <div className="secondary small">Not yet read</div>
      )}
    </div>
  );
}
