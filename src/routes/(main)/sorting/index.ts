export { ComparisonGraph, type SortingAlgorithm, type ComparisonResult } from './SortingAlgorithm';
export { MergeSortAlgorithm } from './MergeSortAlgorithm';
export { TournamentSortAlgorithm } from './TournamentSortAlgorithm';
export { InsertionSortAlgorithm } from './InsertionSortAlgorithm';

import { MergeSortAlgorithm } from './MergeSortAlgorithm';
import { TournamentSortAlgorithm } from './TournamentSortAlgorithm';
import { InsertionSortAlgorithm } from './InsertionSortAlgorithm';
import type { SortingAlgorithm } from './SortingAlgorithm';

/**
 * Available sorting algorithm types
 */
export type SortingAlgorithmType = 'merge' | 'tournament' | 'insertion';

/**
 * Factory function to create sorting algorithm instances
 */
export function createSortingAlgorithm(type: SortingAlgorithmType): SortingAlgorithm {
	switch (type) {
		case 'merge':
			return new MergeSortAlgorithm();
		case 'tournament':
			return new TournamentSortAlgorithm();
		case 'insertion':
			return new InsertionSortAlgorithm();
		default:
			throw new Error(`Unknown sorting algorithm: ${type}`);
	}
}

/**
 * Get all available algorithm types with their display names
 */
export function getAvailableAlgorithms(): { type: SortingAlgorithmType; name: string }[] {
	return [
		{ type: 'merge', name: 'Merge Sort' },
		{ type: 'tournament', name: 'Tournament' },
		{ type: 'insertion', name: 'Binary Insertion' }
	];
}
