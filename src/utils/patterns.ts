import type { Algorithm, Category } from '../types/algorithm';

/** Extract the core pattern name from the pattern hint string */
export function getPatternName(algorithm: Algorithm): string {
  const parts = algorithm.pattern.split(' \u2014 ');
  return parts[0].trim();
}

/** Get all unique patterns with their associated algorithms */
export function getAllPatterns(categories: Category[]): Map<string, Algorithm[]> {
  const patternMap = new Map<string, Algorithm[]>();
  for (const category of categories) {
    for (const algo of category.algorithms) {
      const name = getPatternName(algo);
      const existing = patternMap.get(name) || [];
      existing.push(algo);
      patternMap.set(name, existing);
    }
  }
  return patternMap;
}

/** Get pattern stats given solved problem IDs */
export function getPatternStats(
  categories: Category[],
  solvedIds: string[]
): { name: string; total: number; solved: number }[] {
  const patternMap = getAllPatterns(categories);
  const solvedSet = new Set(solvedIds);

  return Array.from(patternMap.entries())
    .map(([name, algos]) => ({
      name,
      total: algos.length,
      solved: algos.filter((a) => solvedSet.has(a.id)).length,
    }))
    .sort((a, b) => b.total - a.total);
}
