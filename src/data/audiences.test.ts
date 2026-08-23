import { describe, it, expect } from 'vitest';
import {
  AUDIENCES,
  AUDIENCE_OVERRIDES,
  deriveAudiences,
  type AudienceId,
} from './audiences';
import { metaCategories } from '../algorithms/manifest';
import { filterByAudience, countByAudience, matchesAudience } from '../utils/audienceFilter';

const ALL: AudienceId[] = ['big-tech', 'staffing', 'startup'];

describe('audience definitions', () => {
  it('defines every id in the union, once', () => {
    expect(AUDIENCES.map((a) => a.id).sort()).toEqual([...ALL].sort());
    expect(new Set(AUDIENCES.map((a) => a.id)).size).toBe(AUDIENCES.length);
  });

  it('gives each audience a label and a blurb, since the blurb is the filter tooltip', () => {
    for (const audience of AUDIENCES) {
      expect(audience.label.trim(), audience.id).not.toBe('');
      expect(audience.blurb.length, audience.id).toBeGreaterThan(30);
    }
  });
});

describe('deriveAudiences', () => {
  it('never returns an empty list', () => {
    for (const difficulty of ['Easy', 'Medium', 'Hard'] as const) {
      for (const category of ['arrays-hashing', 'bit-manipulation', 'made-up-category']) {
        expect(deriveAudiences('x', category, difficulty).length, `${category}/${difficulty}`)
          .toBeGreaterThan(0);
      }
    }
  });

  it('returns only known audience ids', () => {
    const got = deriveAudiences('x', 'arrays-hashing', 'Easy');
    for (const id of got) expect(ALL).toContain(id);
  });

  it('puts easy core problems in front of an agency screen', () => {
    expect(deriveAudiences('two-sum', 'arrays-hashing', 'Easy')).toContain('staffing');
  });

  it('keeps agency screens away from anything harder than easy', () => {
    expect(deriveAudiences('x', 'arrays-hashing', 'Medium')).not.toContain('staffing');
    expect(deriveAudiences('x', 'arrays-hashing', 'Hard')).not.toContain('staffing');
  });

  it('keeps agency screens away from the deeper categories even at easy', () => {
    expect(deriveAudiences('x', 'dp-2d', 'Easy')).not.toContain('staffing');
    expect(deriveAudiences('x', 'advanced-graphs', 'Easy')).not.toContain('staffing');
  });

  it('excludes startups from theory-heavy categories and from hard', () => {
    expect(deriveAudiences('x', 'dp-2d', 'Medium')).not.toContain('startup');
    expect(deriveAudiences('x', 'bit-manipulation', 'Easy')).not.toContain('startup');
    expect(deriveAudiences('x', 'arrays-hashing', 'Hard')).not.toContain('startup');
  });

  it('lets big tech ask hard graph and dp problems, which it does', () => {
    expect(deriveAudiences('x', 'advanced-graphs', 'Hard')).toContain('big-tech');
    expect(deriveAudiences('x', 'dp-2d', 'Hard')).toContain('big-tech');
  });

  it('is deterministic', () => {
    const a = deriveAudiences('x', 'trees', 'Medium');
    const b = deriveAudiences('x', 'trees', 'Medium');
    expect(a).toEqual(b);
  });

  it('honours an override exactly, bypassing the rules', () => {
    // Guard the mechanism without depending on the override table's contents, which is content.
    for (const [id, audiences] of Object.entries(AUDIENCE_OVERRIDES)) {
      expect(audiences.length, id).toBeGreaterThan(0);
      for (const a of audiences) expect(ALL, id).toContain(a);
      expect(deriveAudiences(id, 'arrays-hashing', 'Easy')).toEqual(audiences);
    }
  });

  it('does not hand out the caller\'s array, so a caller cannot mutate the table', () => {
    const first = Object.keys(AUDIENCE_OVERRIDES)[0];
    if (!first) return;
    const got = deriveAudiences(first, 'arrays-hashing', 'Easy');
    got.push('startup');
    expect(deriveAudiences(first, 'arrays-hashing', 'Easy')).not.toEqual(got);
  });
});

describe('the tagged catalogue', () => {
  const all = metaCategories.flatMap((c) => c.algorithms);

  it('tags every problem with at least one audience', () => {
    const untagged = all.filter((a) => !a.audiences || a.audiences.length === 0);
    expect(untagged.map((a) => a.id)).toEqual([]);
  });

  it('uses only known audience ids', () => {
    for (const a of all) {
      for (const id of a.audiences) expect(ALL, a.id).toContain(id);
    }
  });

  it('matches what deriveAudiences produces — the manifest is generated, not hand-edited', () => {
    const drifted: string[] = [];
    for (const category of metaCategories) {
      for (const a of category.algorithms) {
        const expected = deriveAudiences(a.id, category.id, a.difficulty);
        if (JSON.stringify([...a.audiences].sort()) !== JSON.stringify([...expected].sort())) {
          drifted.push(`${a.id}: ${a.audiences.join(',')} != ${expected.join(',')}`);
        }
      }
    }
    expect(drifted).toEqual([]);
  });

  it('leaves each audience with a non-trivial set, or the filter is pointless', () => {
    for (const audience of ALL) {
      expect(countByAudience(metaCategories, [audience]), audience).toBeGreaterThan(20);
    }
  });
});

describe('filterByAudience', () => {
  it('returns everything when nothing is selected', () => {
    expect(filterByAudience(metaCategories, [])).toBe(metaCategories);
  });

  it('keeps only matching problems', () => {
    const filtered = filterByAudience(metaCategories, ['staffing']);
    for (const c of filtered) {
      for (const a of c.algorithms) expect(a.audiences, a.id).toContain('staffing');
    }
  });

  it('drops categories left with nothing, so no empty headers render', () => {
    const filtered = filterByAudience(metaCategories, ['staffing']);
    expect(filtered.every((c) => c.algorithms.length > 0)).toBe(true);
    expect(filtered.length).toBeLessThan(metaCategories.length);
  });

  it('treats multiple selections as a union, not an intersection', () => {
    const staffing = countByAudience(metaCategories, ['staffing']);
    const startup = countByAudience(metaCategories, ['startup']);
    const both = countByAudience(metaCategories, ['staffing', 'startup']);
    expect(both).toBeGreaterThanOrEqual(Math.max(staffing, startup));
    expect(both).toBeLessThanOrEqual(staffing + startup);
  });

  it('never invents or duplicates a problem', () => {
    const before = metaCategories.flatMap((c) => c.algorithms.map((a) => a.id));
    const after = filterByAudience(metaCategories, ['big-tech', 'staffing', 'startup'])
      .flatMap((c) => c.algorithms.map((a) => a.id));
    expect(new Set(after).size).toBe(after.length);
    for (const id of after) expect(before).toContain(id);
  });

  it('does not mutate the input', () => {
    const snapshot = JSON.stringify(metaCategories);
    filterByAudience(metaCategories, ['staffing']);
    expect(JSON.stringify(metaCategories)).toBe(snapshot);
  });
});

describe('matchesAudience', () => {
  it('passes everything through when no filter is set', () => {
    expect(matchesAudience(['startup'], [])).toBe(true);
    expect(matchesAudience([], [])).toBe(true);
  });

  it('matches on any overlap', () => {
    expect(matchesAudience(['big-tech', 'startup'], ['startup'])).toBe(true);
    expect(matchesAudience(['big-tech'], ['staffing'])).toBe(false);
  });
});
