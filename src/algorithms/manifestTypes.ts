import type { TopicId } from '../utils/topics';

/** One approach's metadata — enough for tabs and complexity badges without its source. */
export interface ApproachMeta {
  id: string;
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
}

/**
 * Everything the app needs about a problem WITHOUT loading its implementation: enough for the
 * sidebar, search, patterns, topics, the review queue and the complexity listing. The heavy
 * parts (source in three languages, the step generator, line explanations) live in the module
 * named by `module` and are imported on demand.
 */
export interface AlgorithmMeta {
  id: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  /**
   * Pattern up to the em-dash, precomputed so grouping needs no parsing at runtime.
   * The full pattern string and the description are deliberately NOT here — they are only ever
   * shown for the currently selected problem, which is fully loaded anyway.
   */
  patternName: string;
  problemUrl?: string;
  timeComplexity: string;
  spaceComplexity: string;
  /** precomputed, because deriving topics needs defaultInput and the source */
  topics: TopicId[];
  /** module path for the registry's lazy import */
  module: string;
  approaches: ApproachMeta[];
}

export interface CategoryMeta {
  id: string;
  name: string;
  icon: string;
  algorithms: AlgorithmMeta[];
}
