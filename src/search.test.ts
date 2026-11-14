import { describe, expect, it } from 'vitest';
import { terms } from './data';
import { createSearch, normalise } from './search';

const search = createSearch(terms);
const ids = (q: string) => search(q).map((t) => t.id);

describe('normalise', () => {
  it('ignores case and accents', () => {
    expect(normalise('  Computación ')).toBe('computacion');
  });
});

describe('search', () => {
  it('finds a term by its English name', () => {
    expect(ids('firewall')[0]).toBe('sec.firewall');
  });

  it('finds a term by its Spanish form, without accents', () => {
    expect(ids('cortafuegos')).toContain('sec.firewall');
    expect(ids('computacion')).toContain('cloud.cloud-computing');
  });

  it('finds a term by either acronym', () => {
    expect(ids('rgpd')[0]).toBe('fw.gdpr');
    expect(ids('gdpr')[0]).toBe('fw.gdpr');
    expect(ids('dlp')[0]).toBe('sec.dlp');
  });

  it('matches the start of any word', () => {
    expect(ids('riesg')).toContain('sec.risk-assessment');
  });

  it('ranks an exact match above a partial one', () => {
    expect(ids('log')[0]).toBe('sec.log');
  });

  it('returns nothing for an empty query or no match', () => {
    expect(ids('   ')).toEqual([]);
    expect(ids('zzzz')).toEqual([]);
  });
});

describe('ordering', () => {
  it('lists terms alphabetically by the title they are shown under', async () => {
    const { titleOf } = await import('./data');
    const names = terms.map(titleOf);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
  });

  it('lists categories and certifications alphabetically', async () => {
    const { certifications, populated, topics, technology } = await import('./data');
    for (const list of [populated(topics, 'topic'), populated(technology, 'tech')]) {
      const names = list.map((x) => x.item.en);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    }
    const names = certifications.map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
    expect(names).toContain('CCSP');
  });

  it('lists frameworks alphabetically, each with a region', async () => {
    const { frameworks, REGIONS } = await import('./data');
    const names = frameworks.map((f) => f.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
    const regions = REGIONS.map((r) => r.id);
    for (const f of frameworks) expect(regions).toContain(f.region);
  });

  it('gathers the terms that belong to a framework', async () => {
    const { termsFor } = await import('./data');
    expect(termsFor('framework', 'GDPR').map((t) => t.id)).toContain('law.data-controller');
    expect(termsFor('framework', 'ENS').map((t) => t.id)).toEqual(['fw.ens']);
  });

  it('titles a Spanish-first entry in Spanish and finds it by its acronym', async () => {
    const { getTerm, titleOf } = await import('./data');
    expect(titleOf(getTerm('fw.ens')!)).toBe('Esquema Nacional de Seguridad');
    expect(ids('ens')[0]).toBe('fw.ens');
  });

  it('keeps a certification\'s domains in numbered order', async () => {
    const { certifications } = await import('./data');
    const ccsp = certifications.find((c) => c.id === 'CCSP')!;
    expect(ccsp.domains.map((d) => d.n)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
