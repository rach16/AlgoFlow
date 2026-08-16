export type ActionType = 'compare' | 'swap' | 'insert' | 'delete' | 'found' | 'visit' | 'push' | 'pop';

export interface AlgorithmStep {
  state: number[] | string[] | Record<string, unknown>;
  highlights: number[];
  pointers?: Record<string, number>;
  message: string;
  codeLine: number;
  action?: ActionType;
  secondary?: number[]; // Secondary highlights (e.g., for comparisons)
}

export interface Approach {
  id: string;
  name: string; // e.g. "Brute Force", "Sorting", "Hash Map"
  timeComplexity: string;
  spaceComplexity: string;
  description?: string;
  code: {
    python: string;
    javascript: string;
    java: string;
  };
  run: (input: unknown) => AlgorithmStep[];
  lineExplanations?: {
    python: Record<number, string>;
    javascript: Record<number, string>;
    java: Record<number, string>;
  };
}

export interface Algorithm {
  id: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  pattern: string; // Cheat-sheet hint: what technique / data structure to recognize & use
  problemUrl?: string;
  code: {
    python: string;
    javascript: string;
    java: string;
  };
  defaultInput: unknown;
  run: (input: unknown) => AlgorithmStep[];
  lineExplanations?: {
    python: Record<number, string>;
    javascript: Record<number, string>;
    java: Record<number, string>;
  };
  // Alternate solutions (e.g. brute force), ordered naive → best.
  // The algorithm's own flat code/run/complexity fields act as the final "optimal" approach.
  approaches?: Approach[];
  // Tab label for the flat/default solution (defaults to "Optimal")
  optimalApproachName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  algorithms: Algorithm[];
}
