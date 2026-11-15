import { useState } from 'react';
import { Empty, TermList } from '../components/Common';
import { BackIcon, ChevronIcon, DisclosureIcon } from '../components/Icons';
import {
  type Axis,
  type Certification,
  type Framework,
  REGIONS,
  alphabetical,
  certifications,
  frameworks,
  populated,
  technology,
  terms,
  termsFor,
  topics,
} from '../data';
import { goBack, href } from '../router';
import { toggleRegion, useStore } from '../store';
import { StudyButton } from './Study';

const TITLES: Record<Axis, string> = {
  cert: 'Certifications',
  framework: 'Frameworks',
  tech: 'Technologies',
  topic: 'Topics',
};

const count = (n: number) => `${n} ${n === 1 ? 'term' : 'terms'}`;

const regionLabel = (f: Framework) => REGIONS.find((r) => r.id === f.region)?.label ?? '';

/** One of the four categories, opened from Home: everything in it, each item leading to its terms. */
export function Category({ axis }: { axis: Axis }) {
  return (
    <main className="screen">
      <div className="top-bar">
        <button type="button" className="round" aria-label="Back" onClick={goBack}>
          <BackIcon size={20} />
        </button>
      </div>
      <header className="title-block">
        <h1>{TITLES[axis]}</h1>
      </header>

      {axis === 'cert' && <Certifications />}
      {axis === 'framework' && <Frameworks />}
      {(axis === 'topic' || axis === 'tech') && (
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

// Which certification is unfolded, kept so that coming back from a domain finds it still open.
let lastOpen: string | null = null;

/** Certifications grouped by the body that issues them, both in alphabetical order. */
function Certifications() {
  const [open, setOpenState] = useState(lastOpen);
  const setOpen = (id: string | null) => {
    lastOpen = id;
    setOpenState(id);
  };
  // Only exams whose outline has been loaded are listed; the rest wait in content/BACKLOG.md.
  const live = certifications.filter((c) => c.domains.length > 0);
  const issuers = [...new Set(live.map((c) => c.issuer))].sort((a, b) => a.localeCompare(b));

  return (
    <>
      {issuers.map((issuer) => (
        <section key={issuer} className="section">
          <h2 className="group-title">{issuer}</h2>
          <div className="card list">
            {live
              .filter((c) => c.issuer === issuer)
              .map((cert) => (
                <CertificationSection
                  key={cert.id}
                  cert={cert}
                  open={open === cert.id}
                  onToggle={() => setOpen(open === cert.id ? null : cert.id)}
                />
              ))}
          </div>
        </section>
      ))}
    </>
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
          <span className="row-title">
            {cert.name}
            {cert.outline && <span className="outline"> ({outlineDate(cert.outline)})</span>}
          </span>
          {cert.fullName && <span className="secondary small">{cert.fullName}</span>}
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
        </div>
      )}
    </div>
  );
}

const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Turns an exam outline's version, such as "2026-08", into "Aug 2026". */
const outlineDate = (outline: string) => monthYear.format(new Date(`${outline}-01T00:00:00Z`));

/** Frameworks, narrowed by any regions that are ticked. None ticked shows them all. */
function Frameworks() {
  const { regions } = useStore();
  // Only frameworks that have terms are listed; the rest wait in content/BACKLOG.md.
  const live = frameworks.map((f) => ({ f, n: termsFor('framework', f.id).length })).filter(({ n }) => n > 0);
  const shown = live.filter(({ f }) => regions.length === 0 || regions.includes(f.region));
  // A region is offered only if it has something to show.
  const offered = REGIONS.filter((r) => live.some(({ f }) => f.region === r.id));

  return (
    <>
      <div className="chips filter" role="group" aria-label="Regions">
        {offered.map((r) => (
          <button key={r.id} type="button" aria-pressed={regions.includes(r.id)} onClick={() => toggleRegion(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
      {shown.length ? (
        <div className="card list">
          {shown.map(({ f, n }) => (
            <a key={f.id} className="row cert" href={href(`/list/framework/${f.id}`)}>
              <span className="row-text">
                <span className="row-title">{f.name}</span>
                <span className="secondary small">
                  {regionLabel(f)} · {f.summary}
                </span>
              </span>
              <span className="row-meta">{n}</span>
              <ChevronIcon />
            </a>
          ))}
        </div>
      ) : (
        <Empty title="Nothing here yet">No frameworks from the chosen regions have terms yet.</Empty>
      )}
    </>
  );
}

/** The terms in one category, one exam domain or one framework. */
export function TermsList({ axis, value, domain }: { axis: Axis; value: string; domain?: number }) {
  let title: string;
  let subtitle = '';
  let summary = '';
  const list = termsFor(axis, value, domain);

  if (axis === 'cert') {
    const cert = certifications.find((c) => c.id === value);
    const d = cert?.domains.find((x) => x.n === domain);
    title = d ? d.name : (cert?.name ?? value);
    subtitle = d ? `${cert?.name} · Domain ${d.n}` : '';
  } else if (axis === 'framework') {
    const framework = frameworks.find((f) => f.id === value);
    title = framework?.name ?? value;
    subtitle = framework ? regionLabel(framework) : '';
    summary = [framework?.fullName, framework?.summary].filter(Boolean).join('. ');
  } else {
    const item = (axis === 'topic' ? topics : technology).find((t) => t.id === value);
    title = item?.en ?? value;
    subtitle = item?.es ?? '';
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
        {summary && <p className="secondary summary">{summary}.</p>}
      </header>
      <StudyButton title={subtitle && axis === 'cert' ? `${subtitle}` : title} terms={list} />
      {list.length ? (
        <TermList terms={alphabetical(list)} />
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
      <StudyButton title="Saved terms" terms={list} />
      {list.length ? (
        <TermList terms={list} />
      ) : (
        <Empty title="No saved terms">Tap the bookmark on any term to keep it here. Saved terms stay on this device.</Empty>
      )}
    </main>
  );
}
