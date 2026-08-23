import type { CategoryMeta } from '../algorithms/manifestTypes';
import type { AudienceId } from '../data/audiences';

/**
 * Narrow the catalogue to problems any of `selected` would ask.
 *
 * Applied once, before the Categories / Patterns / Topics views render, because all three derive
 * their grouping from the same CategoryMeta[]. Filtering here means one insertion point covers
 * every browse axis instead of three separate filters that could drift apart.
 *
 * An empty selection means "no filter" rather than "nothing" — a filter that hides everything by
 * default would look like a broken app.
 */
export function filterByAudience(
  categories: CategoryMeta[],
  selected: AudienceId[]
): CategoryMeta[] {
  if (selected.length === 0) return categories;
  const wanted = new Set(selected);
  return categories
    .map((category) => ({
      ...category,
      algorithms: category.algorithms.filter((a) => a.audiences.some((x) => wanted.has(x))),
    }))
    .filter((category) => category.algorithms.length > 0);
}

/** How many problems match, for the count shown beside the filter. */
export function countByAudience(categories: CategoryMeta[], selected: AudienceId[]): number {
  return filterByAudience(categories, selected).reduce((n, c) => n + c.algorithms.length, 0);
}

/** Does this problem id match the selection? For the review queue, which works in ids. */
export function matchesAudience(
  audiences: AudienceId[],
  selected: AudienceId[]
): boolean {
  if (selected.length === 0) return true;
  return audiences.some((a) => selected.includes(a));
}
