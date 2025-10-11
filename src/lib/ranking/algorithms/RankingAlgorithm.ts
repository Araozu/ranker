/**
 * A ranked item consisting of a letter identifier and the original text
 */
export type RankedItem = [string, string];

/**
 * Interface for ranking algorithms that use pairwise comparisons
 */
export interface RankingAlgorithm {
  /**
   * Initialize the algorithm with a list of items to rank
   */
  initialize(items: RankedItem[]): void;

  /**
   * Get the next pair of items to compare
   * Returns null if ranking is complete
   */
  getNextComparison(): [RankedItem, RankedItem] | null;

  /**
   * Submit the result of a comparison
   * @param winner The item that was chosen as better
   * @param loser The item that was chosen as worse
   */
  submitComparison(winner: RankedItem, loser: RankedItem): void;

  /**
   * Get the current ranked list of items (may be partial during ranking)
   */
  getRankedItems(): RankedItem[];

  /**
   * Check if the ranking process is complete
   */
  isComplete(): boolean;

  /**
   * Get the current progress as a percentage (0-100)
   */
  getProgress(): number;

  /**
   * Get a description of the current algorithm state
   */
  getCurrentState(): string;

  /**
   * Get the current visual state of all items and which ones are being compared
   * Returns an object with items in their current positions and comparison indices
   */
  getVisualState(): { items: RankedItem[]; comparing: [number, number] | null };
}
