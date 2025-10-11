import type { RankingAlgorithm } from './RankingAlgorithm';
import { shuffleArray } from '../../utils';

/**
 * Abstract base class for ranking algorithms
 */
export abstract class AbstractRankingAlgorithm implements RankingAlgorithm {
  protected items: string[] = [];
  protected rankedItems: string[] = [];

  initialize(items: string[]): void {
    // Shuffle the input items to randomize the comparison order
    this.items = shuffleArray([...items]);
    this.rankedItems = [];
    this.reset();
  }

  abstract getNextComparison(): [string, string] | null;
  abstract submitComparison(winner: string, loser: string): void;

  getRankedItems(): string[] {
    // Return items in reverse order so the most preferred (best) item appears first
    return [...this.rankedItems].reverse();
  }

  abstract isComplete(): boolean;

  getProgress(): number {
    if (this.items.length === 0) return 100;
    return Math.round((this.rankedItems.length / this.items.length) * 100);
  }

  abstract getCurrentState(): string;

  /**
   * Reset algorithm state - called during initialization
   */
  protected abstract reset(): void;

  /**
   * Validate that both items exist in the current item set
   */
  protected validateComparison(winner: string, loser: string): void {
    const allItems = [...this.items, ...this.rankedItems];
    if (!allItems.includes(winner)) {
      throw new Error(`Winner "${winner}" is not in the current item set`);
    }
    if (!allItems.includes(loser)) {
      throw new Error(`Loser "${loser}" is not in the current item set`);
    }
  }
}
