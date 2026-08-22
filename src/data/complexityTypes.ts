/**
 * The tiny, dependency-free half of the complexity data.
 *
 * `noteKey` and the types live here rather than in complexity.ts on purpose: importing ANY value
 * from complexity.ts drags in the whole 450 KB of derivations, which put every note in the main
 * bundle even though the Why? panel loads them on demand. Keeping the key helper separate means
 * the visualizer can compute a key without pulling the data.
 */

export interface ComplexityNote {
  time: string[];
  space: string[];
  gotcha?: string;
}

export interface MethodSection {
  id: string;
  title: string;
  intro: string;
  rows?: { left: string; right: string }[];
  notes?: string[];
}

/** Key format for COMPLEXITY_NOTES: the algorithm id and the approach id. */
export const noteKey = (algorithmId: string, approachId: string) => `${algorithmId}:${approachId}`;
