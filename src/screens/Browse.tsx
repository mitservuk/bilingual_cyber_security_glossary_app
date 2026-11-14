import { useState } from 'react';
import { Empty, Segmented, TermList } from '../components/Common';
import { BackIcon, ChevronIcon, DisclosureIcon } from '../components/Icons';
import {
  type Axis,
  type Certification,
  alphabetical,
  certifications,
  populated,
  technology,
  terms,
  termsFor,
  topics,
} from '../data';
import { goBack, href } from '../router';
import { useStore } from '../store';

// The tabs are alphabetical, like every other list in the app.
const AXES: { value: Axis; label: string }[] = [
  { value: 'cert', label: 'Certifications' },
  { value: 'tech', label: 'Technologies' },
  { value: 'topic', label: 'Topics' },
];

const count = (n: number) => `${n} ${n === 1 ? 'term' : 'terms'}`;

let lastAxis: Axis = 'cert';

export function Browse({ axis: fromRoute }: { axis?: string }) {
  const axis = AXES.find((a) => a.value === fromRoute)?.value ?? lastAxis;
  lastAxis = axis;

  // Switching tabs replaces the current history entry, so Back leaves Browse
  // rather than stepping through every tab that was looked at.
  const setAxis = (a: Axis) => window.location.replace(href(`/browse/${a}`));

  return (
    <main className="screen">
      <header className="title-block">
        <h1>Browse</h1>
      </header>
      <Segmented label="Browse by" options={AXES} value={axis} onChange={setAxis} />

      {axis === 'cert' ? (
        <Certifications />
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

function Certifications() {
  // With a single certification available there is nothing to choose, so it starts open.
  const available = certifications.filter((c) => !c.comingSoon);
  const [open, setOpen] = useState<string | null>(available.length === 1 ? available[0].id : null);

  return (
    <div className="card list">
      {certifications.map((cert) =>
        cert.comingSoon ? (
          <div key={cert.id} className="row cert">
            <span className="row-text">
              <span className="row-title">{cert.name}</span>
              <span className="secondary small">{cert.fullName}</span>
            </span>
            <span className="pill soon">Coming soon</span>
          </div>
        ) : (
          <CertificationSection
            key={cert.id}
            cert={cert}
            open={open === cert.id}
            onToggle={() => setOpen(open === cert.id ? null : cert.id)}
          />
        ),
      )}
    </div>
  );
}

function CertificationSection({
  cert,
  open,
  onToggle,
}: {
  cert: Certification;
  open: boolean;
  onToggle: () => void;
}) {
  const panel = `domains-${cert.id}`;
  return (
    <div className="cert-section">
      <button type="button" className="row cert" aria-expanded={open} aria-controls={panel} onClick={onToggle}>
        <span className="row-text">
          <span className="row-title">{cert.name}</span>
          <span className="secondary small">{cert.fullName}</span>
        </span>
        <span className="row-meta">{count(termsFor('cert', cert.id).length)}</span>
        <DisclosureIcon open={open} />
      </button>
      {open && (
        <div id={panel} className="domains">
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
          {cert.outlineLabel && <p className="footnote domains-note">{cert.outlineLabel}</p>}
        </div>
      )}
    </div>
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
        <TermList terms={alphabetical(list)} showVerdict />
      ) : (
        <Empty title="Nothing here yet">No terms have been added to this category.</Empty>
      )}
    </main>
  );
}

export function Saved() {
  const { saved } = useStore();
  const list = alphabetical(saved.flatMap((id) => terms.find((t) => t.id === id) ?? []));
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
