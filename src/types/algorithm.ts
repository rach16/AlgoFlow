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
  };
  defaultInput: unknown;
  run: (input: unknown) => AlgorithmStep[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  algorithms: Algorithm[];
}
