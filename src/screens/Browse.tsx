import { useState } from 'react';
import { Empty, Segmented, TermList } from '../components/Common';
import { BackIcon, ChevronIcon } from '../components/Icons';
import { type Axis, certifications, populated, technology, terms, termsFor, topics } from '../data';
import { goBack, href } from '../router';
import { useStore } from '../store';

const AXES: { value: Axis; label: string }[] = [
  { value: 'topic', label: 'Topic' },
  { value: 'tech', label: 'Technology' },
  { value: 'cert', label: 'Certification' },
];

const count = (n: number) => `${n} ${n === 1 ? 'term' : 'terms'}`;

let lastAxis: Axis = 'topic';

export function Browse() {
  const [axis, setAxisState] = useState<Axis>(lastAxis);
  const setAxis = (a: Axis) => {
    lastAxis = a;
    setAxisState(a);
  };

  return (
    <main className="screen">
      <header className="title-block">
        <h1>Browse</h1>
      </header>
      <Segmented label="Browse by" options={AXES} value={axis} onChange={setAxis} />

      {axis === 'cert' ? (
        certifications.map((cert) => (
          <section key={cert.id} className="section">
            <div className="section-head">
              <h2>{cert.name}</h2>
              <span className="secondary">{count(termsFor('cert', cert.id).length)}</span>
            </div>
            <div className="card list">
              {cert.domains.map((d) => (
                <a key={d.n} className="row" href={href(`/list/cert/${cert.id}/${d.n}`)}>
                  <span className="badge">{d.n}</span>
                  <span className="row-text">
                    <span className="row-title compact">{d.name}</span>
                    <span className="secondary small">
                      {d.weight}% of exam · {count(termsFor('cert', cert.id, d.n).length)}
                    </span>
                  </span>
                  <ChevronIcon />
                </a>
              ))}
            </div>
            <p className="footnote">{cert.outlineLabel}</p>
          </section>
        ))
      ) : (
        <div className="card list">
          {populated(axis === 'topic' ? topics : technology, axis).map(({ item, count: n }) => (
            <a key={item.id} className="row" href={href(`/list/${axis}/${item.id}`)}>
              <span className="row-text">
                <span className="row-title">{item.en}</span>
                <span className="row-es" lang="es">
                  {item.es}
                </span>
              </span>
              <span className="row-meta">{n}</span>
              <ChevronIcon />
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

/** A filtered list of terms: one category, one exam domain, or everything. */
export function TermsList({ axis, value, domain }: { axis?: Axis; value?: string; domain?: number }) {
  let title = 'All terms';
  let subtitle = '';
  let list = terms;

  if (axis && value) {
    list = termsFor(axis, value, domain);
    if (axis === 'cert') {
      const cert = certifications.find((c) => c.id === value);
      const d = cert?.domains.find((x) => x.n === domain);
      title = d ? d.name : (cert?.name ?? value);
      subtitle = d ? `${cert?.name} · Domain ${d.n}` : '';
    } else {
      const item = (axis === 'topic' ? topics : technology).find((t) => t.id === value);
      title = item?.en ?? value;
      subtitle = item?.es ?? '';
    }
  }

  return (
    <main className="screen">
      <div className="top-bar">
        <button type="button" className="round" aria-label="Back" onClick={goBack}>
          <BackIcon size={20} />
        </button>
      </div>
      <header className="title-block">
        {subtitle && <div className="eyebrow">{subtitle}</div>}
        <h1 className="long">{title}</h1>
      </header>
      {list.length ? (
        <TermList terms={list} showVerdict />
      ) : (
        <Empty title="Nothing here yet">No terms have been added to this category.</Empty>
      )}
    </main>
  );
}

export function Saved() {
  const { saved } = useStore();
  const list = saved.flatMap((id) => terms.find((t) => t.id === id) ?? []);
  return (
    <main className="screen">
      <header className="title-block">
        <h1>Saved</h1>
      </header>
      {list.length ? (
        <TermList terms={list} showVerdict />
      ) : (
        <Empty title="No saved terms">Tap the bookmark on any term to keep it here. Saved terms stay on this device.</Empty>
      )}
    </main>
  );
}
