import { AbstractRankingAlgorithm } from './AbstractRankingAlgorithm';

/**
 * Insertion sort ranking algorithm
 *
 * This algorithm sorts items using pairwise comparisons:
 * 1. Start with first item in ranked list
 * 2. Take next item and compare against ranked items to find insertion position
 * 3. Each comparison determines if current item should be inserted before or after
 */
export class InsertionSortRanking extends AbstractRankingAlgorithm {
  private remainingItems: string[] = [];
  private currentItem: string | null = null;
  private insertionIndex: number = 0;

  protected reset(): void {
    this.remainingItems = [...this.items];
    this.currentItem = null;
    this.insertionIndex = 0;

    // Start with first item in ranked list
    if (this.remainingItems.length > 0) {
      this.rankedItems = [this.remainingItems.shift()!];
    }
  }

  getNextComparison(): [string, string] | null {
    // If no current item being inserted, get next one
    if (!this.currentItem && this.remainingItems.length > 0) {
      this.currentItem = this.remainingItems.shift()!;
      this.insertionIndex = 0;
    }

    // If no current item, ranking is complete
    if (!this.currentItem) {
      return null;
    }

    // If we've reached the end of ranked items, insert here
    if (this.insertionIndex >= this.rankedItems.length) {
      this.insertItem();
      return this.getNextComparison(); // Recursively get next comparison
    }

    // Return comparison between current item and item at insertion index
    return [this.currentItem, this.rankedItems[this.insertionIndex]];
  }

  submitComparison(winner: string, loser: string): void {
    if (!this.currentItem) {
      throw new Error('No current item being compared');
    }

    this.validateComparison(winner, loser);

    if (winner === this.currentItem) {
      // Current item won, move to next position
      this.insertionIndex++;
    } else {
      // Ranked item won, insert current item here
      this.insertItem();
    }
  }

  isComplete(): boolean {
    return this.remainingItems.length === 0 && !this.currentItem;
  }

  getCurrentState(): string {
    if (!this.currentItem) {
      return this.isComplete() ? 'Ranking complete' : 'Preparing next item';
    }

    const item = this.rankedItems[this.insertionIndex];
    if (item) {
      return `Comparing "${this.currentItem}" vs "${item}" for position ${this.insertionIndex + 1}`;
    } else {
      return `Inserting "${this.currentItem}" at the end`;
    }
  }

  private insertItem(): void {
    if (!this.currentItem) return;

    // Insert current item at insertion index
    this.rankedItems.splice(this.insertionIndex, 0, this.currentItem);
    this.currentItem = null;
    this.insertionIndex = 0;
  }
}
