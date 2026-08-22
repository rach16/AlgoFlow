import type { Algorithm } from '../types/algorithm';
import type { AlgorithmMeta, CategoryMeta } from '../algorithms/manifestTypes';

/** Extract the core pattern name from the pattern hint string */
export function getPatternName(algorithm: Algorithm): string {
  const parts = algorithm.pattern.split(' \u2014 ');
  return parts[0].trim();
}

/**
 * Group problems by pattern. Operates on metadata rather than full algorithms so the Patterns
 * view never triggers 254 module loads — `patternName` is precomputed in the manifest.
 */
export function getAllPatterns(categories: CategoryMeta[]): Map<string, AlgorithmMeta[]> {
  const patternMap = new Map<string, AlgorithmMeta[]>();
  for (const category of categories) {
    for (const algo of category.algorithms) {
      const existing = patternMap.get(algo.patternName) || [];
      existing.push(algo);
      patternMap.set(algo.patternName, existing);
    }
  }
  return patternMap;
}

export interface PatternStat {
  name: string;
  total: number;
  solved: number;
  /** The problems using this pattern, so the UI can list them without recomputing the map. */
  algorithms: AlgorithmMeta[];
}

/** Get pattern stats given solved problem IDs */
export function getPatternStats(categories: CategoryMeta[], solvedIds: string[]): PatternStat[] {
  const patternMap = getAllPatterns(categories);
  const solvedSet = new Set(solvedIds);

  return Array.from(patternMap.entries())
    .map(([name, algos]) => ({
      name,
      total: algos.length,
      solved: algos.filter((a) => solvedSet.has(a.id)).length,
      algorithms: algos,
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}
