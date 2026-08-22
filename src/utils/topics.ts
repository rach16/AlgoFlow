import type { Algorithm } from '../types/algorithm';
import type { AlgorithmMeta, CategoryMeta } from '../algorithms/manifestTypes';

/**
 * Topics group problems by WHAT THE INPUT IS, which is a third axis the app was missing:
 *
 *   Categories -> NeetCode's chapters   (where the problem lives in the curriculum)
 *   Patterns   -> the technique         (two pointers, monotonic stack, ...)
 *   Topics     -> the data type         (strings, grids, numbers, ...)
 *
 * This exists because string problems in particular had no home: NeetCode 250 has no Strings
 * chapter, so its ~47 string problems are spread across Arrays & Hashing, Two Pointers,
 * Sliding Window, Stack, DP, Backtracking, Greedy, Graphs and more. Someone who wants to drill
 * strings could not find them.
 *
 * Classification reads `defaultInput`, since that is the problem's actual input shape and needs
 * no execution. A problem can belong to several topics — Word Search is both a grid and a
 * string problem, and that is correct.
 */

export type TopicId =
  | 'strings' | 'grids' | 'numbers' | 'linked-lists' | 'trees' | 'graphs' | 'intervals' | 'design';

export interface Topic {
  id: TopicId;
  name: string;
  icon: string;
  blurb: string;
}

export const TOPICS: Topic[] = [
  { id: 'strings',      name: 'Strings',      icon: '🔤', blurb: 'Input is a string or list of strings' },
  { id: 'grids',        name: 'Grids & Matrices', icon: '🔲', blurb: 'Input is a 2-D array' },
  { id: 'numbers',      name: 'Numbers & Arrays', icon: '🔢', blurb: 'Input is numeric — an array or a single value' },
  { id: 'linked-lists', name: 'Linked Lists', icon: '🔗', blurb: 'Built on next-pointer traversal' },
  { id: 'trees',        name: 'Trees',        icon: '🌳', blurb: 'Binary trees and BSTs' },
  { id: 'graphs',       name: 'Graphs',       icon: '🕸️', blurb: 'Nodes and edges, including grid-as-graph' },
  { id: 'intervals',    name: 'Intervals',    icon: '📏', blurb: 'Pairs of start/end values' },
  { id: 'design',       name: 'Design',       icon: '🏗️', blurb: 'Implement a data structure or class' },
];

const isStringLike = (v: unknown): boolean =>
  typeof v === 'string' || (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string'));

const is2D = (v: unknown): boolean =>
  Array.isArray(v) && v.length > 0 && v.every((row) => Array.isArray(row));

const isNumericArray = (v: unknown): boolean =>
  Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'number');

/**
 * Shape alone is not enough to classify a 2-D array, because three very different things share
 * the shape [[a, b], [c, d]]:
 *   - a grid            (matrix, board, image)
 *   - an interval list  (start/end pairs)
 *   - a graph edge list (from/to pairs)
 * ...and design problems pass an operation script that also looks 2-D. So the field NAME
 * decides, and shape is only the fallback for a bare, unnamed input.
 */
const GRID_FIELD = /^(matrix|grid|board|image|heights|rooms|mat|land|isConnected)$/i;
// NB: not `times` — Network Delay Time's `times` is a [u, v, w] edge list, not intervals.
const INTERVAL_FIELD = /^(intervals|meetings|schedule|newInterval)$/i;
/** Operation scripts for design problems — not data, and not a grid. */
const OPS_FIELD = /^(operations|ops|commands|calls|queries|actions)$/i;

/**
 * Whether a bare, unnamed 2-D input is really a grid. Three lookalikes have to be excluded:
 *   [[1,4,5],[1,3,4],[2,6]]           ragged  -> a list of lists (Merge K Sorted Lists)
 *   [[1,2],[2,4],[3,2]]               2 wide  -> pairs (Single Threaded CPU, edge lists)
 *   [["push",5],["push",7]]           mixed   -> an operation script (Maximum Frequency Stack)
 * A real grid is rectangular, at least 3 columns wide, and uniform in cell type.
 */
function isGridShaped(v: unknown): boolean {
  if (!is2D(v)) return false;
  const rows = v as unknown[][];
  const width = rows[0].length;
  if (width < 3) return false;
  if (!rows.every((r) => r.length === width)) return false;
  const cellTypes = new Set(rows.flat().map((c) => typeof c));
  return cellTypes.size === 1;
}

/**
 * Design problems drive a scripted sequence of operations rather than transforming one input.
 * The reliable signal is the solution declaring a class, not the title — "Maximum Frequency
 * Stack" and "Detect Squares" are designs whose names say nothing about it.
 */
const isDesignProblem = (algorithm: Algorithm): boolean =>
  /^class\s+\w/m.test(algorithm.code.python) || /^(design|implement)/i.test(algorithm.name);

export function getTopicsFor(algorithm: Algorithm): TopicId[] {
  const topics = new Set<TopicId>();
  const input = algorithm.defaultInput;
  const isObject = input !== null && typeof input === 'object' && !Array.isArray(input);
  const entries: [string, unknown][] = isObject
    ? Object.entries(input as Record<string, unknown>)
    : [['', input]];

  if (isDesignProblem(algorithm)) topics.add('design');

  for (const [key, v] of entries) {
    if (isStringLike(v)) topics.add('strings');
    if (isNumericArray(v) || typeof v === 'number') topics.add('numbers');
    // 2-D numeric data (coordinate pairs, weighted edges) is still numbers, not a grid
    else if (is2D(v) && (v as unknown[][]).flat().every((c) => typeof c === 'number')) {
      topics.add('numbers');
    }

    if (OPS_FIELD.test(key)) continue; // an operation script is neither a grid nor data
    if (GRID_FIELD.test(key)) topics.add('grids');
    else if (INTERVAL_FIELD.test(key)) topics.add('intervals');
    else if (key === '' && isGridShaped(v)) topics.add('grids');
  }

  // Category is authoritative for the structural topics: these problems receive a serialised
  // array and build the real structure internally, so the input shape says nothing useful.
  const category = algorithm.category.toLowerCase();
  if (category.includes('linked list')) topics.add('linked-lists');
  if (category.includes('tree')) topics.add('trees');
  if (category.includes('graph')) topics.add('graphs');
  if (category.includes('interval')) topics.add('intervals');
  if (category.includes('trie')) topics.add('strings');

  return TOPICS.map((t) => t.id).filter((id) => topics.has(id));
}

export interface TopicStat extends Topic {
  total: number;
  solved: number;
  algorithms: AlgorithmMeta[];
}

/**
 * Bucket problems by topic using the manifest's precomputed `topics`. Classification itself
 * needs defaultInput and the source (see getTopicsFor), which is exactly why it is precomputed
 * at generation time rather than run here.
 */
export function getTopicStats(categories: CategoryMeta[], solvedIds: string[]): TopicStat[] {
  const solvedSet = new Set(solvedIds);
  const buckets = new Map<TopicId, AlgorithmMeta[]>();

  for (const category of categories) {
    for (const algorithm of category.algorithms) {
      for (const topicId of algorithm.topics) {
        const list = buckets.get(topicId) ?? [];
        list.push(algorithm);
        buckets.set(topicId, list);
      }
    }
  }

  return TOPICS.map((topic) => {
    const algorithms = buckets.get(topic.id) ?? [];
    return {
      ...topic,
      algorithms,
      total: algorithms.length,
      solved: algorithms.filter((a) => solvedSet.has(a.id)).length,
    };
  })
    .filter((t) => t.total > 0)
    .sort((a, b) => b.total - a.total);
}
