import { AbstractRankingAlgorithm } from './AbstractRankingAlgorithm';

/**
 * Merge sort ranking algorithm using tournament elimination
 *
 * This algorithm sorts items using a single-elimination tournament approach:
 * 1. Items compete in rounds, with winners advancing to the next round
 * 2. Losers are eliminated and ranked based on their round of elimination
 * 3. Items eliminated in later rounds are ranked higher
 * 4. The final winner is ranked highest
 */
export class MergeSortRanking extends AbstractRankingAlgorithm {
  private currentRound: string[] = [];
  private nextRound: string[] = [];
  private roundNumber: number = 0;

  protected reset(): void {
    this.currentRound = [...this.items];
    this.nextRound = [];
    this.roundNumber = 1;
    this.rankedItems = [];
  }

  getNextComparison(): [string, string] | null {
    // If current round is empty, move to next round
    if (this.currentRound.length === 0) {
      if (this.nextRound.length > 1) {
        // Start next round with winners from previous round
        this.currentRound = [...this.nextRound];
        this.nextRound = [];
        this.roundNumber++;
      } else if (this.nextRound.length === 1) {
        // Tournament complete - final winner
        this.rankedItems.unshift(this.nextRound[0]);
        this.nextRound = [];
        return null;
      } else {
        // Tournament complete
        return null;
      }
    }

    // If only one item left in current round, it advances automatically
    if (this.currentRound.length === 1) {
      const autoAdvance = this.currentRound.shift()!;
      this.nextRound.push(autoAdvance);
      return this.getNextComparison(); // Recursively continue
    }

    // Return next pair for comparison
    return [this.currentRound[0], this.currentRound[1]];
  }

  submitComparison(winner: string, loser: string): void {
    this.validateComparison(winner, loser);

    // Remove both items from current round
    this.currentRound = this.currentRound.filter(item => item !== winner && item !== loser);

    // Winner advances to next round
    this.nextRound.push(winner);

    // Loser is eliminated - add to ranked list (losers from later rounds rank higher)
    this.rankedItems.push(loser);
  }

  isComplete(): boolean {
    return this.currentRound.length === 0 && this.nextRound.length === 0;
  }

  getCurrentState(): string {
    if (this.isComplete()) {
      return 'Tournament complete - all items ranked';
    }

    if (this.currentRound.length === 0) {
      return `Advancing ${this.nextRound.length} winners to round ${this.roundNumber + 1}`;
    }

    if (this.currentRound.length === 1) {
      return `Round ${this.roundNumber}: "${this.currentRound[0]}" advances automatically`;
    }

    if (this.currentRound.length === 2) {
      return `Round ${this.roundNumber} final: "${this.currentRound[0]}" vs "${this.currentRound[1]}"`;
    }

    return `Round ${this.roundNumber}: ${this.currentRound.length} competitors remaining`;
  }
}
