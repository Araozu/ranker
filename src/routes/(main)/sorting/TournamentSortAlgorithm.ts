import { ComparisonGraph, type SortingAlgorithm } from './SortingAlgorithm';

/**
 * Tournament-style sorting algorithm.
 * Finds the best item, removes it, repeats.
 * Leverages transitive relationships to minimize comparisons.
 */
export class TournamentSortAlgorithm implements SortingAlgorithm {
	private graph: ComparisonGraph = new ComparisonGraph();
	private remaining: string[] = [];
	private sorted: string[] = [];
	private done = false;

	// Current tournament state
	private currentRound: string[] = [];
	private nextRound: string[] = [];
	private currentPairIndex = 0;

	getName(): string {
		return 'Tournament';
	}

	initialize(items: string[]): void {
		this.graph = new ComparisonGraph(items);
		this.remaining = [...items];
		this.sorted = [];
		this.done = false;

		if (items.length <= 1) {
			this.sorted = [...items];
			this.done = true;
			return;
		}

		this.startNewTournament();
	}

	private startNewTournament(): void {
		// Shuffle remaining items for fairness
		this.currentRound = [...this.remaining];
		this.nextRound = [];
		this.currentPairIndex = 0;
	}

	getNextPair(): [string, string] | null {
		if (this.done) return null;

		while (true) {
			// Check if current round is complete
			if (this.currentPairIndex >= this.currentRound.length) {
				// Move to next round
				if (this.nextRound.length === 1) {
					// Tournament winner found!
					const winner = this.nextRound[0];
					this.sorted.push(winner);
					this.remaining = this.remaining.filter((item) => item !== winner);

					if (this.remaining.length === 0) {
						this.done = true;
						return null;
					}

					if (this.remaining.length === 1) {
						this.sorted.push(this.remaining[0]);
						this.done = true;
						return null;
					}

					// Start new tournament for remaining items
					this.startNewTournament();
					continue;
				}

				// Move to next round of current tournament
				this.currentRound = this.nextRound;
				this.nextRound = [];
				this.currentPairIndex = 0;
			}

			// Handle odd item
			if (this.currentPairIndex + 1 >= this.currentRound.length) {
				// Odd item advances automatically
				this.nextRound.push(this.currentRound[this.currentPairIndex]);
				this.currentPairIndex += 2;
				continue;
			}

			const a = this.currentRound[this.currentPairIndex];
			const b = this.currentRound[this.currentPairIndex + 1];

			// Check if relationship is already known
			if (this.graph.isKnown(a, b)) {
				// Use known relationship
				const winner = this.graph.beats_(a, b) ? a : b;
				this.nextRound.push(winner);
				this.currentPairIndex += 2;
				continue;
			}

			// Need user input
			return [a, b];
		}
	}

	reportResult(winner: string, loser: string): void {
		this.graph.addResult(winner, loser);

		// Advance in tournament
		this.nextRound.push(winner);
		this.currentPairIndex += 2;
	}

	isDone(): boolean {
		return this.done;
	}

	getSortedItems(): string[] {
		if (this.done) {
			return this.sorted;
		}
		// Return current partial result + remaining by graph score
		const remainingSorted = this.graph
			.getSortedItems()
			.filter((item) => this.remaining.includes(item));
		return [...this.sorted, ...remainingSorted];
	}
}
