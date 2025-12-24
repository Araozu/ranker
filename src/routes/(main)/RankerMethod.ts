import {
	type SortingAlgorithm,
	type SortingAlgorithmType,
	createSortingAlgorithm,
	ComparisonGraph
} from './sorting';

export interface RankedItem {
	id: string;
	name: string;
	weight: number;
	rank: number;
}

export interface ComparisonPair {
	leftId: string;
	leftName: string;
	rightId: string;
	rightName: string;
}

export type RankerState = 'idle' | 'ranking' | 'done';

/**
 * Internal item with unique ID
 */
interface InternalItem {
	id: string;
	name: string;
}

/**
 * Main ranker class that manages the ranking process.
 * Uses a pluggable sorting algorithm to determine comparison order.
 */
export class RankerMethod {
	private items: InternalItem[] = [];
	private itemsById: Map<string, InternalItem> = new Map();
	private algorithm: SortingAlgorithm;
	private algorithmType: SortingAlgorithmType;
	private comparisonCount = 0;
	private state: RankerState = 'idle';

	// Track weights based on wins/losses
	private wins: Map<string, number> = new Map();
	private losses: Map<string, number> = new Map();

	// For tracking all relationships (used for weight calculation)
	private relationshipGraph: ComparisonGraph;

	constructor(algorithmType: SortingAlgorithmType = 'merge') {
		this.algorithmType = algorithmType;
		this.algorithm = createSortingAlgorithm(algorithmType);
		this.relationshipGraph = new ComparisonGraph();
	}

	/**
	 * Initialize the ranker with a list of item names to rank
	 */
	initialize(names: string[]): void {
		// Create internal items with unique IDs
		this.items = names.map((name, index) => ({
			id: `item-${index}-${Date.now()}`,
			name
		}));
		this.itemsById = new Map(this.items.map((item) => [item.id, item]));

		const ids = this.items.map((item) => item.id);

		this.comparisonCount = 0;
		this.state = this.items.length > 1 ? 'ranking' : 'done';
		this.wins = new Map(ids.map((id) => [id, 0]));
		this.losses = new Map(ids.map((id) => [id, 0]));
		this.relationshipGraph = new ComparisonGraph(ids);

		this.algorithm = createSortingAlgorithm(this.algorithmType);
		this.algorithm.initialize(ids);

		if (this.algorithm.isDone()) {
			this.state = 'done';
		}
	}

	/**
	 * Change the sorting algorithm (resets the ranking process)
	 */
	setAlgorithm(type: SortingAlgorithmType): void {
		this.algorithmType = type;
		if (this.items.length > 0) {
			this.initialize(this.items.map((item) => item.name));
		}
	}

	/**
	 * Get the current algorithm type
	 */
	getAlgorithmType(): SortingAlgorithmType {
		return this.algorithmType;
	}

	/**
	 * Get the current algorithm name
	 */
	getAlgorithmName(): string {
		return this.algorithm.getName();
	}

	/**
	 * Get the next pair to compare, or null if done
	 */
	getNextPair(): ComparisonPair | null {
		if (this.state !== 'ranking') return null;

		const pair = this.algorithm.getNextPair();
		if (!pair) {
			this.state = 'done';
			return null;
		}

		const leftItem = this.itemsById.get(pair[0]);
		const rightItem = this.itemsById.get(pair[1]);

		if (!leftItem || !rightItem) {
			console.error('Invalid pair returned from algorithm:', pair);
			this.state = 'done';
			return null;
		}

		return {
			leftId: leftItem.id,
			leftName: leftItem.name,
			rightId: rightItem.id,
			rightName: rightItem.name
		};
	}

	/**
	 * Submit the result of a comparison (using IDs)
	 */
	submitResult(winnerId: string, loserId: string): void {
		if (this.state !== 'ranking') return;

		// Track the comparison
		this.comparisonCount++;
		this.wins.set(winnerId, (this.wins.get(winnerId) ?? 0) + 1);
		this.losses.set(loserId, (this.losses.get(loserId) ?? 0) + 1);

		// Update relationship graph for weight calculation
		this.relationshipGraph.addResult(winnerId, loserId);

		// Report to algorithm
		this.algorithm.reportResult(winnerId, loserId);

		// Check if done
		if (this.algorithm.isDone()) {
			this.state = 'done';
		}
	}

	/**
	 * Get current state
	 */
	getState(): RankerState {
		return this.state;
	}

	/**
	 * Get number of comparisons made
	 */
	getComparisonCount(): number {
		return this.comparisonCount;
	}

	/**
	 * Get the current ranked items with weights
	 */
	getRankedItems(): RankedItem[] {
		const sortedIds = this.algorithm.getSortedItems();
		const totalItems = sortedIds.length;

		return sortedIds.map((id, index) => {
			const item = this.itemsById.get(id);
			if (!item) {
				return { id, name: 'Unknown', weight: 0, rank: index + 1 };
			}

			// Weight is calculated based on:
			// 1. Position in ranking (higher position = higher weight)
			// 2. Number of items beaten (directly or transitively)
			const beatenCount = this.relationshipGraph.getBeatenBy(id).size;
			const positionWeight = ((totalItems - index) / totalItems) * 50;
			const winsWeight = (beatenCount / Math.max(1, totalItems - 1)) * 50;
			const weight = Math.round(positionWeight + winsWeight);

			return {
				id: item.id,
				name: item.name,
				weight,
				rank: index + 1
			};
		});
	}

	/**
	 * Get just the sorted names
	 */
	getSortedNames(): string[] {
		return this.algorithm.getSortedItems().map((id) => this.itemsById.get(id)?.name ?? 'Unknown');
	}

	/**
	 * Get the original items
	 */
	getItems(): InternalItem[] {
		return [...this.items];
	}

	/**
	 * Check if ranking is complete
	 */
	isDone(): boolean {
		return this.state === 'done';
	}

	/**
	 * Reset the ranker
	 */
	reset(): void {
		this.items = [];
		this.itemsById.clear();
		this.state = 'idle';
		this.comparisonCount = 0;
		this.wins.clear();
		this.losses.clear();
		this.relationshipGraph = new ComparisonGraph();
		this.algorithm = createSortingAlgorithm(this.algorithmType);
	}

	/**
	 * Estimate total comparisons needed (varies by algorithm)
	 */
	estimateTotalComparisons(): number {
		const n = this.items.length;
		if (n <= 1) return 0;

		// Rough estimates based on algorithm type
		switch (this.algorithmType) {
			case 'merge':
				// O(n log n) comparisons
				return Math.ceil(n * Math.log2(n));
			case 'tournament':
				// O(n log n) for full tournament
				return Math.ceil(n * Math.log2(n));
			case 'insertion':
				// O(n log n) with binary search
				return Math.ceil(n * Math.log2(n));
			default:
				return Math.ceil(n * Math.log2(n));
		}
	}

	/**
	 * Get progress as a percentage
	 */
	getProgress(): number {
		if (this.state === 'idle') return 0;
		if (this.state === 'done') return 100;

		const estimated = this.estimateTotalComparisons();
		if (estimated === 0) return 100;

		// Progress can exceed 100% if estimate is off, cap at 99% until done
		return Math.min(99, Math.round((this.comparisonCount / estimated) * 100));
	}
}