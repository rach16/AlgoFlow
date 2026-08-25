import { describe, it, expect } from 'vitest';
import { REFERENCE_ENTRIES } from './searchIndex';
import { SECTIONS, type AppView } from '../components/layout/navigation';

const ALL_VIEWS = new Set<AppView>(SECTIONS.flatMap((s) => s.views.map((v) => v.id)));

describe('search index', () => {
  it('indexes every non-problem section of the site', () => {
    const views = new Set(REFERENCE_ENTRIES.map((e) => e.view));
    for (const view of [
      'testdesign',
      'testability',
      'craft',
      'flake',
      'ai',
      'aifeatures',
      'sql',
      'build',
      'behavioral',
    ] as AppView[]) {
      expect(views.has(view), `nothing in the index points at "${view}"`).toBe(true);
    }
    expect(REFERENCE_ENTRIES.length).toBeGreaterThan(80);
  });

  // A result that navigates to a view no section owns would be a dead end in the palette.
  it('only points at views that exist', () => {
    for (const e of REFERENCE_ENTRIES) {
      expect(ALL_VIEWS.has(e.view), `${e.id} -> ${e.view}`).toBe(true);
    }
  });

  it('keeps ids unique, since the palette keys rows on them', () => {
    expect(new Set(REFERENCE_ENTRIES.map((e) => e.id)).size).toBe(REFERENCE_ENTRIES.length);
  });

  /**
   * The scorer requires every query token to land somewhere in the haystack, and ranks on the
   * title. An entry with an empty title can never be matched above a haystack hit, and one whose
   * haystack omits its own title can be ranked but never found.
   */
  it('gives every entry a title, a subtitle and a haystack containing both', () => {
    for (const e of REFERENCE_ENTRIES) {
      expect(e.title.trim().length, e.id).toBeGreaterThan(0);
      expect(e.subtitle.trim().length, e.id).toBeGreaterThan(0);
      expect(e.haystack, e.id).toContain(e.title.toLowerCase());
      expect(e.haystack, e.id).toBe(e.haystack.toLowerCase());
      expect(e.section.trim().length, e.id).toBeGreaterThan(0);
    }
  });

  // The rows are single-line and truncate. A title long enough to be clipped to nothing useful is
  // worse than one that was trimmed at the source.
  it('keeps titles and subtitles short enough to render on one line', () => {
    for (const e of REFERENCE_ENTRIES) {
      expect(e.title.length, `${e.id}: "${e.title}"`).toBeLessThanOrEqual(75);
      expect(e.subtitle.length, e.id).toBeLessThanOrEqual(115);
    }
  });

  // Mirrors the palette's scorer: it splits on whitespace and requires every token to appear
  // somewhere, so "token bucket" finds an entry titled "A token-bucket rate limiter".
  it('finds the things somebody would actually search for', () => {
    const has = (term: string) => {
      const tokens = term.toLowerCase().split(/\s+/);
      return REFERENCE_ENTRIES.some((e) => tokens.every((t) => e.haystack.includes(t)));
    };
    for (const term of [
      'mutation',
      'prompt injection',
      'token bucket',
      'left join',
      'flaky',
      'page object',
      'boundary',
      'getByRole',
      'p95',
    ]) {
      expect(has(term), `"${term}" matches nothing in the index`).toBe(true);
    }
  });
});
