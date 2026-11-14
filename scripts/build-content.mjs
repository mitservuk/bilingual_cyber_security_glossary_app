// Compiles content/*.yaml into src/generated/content.json and validates it.
// Any problem fails the build, so a broken entry never reaches the app.
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => parse(readFileSync(join(root, p), 'utf8'));

const VERDICTS = ['translated', 'english-kept', 'both'];
const STATUSES = ['draft', 'sourced', 'verified'];
const KINDS = ['noun', 'verb', 'adjective'];
const REGISTERS = ['formal', 'informal'];
const USED_BY = ['official', 'engineers', 'google', 'microsoft', 'oracle', 'aws'];

export function loadContent() {
  const taxonomy = read('content/taxonomy.yaml');
  const errors = [];
  const termsDir = join(root, 'content/terms');
  const terms = readdirSync(termsDir)
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .flatMap((f) => parse(readFileSync(join(termsDir, f), 'utf8')) ?? []);

  const topicIds = new Set(taxonomy.topics.map((t) => t.id));
  const techIds = new Set(taxonomy.technology.map((t) => t.id));
  for (const c of taxonomy.certifications) {
    c.domains ??= [];
    if (!c.name || !c.fullName) errors.push(`certification ${c.id}: name and fullName are required`);
    if (!c.comingSoon && !c.domains.length) errors.push(`certification ${c.id}: needs domains, or comingSoon`);
  }
  const certs = new Map(taxonomy.certifications.map((c) => [c.id, c]));
  const ids = new Set();

  for (const t of terms) {
    const fail = (msg) => errors.push(`${t.id ?? '(no id)'}: ${msg}`);
    if (!t.id || !/^[a-z0-9]+\.[a-z0-9-]+$/.test(t.id)) fail('id must look like "prefix.name"');
    if (ids.has(t.id)) fail('duplicate id');
    ids.add(t.id);
    if (!t.en?.term || !t.en?.definition) fail('en.term and en.definition are required');
    if (!VERDICTS.includes(t.es?.verdict)) fail(`es.verdict must be one of ${VERDICTS.join(', ')}`);
    if (!t.es?.definition) fail('es.definition is required');
    if (!Array.isArray(t.es?.examples) || !t.es.examples.length) fail('at least one example is required');
    for (const ex of t.es?.examples ?? []) if (!ex.es || !ex.en) fail('each example needs es and en');
    const forms = t.es?.forms ?? [];
    if (forms.filter((f) => f.primary).length !== 1) fail('exactly one form must be primary');
    for (const f of forms) {
      if (!f.text) fail('a form has no text');
      if (!KINDS.includes(f.kind)) fail(`form "${f.text}": kind must be one of ${KINDS.join(', ')}`);
      if (f.register && !REGISTERS.includes(f.register)) fail(`form "${f.text}": bad register`);
      for (const u of f.usedBy ?? []) if (!USED_BY.includes(u)) fail(`form "${f.text}": unknown usedBy "${u}"`);
    }
    for (const id of t.topics ?? []) if (!topicIds.has(id)) fail(`unknown topic "${id}"`);
    if (!t.topics?.length) fail('at least one topic is required');
    for (const id of t.technology ?? []) if (!techIds.has(id)) fail(`unknown technology "${id}"`);
    for (const c of t.curriculum ?? []) {
      const cert = certs.get(c.cert);
      if (!cert) fail(`unknown certification "${c.cert}"`);
      else if (!cert.domains.some((d) => d.n === c.domain)) fail(`${c.cert} has no domain ${c.domain}`);
    }
    if (!STATUSES.includes(t.status)) fail(`status must be one of ${STATUSES.join(', ')}`);
    for (const s of t.sources ?? []) {
      if (!s.label || !s.url) fail('each source needs a label and a url');
      if (Boolean(s.found) !== Boolean(s.checked)) fail(`source "${s.label}": found and checked go together`);
      if (s.checked instanceof Date) s.checked = s.checked.toISOString().slice(0, 10);
    }
    if (t.status !== 'draft' && !(t.sources ?? []).some((s) => s.checked)) {
      fail('a sourced entry needs at least one checked source');
    }
  }
  for (const t of terms) {
    for (const r of t.related ?? []) if (!ids.has(r)) errors.push(`${t.id}: related "${r}" does not exist`);
  }
  if (errors.length) {
    throw new Error(`Content has ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  }

  terms.sort((a, b) => a.en.term.localeCompare(b.en.term, 'en', { sensitivity: 'base' }));
  return { ...taxonomy, terms };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const content = loadContent();
  const out = join(root, 'src/generated');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'content.json'), JSON.stringify(content));
  console.log(`content: ${content.terms.length} terms`);
}
