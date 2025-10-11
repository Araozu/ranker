import { AbstractRankingAlgorithm } from './AbstractRankingAlgorithm';
import type { RankedItem } from './RankingAlgorithm';

/**
 * Merge sort ranking algorithm
 *
 * This algorithm sorts items using the merge sort approach:
 * 1. Start with individual items as sorted sublists of size 1
 * 2. Merge adjacent pairs of sublists to create larger sorted sublists
 * 3. Repeat until one fully sorted list remains
 * 4. Each merge step involves pairwise comparisons between elements from sublists
 */
export class MergeSortRanking extends AbstractRankingAlgorithm {
  private sublists: RankedItem[][] = [];
  private mergeIndices: number[] = []; // Current position in each sublist during merge
  private mergingLists: [number, number] | null = null; // Indices of sublists being merged
  private outputList: RankedItem[] = []; // Current merged result

  protected reset(): void {
    // Start with each item as its own sorted sublist
    this.sublists = this.items.map(item => [item]);
    this.mergeIndices = [];
    this.mergingLists = null;
    this.outputList = [];
    this.rankedItems = [];
  }

  getNextComparison(): [RankedItem, RankedItem] | null {
    // If we're in the middle of merging two sublists
    if (this.mergingLists) {
      const [leftIdx, rightIdx] = this.mergingLists;
      const leftList = this.sublists[leftIdx];
      const rightList = this.sublists[rightIdx];

      // Get current positions in each list
      const leftPos = this.mergeIndices[leftIdx] || 0;
      const rightPos = this.mergeIndices[rightIdx] || 0;

      // If we've exhausted one list, take from the other
      if (leftPos >= leftList.length) {
        this.outputList.push(rightList[rightPos]);
        this.mergeIndices[rightIdx] = rightPos + 1;
        return this.continueMerge();
      }
      if (rightPos >= rightList.length) {
        this.outputList.push(leftList[leftPos]);
        this.mergeIndices[leftIdx] = leftPos + 1;
        return this.continueMerge();
      }

      // Compare next elements from each list
      return [leftList[leftPos], rightList[rightPos]];
    }

    // Find the next pair of sublists to merge
    for (let i = 0; i < this.sublists.length - 1; i += 2) {
      if (this.sublists[i] && this.sublists[i + 1]) {
        // Start merging these two sublists
        this.mergingLists = [i, i + 1];
        this.mergeIndices = [];
        this.outputList = [];
        return this.getNextComparison();
      }
    }

    // If we get here, all merging is complete
    if (this.sublists.length === 1) {
      // Final sorted list is complete
      this.rankedItems = [...this.sublists[0]];
      return null;
    }

    return null;
  }

  submitComparison(winner: RankedItem, loser: RankedItem): void {
    if (!this.mergingLists) {
      throw new Error('No active merge operation');
    }

    this.validateComparison(winner, loser);

    const [leftIdx, rightIdx] = this.mergingLists;
    const leftList = this.sublists[leftIdx];
    const rightList = this.sublists[rightIdx];

    const leftPos = this.mergeIndices[leftIdx] || 0;
    const rightPos = this.mergeIndices[rightIdx] || 0;

    // Determine which list the winner came from and add it to output
    if (winner === leftList[leftPos]) {
      this.outputList.push(winner);
      this.mergeIndices[leftIdx] = leftPos + 1;
    } else if (winner === rightList[rightPos]) {
      this.outputList.push(winner);
      this.mergeIndices[rightIdx] = rightPos + 1;
    } else {
      throw new Error('Winner not found in current merge positions');
    }
  }

  private continueMerge(): [RankedItem, RankedItem] | null {
    if (!this.mergingLists) return null;

    const [leftIdx, rightIdx] = this.mergingLists;
    const leftList = this.sublists[leftIdx];
    const rightList = this.sublists[rightIdx];

    const leftPos = this.mergeIndices[leftIdx] || 0;
    const rightPos = this.mergeIndices[rightIdx] || 0;

    // Check if merge is complete
    if (leftPos >= leftList.length && rightPos >= rightList.length) {
      // Replace the two sublists with the merged result
      this.sublists.splice(leftIdx, 2, this.outputList);
      this.mergingLists = null;
      this.mergeIndices = [];

      // Continue with next merge
      return this.getNextComparison();
    }

    // Continue current merge
    return this.getNextComparison();
  }

  isComplete(): boolean {
    return this.sublists.length === 1 && this.sublists[0].length === this.items.length;
  }

  getCurrentState(): string {
    if (this.isComplete()) {
      return 'Merge sort complete - all items ranked';
    }

    if (this.mergingLists) {
      const [leftIdx, rightIdx] = this.mergingLists;
      const leftSize = this.sublists[leftIdx].length;
      const rightSize = this.sublists[rightIdx].length;
      const leftPos = this.mergeIndices[leftIdx] || 0;
      const rightPos = this.mergeIndices[rightIdx] || 0;

      return `Merging sublists of size ${leftSize} and ${rightSize} (position ${leftPos + rightPos + 1}/${leftSize + rightSize})`;
    }

    const maxSize = Math.max(...this.sublists.map(list => list.length));
    return `Merging sublists up to size ${maxSize}`;
  }

  getVisualState(): { items: RankedItem[]; comparing: [number, number] | null } {
    // Flatten all sublists to get current positions
    const allItems: RankedItem[] = [];
    for (const sublist of this.sublists) {
      allItems.push(...sublist);
    }

    // Find indices of currently comparing items
    let comparing: [number, number] | null = null;
    if (this.mergingLists) {
      const [leftIdx, rightIdx] = this.mergingLists;
      const leftList = this.sublists[leftIdx];
      const rightList = this.sublists[rightIdx];

      const leftPos = this.mergeIndices[leftIdx] || 0;
      const rightPos = this.mergeIndices[rightIdx] || 0;

      // Calculate global indices
      let leftGlobalIndex = 0;
      let rightGlobalIndex = 0;

      // Find the global position of the left item
      for (let i = 0; i < leftIdx; i++) {
        leftGlobalIndex += this.sublists[i].length;
      }
      leftGlobalIndex += leftPos;

      // Find the global position of the right item
      for (let i = 0; i < rightIdx; i++) {
        rightGlobalIndex += this.sublists[i].length;
      }
      rightGlobalIndex += rightPos;

      comparing = [leftGlobalIndex, rightGlobalIndex];
    }

    return { items: allItems, comparing };
  }
}
