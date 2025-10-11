/**
 * Interface for ranking algorithms that use pairwise comparisons
 */
export interface RankingAlgorithm {
  /**
   * Initialize the algorithm with a list of items to rank
   */
  initialize(items: string[]): void;

  /**
   * Get the next pair of items to compare
   * Returns null if ranking is complete
   */
  getNextComparison(): [string, string] | null;

  /**
   * Submit the result of a comparison
   * @param winner The item that was chosen as better
   * @param loser The item that was chosen as worse
   */
  submitComparison(winner: string, loser: string): void;

  /**
   * Get the current ranked list of items (may be partial during ranking)
   */
  getRankedItems(): string[];

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
}
