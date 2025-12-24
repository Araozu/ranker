import { ComparisonGraph, type SortingAlgorithm } from './SortingAlgorithm';

/**
 * Binary Insertion Sort algorithm.
 * Inserts each item into the correct position using binary search.
 * Leverages transitive relationships to skip known comparisons.
 */
export class InsertionSortAlgorithm implements SortingAlgorithm {
	private graph: ComparisonGraph = new ComparisonGraph();
	private unsorted: string[] = [];
	private sorted: string[] = [];
	private done = false;

	// Current insertion state
	private currentItem: string | null = null;
	private low = 0;
	private high = 0;
	private mid = 0;

	getName(): string {
		return 'Binary Insertion';
	}

	initialize(items: string[]): void {
		this.graph = new ComparisonGraph(items);
		this.unsorted = [...items];
		this.sorted = [];
		this.done = false;
		this.currentItem = null;

		if (items.length <= 1) {
			this.sorted = [...items];
			this.done = true;
			return;
		}

		// Start with first item in sorted array
		this.sorted.push(this.unsorted.shift()!);
		this.startNextInsertion();
	}

	private startNextInsertion(): void {
		if (this.unsorted.length === 0) {
			this.done = true;
			this.currentItem = null;
			return;
		}

		this.currentItem = this.unsorted.shift()!;
		this.low = 0;
		this.high = this.sorted.length;
		this.findNextComparison();
	}

	private findNextComparison(): void {
		// Binary search to find insertion point
		while (this.low < this.high) {
			this.mid = Math.floor((this.low + this.high) / 2);
			const midItem = this.sorted[this.mid];

			// Check if relationship is already known
			if (this.graph.isKnown(this.currentItem!, midItem)) {
				if (this.graph.beats_(this.currentItem!, midItem)) {
					// Current item is better, search left half
					this.high = this.mid;
				} else {
					// Mid item is better, search right half
					this.low = this.mid + 1;
				}
			} else {
				// Need user input for this comparison
				return;
			}
		}

		// Found insertion point, insert the item
		this.sorted.splice(this.low, 0, this.currentItem!);
		this.startNextInsertion();
	}

	getNextPair(): [string, string] | null {
		if (this.done || !this.currentItem) return null;

		if (this.low >= this.high) {
			// Insertion point found
			this.sorted.splice(this.low, 0, this.currentItem);
			this.startNextInsertion();
			return this.getNextPair();
		}

		const midItem = this.sorted[this.mid];
		return [this.currentItem, midItem];
	}

	reportResult(winner: string, loser: string): void {
		this.graph.addResult(winner, loser);

		if (!this.currentItem) return;

		// Update binary search bounds based on result
		if (winner === this.currentItem) {
			// Current item is better, search left half
			this.high = this.mid;
		} else {
			// Mid item is better, search right half
			this.low = this.mid + 1;
		}

		// Continue binary search
		this.findNextComparison();
	}

	isDone(): boolean {
		return this.done;
	}

	getSortedItems(): string[] {
		if (this.done) {
			return this.sorted;
		}
		// Return current sorted + remaining unsorted by graph score
		const remainingSorted = [
			...(this.currentItem ? [this.currentItem] : []),
			...this.unsorted
		].sort((a, b) => {
			const aScore = this.graph.getBeatenBy(a).size;
			const bScore = this.graph.getBeatenBy(b).size;
			return bScore - aScore;
		});

		return [...this.sorted, ...remainingSorted];
	}
}
