import { describe, it, expect } from 'vitest';
import {
  SECTIONS,
  DEFAULT_VIEW,
  sectionForView,
  entryViewFor,
  type AppView,
} from './navigation';

/** Every member of the AppView union, listed so the compiler fails if one is added. */
const ALL_VIEWS: AppView[] = [
  'visualizer', 'sdet', 'complexity', 'methods', 'drill', 'testdesign', 'testability',
  'craft', 'flake', 'toolqa', 'ai', 'aifeatures', 'sql', 'build', 'behavioral', 'review',
];

describe('navigation', () => {
  it('places every view in exactly one section', () => {
    for (const view of ALL_VIEWS) {
      const owners = SECTIONS.filter((s) => s.views.some((v) => v.id === view));
      expect(owners.map((s) => s.id), `view "${view}"`).toHaveLength(1);
    }
  });

  it('has no view that no section claims', () => {
    const claimed = SECTIONS.flatMap((s) => s.views.map((v) => v.id));
    expect([...claimed].sort()).toEqual([...ALL_VIEWS].sort());
  });

  it('resolves each view back to its section', () => {
    for (const view of ALL_VIEWS) {
      expect(sectionForView(view).views.map((v) => v.id)).toContain(view);
    }
  });

  it('gives every section a landing view', () => {
    for (const section of SECTIONS) {
      expect(section.views.length).toBeGreaterThan(0);
      expect(ALL_VIEWS).toContain(entryViewFor(section));
    }
  });

  it('opens on a view that exists', () => {
    expect(ALL_VIEWS).toContain(DEFAULT_VIEW);
    expect(sectionForView(DEFAULT_VIEW).id).toBe('practice');
  });

  it('uses unique section ids and labels', () => {
    expect(new Set(SECTIONS.map((s) => s.id)).size).toBe(SECTIONS.length);
    expect(new Set(SECTIONS.map((s) => s.label)).size).toBe(SECTIONS.length);
  });
});
