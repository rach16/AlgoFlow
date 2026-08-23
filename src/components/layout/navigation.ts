/**
 * The site's navigation model, in one place.
 *
 * Navigation is two levels: a handful of top-level sections, each holding one or more views.
 * Flat tabs worked while there were five of them, but SDETPrep grows a Tools and a Behavioral
 * section, and Complexity and Methods are reference material you consult mid-problem rather
 * than destinations — so they belong under Practice, not beside it.
 *
 * `AppView` stays flat because that is what actually selects a page; the sections only describe
 * how the views are grouped for navigation.
 */

export type AppView =
  | 'visualizer'
  | 'sdet'
  | 'complexity'
  | 'methods'
  | 'drill'
  | 'behavioral'
  | 'review';

export type SectionId = 'practice' | 'coding' | 'drill' | 'behavioral' | 'review';

export interface NavView {
  id: AppView;
  label: string;
}

export interface NavSection {
  id: SectionId;
  label: string;
  views: NavView[];
}

export const SECTIONS: NavSection[] = [
  {
    id: 'practice',
    label: 'Practice',
    views: [
      // The visualizer keeps the AlgoFlow name — it is the part of the site that earned one.
      { id: 'visualizer', label: 'AlgoFlow' },
      { id: 'complexity', label: 'Complexity' },
      { id: 'methods', label: 'Methods' },
    ],
  },
  {
    id: 'coding',
    label: 'Coding round',
    views: [{ id: 'sdet', label: 'Coding round' }],
  },
  {
    id: 'drill',
    label: 'Drill',
    views: [{ id: 'drill', label: 'Drill' }],
  },
  {
    id: 'behavioral',
    label: 'Behavioral',
    views: [{ id: 'behavioral', label: 'Behavioral' }],
  },
  {
    id: 'review',
    label: 'Review',
    views: [{ id: 'review', label: 'Review' }],
  },
];

export const DEFAULT_VIEW: AppView = 'visualizer';

/** The section a view lives in. Every view belongs to exactly one; navigation.test.ts proves it. */
export function sectionForView(view: AppView): NavSection {
  const section = SECTIONS.find((s) => s.views.some((v) => v.id === view));
  if (!section) throw new Error(`No section contains the view "${view}"`);
  return section;
}

/** Where clicking a top-level section lands you. */
export function entryViewFor(section: NavSection): AppView {
  return section.views[0].id;
}
