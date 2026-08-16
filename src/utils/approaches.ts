import type { Algorithm, Approach } from '../types/algorithm';

export const OPTIMAL_APPROACH_ID = 'optimal';

// Every algorithm's flat code/run/complexity fields form the final "optimal" approach.
// Extra approaches (brute force, etc.) come first, ordered naive → best.
export function getApproaches(algorithm: Algorithm): Approach[] {
  const optimal: Approach = {
    id: OPTIMAL_APPROACH_ID,
    name: algorithm.optimalApproachName ?? 'Optimal',
    timeComplexity: algorithm.timeComplexity,
    spaceComplexity: algorithm.spaceComplexity,
    code: algorithm.code,
    run: algorithm.run,
    lineExplanations: algorithm.lineExplanations,
  };
  return [...(algorithm.approaches ?? []), optimal];
}

export function getActiveApproach(algorithm: Algorithm, approachId: string): Approach {
  const approaches = getApproaches(algorithm);
  return approaches.find((a) => a.id === approachId) ?? approaches[approaches.length - 1];
}
