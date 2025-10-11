export * from './algorithms';
export type { RankedItem } from './algorithms/RankingAlgorithm';

import { MergeSortRanking } from './algorithms';

/**
 * Factory function to create ranking algorithms by name
 */
export function createRankingAlgorithm(name: 'merge-sort'): import('./algorithms').RankingAlgorithm {
  switch (name) {
    case 'merge-sort':
      return new MergeSortRanking();
    default:
      throw new Error(`Unknown ranking algorithm: ${name}`);
  }
}

/**
 * Available ranking algorithms
 */
export const RANKING_ALGORITHMS = {
  'merge-sort': 'Merge Sort',
} as const;

export type RankingAlgorithmName = keyof typeof RANKING_ALGORITHMS;
