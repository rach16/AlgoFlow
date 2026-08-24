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
  | 'testdesign'
  | 'testability'
  | 'craft'
  | 'flake'
  | 'ai'
  | 'aifeatures'
  | 'behavioral'
  | 'review';

export type SectionId =
  | 'practice'
  | 'coding'
  | 'drill'
  | 'testdesign'
  | 'craft'
  | 'ai'
  | 'behavioral'
  | 'review';

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
    // Two views, because the exercises are something you do and the reference is something you
    // read — mixing them on one page buries the part that needs your attention.
    id: 'testdesign',
    label: 'Test design',
    views: [
      { id: 'testdesign', label: 'Exercises' },
      { id: 'testability', label: 'Testability' },
    ],
  },
  {
    // The reference and the animations are different modes — one is read, one is driven — so they
    // are separate views rather than one very long page.
    id: 'craft',
    label: 'Craft',
    views: [
      { id: 'craft', label: 'Tooling' },
      { id: 'flake', label: 'Flake lab' },
    ],
  },
  {
    // Both directions of the same question, and they are genuinely different work — one is about
    // what you hand to a model, the other about testing a feature a model powers.
    id: 'ai',
    label: 'AI',
    views: [
      { id: 'ai', label: 'Using AI' },
      { id: 'aifeatures', label: 'Testing AI' },
    ],
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
