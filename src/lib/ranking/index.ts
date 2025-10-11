export * from './algorithms';

import { InsertionSortRanking, MergeSortRanking } from './algorithms';

/**
 * Factory function to create ranking algorithms by name
 */
export function createRankingAlgorithm(name: 'insertion-sort' | 'merge-sort'): import('./algorithms').RankingAlgorithm {
  switch (name) {
    case 'insertion-sort':
      return new InsertionSortRanking();
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
  'insertion-sort': 'Insertion Sort',
  'merge-sort': 'Merge Sort (Tournament)',
} as const;

export type RankingAlgorithmName = keyof typeof RANKING_ALGORITHMS;
