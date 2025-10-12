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
  private leftPos: number = 0;
  private rightPos: number = 0;
  private mergingLists: [number, number] | null = null; // Indices of sublists being merged
  private outputList: RankedItem[] = []; // Current merged result
  private nextMergeIndex: number = 0; // Next pair to merge in current pass
  private newSublists: RankedItem[][] = []; // Accumulates merged results for current pass

  protected reset(): void {
    // Start with each item as its own sorted sublist
    this.sublists = this.items.map(item => [item]);
    this.leftPos = 0;
    this.rightPos = 0;
    this.mergingLists = null;
    this.outputList = [];
    this.nextMergeIndex = 0;
    this.newSublists = [];
    this.rankedItems = [];
  }

  getNextComparison(): [RankedItem, RankedItem] | null {
    // If we're in the middle of merging two sublists
    if (this.mergingLists) {
      const [leftIdx, rightIdx] = this.mergingLists;
      const leftList = this.sublists[leftIdx];
      const rightList = this.sublists[rightIdx];

      // If we've exhausted one list, take from the other
      if (this.leftPos >= leftList.length) {
        // Take all remaining from right
        while (this.rightPos < rightList.length) {
          this.outputList.push(rightList[this.rightPos]);
          this.rightPos++;
        }
        return this.finishMerge();
      }
      if (this.rightPos >= rightList.length) {
        // Take all remaining from left
        while (this.leftPos < leftList.length) {
          this.outputList.push(leftList[this.leftPos]);
          this.leftPos++;
        }
        return this.finishMerge();
      }

      // Compare next elements from each list
      return [leftList[this.leftPos], rightList[this.rightPos]];
    }

    // Start next merge if available in current pass
    if (this.nextMergeIndex < this.sublists.length - 1) {
      // Start merging next pair
      this.mergingLists = [this.nextMergeIndex, this.nextMergeIndex + 1];
      this.leftPos = 0;
      this.rightPos = 0;
      this.outputList = [];
      return this.getNextComparison();
    } else if (this.nextMergeIndex === this.sublists.length - 1) {
      // Odd sublist left over - carry it forward without merging
      this.newSublists.push(this.sublists[this.nextMergeIndex]);
      this.nextMergeIndex += 2;
    }

    // Current pass is complete, start next pass
    if (this.newSublists.length > 0) {
      this.sublists = this.newSublists;
      this.newSublists = [];
      this.nextMergeIndex = 0;
      
      // Check if we're done
      if (this.sublists.length === 1) {
        this.rankedItems = [...this.sublists[0]];
        return null;
      }
      
      // Start next pass
      return this.getNextComparison();
    }

    // All merging is complete
    if (this.sublists.length === 1) {
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

    // Determine which list the winner came from and add it to output
    if (winner === leftList[this.leftPos]) {
      this.outputList.push(winner);
      this.leftPos++;
    } else if (winner === rightList[this.rightPos]) {
      this.outputList.push(winner);
      this.rightPos++;
    } else {
      throw new Error('Winner not found in current merge positions');
    }
  }

  private finishMerge(): [RankedItem, RankedItem] | null {
    if (!this.mergingLists) return null;

    // Add the merged result to new sublists
    this.newSublists.push(this.outputList);
    this.mergingLists = null;
    this.nextMergeIndex += 2;

    // Continue with next merge
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
      const merged = this.leftPos + this.rightPos;
      const total = leftSize + rightSize;

      return `Merging sublists of size ${leftSize} and ${rightSize} (position ${merged}/${total})`;
    }

    const maxSize = Math.max(...this.sublists.map(list => list.length));
    return `Merging sublists up to size ${maxSize}`;
  }

  getVisualState(): { items: RankedItem[]; comparing: [number, number] | null } {
    // Build the visual representation showing merged output and remaining sublists
    const allItems: RankedItem[] = [];
    
    // Add already merged sublists from current pass
    for (const sublist of this.newSublists) {
      allItems.push(...sublist);
    }
    
    // Add the current output being built
    allItems.push(...this.outputList);
    
    // Add remaining unmerged sublists in the current pass
    if (this.mergingLists) {
      const [leftIdx, rightIdx] = this.mergingLists;
      
      // Add remaining items from left list being merged
      for (let i = this.leftPos; i < this.sublists[leftIdx].length; i++) {
        allItems.push(this.sublists[leftIdx][i]);
      }
      
      // Add remaining items from right list being merged
      for (let i = this.rightPos; i < this.sublists[rightIdx].length; i++) {
        allItems.push(this.sublists[rightIdx][i]);
      }
      
      // Add any sublists after the ones being merged
      for (let i = rightIdx + 1; i < this.sublists.length; i++) {
        allItems.push(...this.sublists[i]);
      }
    } else {
      // Not currently merging, add all remaining sublists
      for (let i = this.nextMergeIndex; i < this.sublists.length; i++) {
        allItems.push(...this.sublists[i]);
      }
    }

    // Find indices of currently comparing items
    let comparing: [number, number] | null = null;
    if (this.mergingLists) {
      const [leftIdx, rightIdx] = this.mergingLists;
      const leftList = this.sublists[leftIdx];
      const rightList = this.sublists[rightIdx];

      if (this.leftPos < leftList.length && this.rightPos < rightList.length) {
        // Calculate global indices in the visual display
        let baseIndex = 0;
        
        // Add already merged sublists
        for (const sublist of this.newSublists) {
          baseIndex += sublist.length;
        }
        
        // Add current output
        baseIndex += this.outputList.length;
        
        // Left item is first in remaining
        const leftGlobalIndex = baseIndex;
        // Right item is after all remaining left items
        const rightGlobalIndex = baseIndex + (leftList.length - this.leftPos);
        
        comparing = [leftGlobalIndex, rightGlobalIndex];
      }
    }

    return { items: allItems, comparing };
  }
}
