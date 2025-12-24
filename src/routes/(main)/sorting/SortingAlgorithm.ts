/**
 * Represents the result of a pairwise comparison
 */
export interface ComparisonResult {
	winner: string;
	loser: string;
}

/**
 * Interface for sorting algorithms that work via pairwise comparisons.
 * The algorithm decides which pairs to compare and maintains internal state.
 */
export interface SortingAlgorithm {
	/**
	 * Initialize the algorithm with items to sort
	 */
	initialize(items: string[]): void;

	/**
	 * Get the next pair of items to compare.
	 * Returns null if sorting is complete.
	 */
	getNextPair(): [string, string] | null;

	/**
	 * Report the result of a comparison (winner beats loser)
	 */
	reportResult(winner: string, loser: string): void;

	/**
	 * Check if the sorting process is complete
	 */
	isDone(): boolean;

	/**
	 * Get the final sorted items (from best to worst)
	 */
	getSortedItems(): string[];

	/**
	 * Get the name of this algorithm
	 */
	getName(): string;
}

/**
 * Tracks comparison results and computes transitive relationships.
 * If A > B and B > C, then A > C is automatically inferred.
 */
export class ComparisonGraph {
	// Map from item to set of items it beats (directly or transitively)
	private beats: Map<string, Set<string>> = new Map();
	// All items in the graph
	private items: Set<string> = new Set();

	constructor(items: string[] = []) {
		for (const item of items) {
			this.addItem(item);
		}
	}

	addItem(item: string): void {
		if (!this.beats.has(item)) {
			this.beats.set(item, new Set());
		}
		this.items.add(item);
	}

	/**
	 * Record that winner beats loser, and compute transitive closure
	 */
	addResult(winner: string, loser: string): void {
		this.addItem(winner);
		this.addItem(loser);

		const winnerBeats = this.beats.get(winner)!;

		// Winner now beats loser
		winnerBeats.add(loser);

		// Winner also beats everything loser beats (transitivity forward)
		const loserBeats = this.beats.get(loser)!;
		for (const item of loserBeats) {
			winnerBeats.add(item);
		}

		// Everything that beats winner also beats loser (transitivity backward)
		for (const [, itemBeats] of this.beats) {
			if (itemBeats.has(winner)) {
				itemBeats.add(loser);
				// And also beats everything loser beats
				for (const loserBeat of loserBeats) {
					itemBeats.add(loserBeat);
				}
			}
		}
	}

	/**
	 * Check if the relationship between a and b is already known
	 */
	isKnown(a: string, b: string): boolean {
		const aBeats = this.beats.get(a);
		const bBeats = this.beats.get(b);

		if (!aBeats || !bBeats) return false;

		return aBeats.has(b) || bBeats.has(a);
	}

	/**
	 * Check if a beats b (directly or transitively)
	 */
	beats_(a: string, b: string): boolean {
		return this.beats.get(a)?.has(b) ?? false;
	}

	/**
	 * Get all items that the given item beats
	 */
	getBeatenBy(item: string): Set<string> {
		return this.beats.get(item) ?? new Set();
	}

	/**
	 * Get sorted items based on how many items each beats
	 */
	getSortedItems(): string[] {
		return Array.from(this.items).sort((a, b) => {
			const aBeatsCount = this.beats.get(a)?.size ?? 0;
			const bBeatsCount = this.beats.get(b)?.size ?? 0;
			return bBeatsCount - aBeatsCount; // Descending order
		});
	}

	/**
	 * Get all items
	 */
	getItems(): string[] {
		return Array.from(this.items);
	}

	/**
	 * Get the number of items
	 */
	size(): number {
		return this.items.size;
	}
}
