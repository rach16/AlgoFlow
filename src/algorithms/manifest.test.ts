import { describe, it, expect } from 'vitest';
import { categories } from './index';
import { metaCategories } from './manifest';
import { metaById, loadAlgorithm } from './registry';
import { getApproaches } from '../utils/approaches';
import { getTopicsFor } from '../utils/topics';
import { getPatternName } from '../utils/patterns';

/**
 * The manifest is generated (npm run manifest) and committed, so it CAN drift from the source.
 * These tests are what make that safe: they compare every committed field against the real
 * algorithm objects, so a problem added or edited without regenerating fails CI rather than
 * quietly showing stale metadata in the sidebar.
 */
describe('manifest matches the source of truth', () => {
  it('covers exactly the same categories, in the same order', () => {
    expect(metaCategories.map((c) => c.id)).toEqual(categories.map((c) => c.id));
    expect(metaCategories.map((c) => c.algorithms.length)).toEqual(
      categories.map((c) => c.algorithms.length)
    );
  });

  const pairs = categories.flatMap((c) => c.algorithms.map((a) => [a.id, a] as const));

  it.each(pairs)('%s — metadata is current', (id, algorithm) => {
    const meta = metaById.get(id);
    expect(meta, `${id} missing from the manifest — run npm run manifest`).toBeDefined();
    expect(meta!.name).toBe(algorithm.name);
    expect(meta!.category).toBe(algorithm.category);
    expect(meta!.difficulty).toBe(algorithm.difficulty);
    expect(meta!.timeComplexity).toBe(algorithm.timeComplexity);
    expect(meta!.spaceComplexity).toBe(algorithm.spaceComplexity);
    expect(meta!.problemUrl).toBe(algorithm.problemUrl);
    expect(meta!.patternName).toBe(getPatternName(algorithm));
    expect(meta!.topics).toEqual(getTopicsFor(algorithm));
  });

  it.each(pairs)('%s — approach metadata is current', (id, algorithm) => {
    const meta = metaById.get(id)!;
    const real = getApproaches(algorithm);
    expect(meta.approaches.map((a) => a.id)).toEqual(real.map((a) => a.id));
    expect(meta.approaches.map((a) => a.name)).toEqual(real.map((a) => a.name));
    expect(meta.approaches.map((a) => a.timeComplexity)).toEqual(real.map((a) => a.timeComplexity));
    expect(meta.approaches.map((a) => a.spaceComplexity)).toEqual(
      real.map((a) => a.spaceComplexity)
    );
  });

  it('has no manifest entry without a real algorithm behind it', () => {
    const realIds = new Set(pairs.map(([id]) => id));
    expect([...metaById.keys()].filter((id) => !realIds.has(id))).toEqual([]);
  });
});

describe('lazy loading', () => {
  it('resolves an implementation by id, with a working generator', async () => {
    const a = await loadAlgorithm('two-sum');
    expect(a.id).toBe('two-sum');
    expect(a.run(a.defaultInput).length).toBeGreaterThan(0);
  });

  it('returns the identical cached object on a second call', async () => {
    const [a, b] = [await loadAlgorithm('valid-anagram'), await loadAlgorithm('valid-anagram')];
    expect(a).toBe(b);
  });

  it('rejects an unknown id rather than resolving undefined', async () => {
    await expect(loadAlgorithm('not-a-real-problem')).rejects.toThrow(/Unknown algorithm id/);
  });
});
