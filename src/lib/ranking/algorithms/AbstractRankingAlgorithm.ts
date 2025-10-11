import type { RankingAlgorithm, RankedItem } from './RankingAlgorithm';
import { shuffleArray } from '../../utils';

/**
 * Abstract base class for ranking algorithms
 */
export abstract class AbstractRankingAlgorithm implements RankingAlgorithm {
  protected items: RankedItem[] = [];
  protected rankedItems: RankedItem[] = [];

  initialize(items: RankedItem[]): void {
    // Shuffle the input items to randomize the comparison order
    this.items = shuffleArray([...items]);
    this.rankedItems = [];
    this.reset();
  }

  abstract getNextComparison(): [RankedItem, RankedItem] | null;
  abstract submitComparison(winner: RankedItem, loser: RankedItem): void;

  getRankedItems(): RankedItem[] {
    // Return items in reverse order so the most preferred (best) item appears first
    return [...this.rankedItems].reverse();
  }

  abstract isComplete(): boolean;

  getProgress(): number {
    if (this.items.length === 0) return 100;
    return Math.round((this.rankedItems.length / this.items.length) * 100);
  }

  abstract getCurrentState(): string;

  abstract getVisualState(): { items: RankedItem[]; comparing: [number, number] | null };

  /**
   * Reset algorithm state - called during initialization
   */
  protected abstract reset(): void;

  /**
   * Validate that both items exist in the current item set
   */
  protected validateComparison(winner: RankedItem, loser: RankedItem): void {
    const allItems = [...this.items, ...this.rankedItems];
    const itemExists = (item: RankedItem) => allItems.some(([letter, text]) => letter === item[0] && text === item[1]);

    if (!itemExists(winner)) {
      throw new Error(`Winner "${winner[0]}: ${winner[1]}" is not in the current item set`);
    }
    if (!itemExists(loser)) {
      throw new Error(`Loser "${loser[0]}: ${loser[1]}" is not in the current item set`);
    }
  }
}
