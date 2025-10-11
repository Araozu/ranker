export * from './algorithms';

import { InsertionSortRanking } from './algorithms';

/**
 * Factory function to create ranking algorithms by name
 */
export function createRankingAlgorithm(name: 'insertion-sort'): import('./algorithms').RankingAlgorithm {
  switch (name) {
    case 'insertion-sort':
      return new InsertionSortRanking();
    default:
      throw new Error(`Unknown ranking algorithm: ${name}`);
  }
}

/**
 * Available ranking algorithms
 */
export const RANKING_ALGORITHMS = {
  'insertion-sort': 'Insertion Sort',
} as const;

export type RankingAlgorithmName = keyof typeof RANKING_ALGORITHMS;
