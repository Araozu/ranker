import { AbstractRankingAlgorithm } from './AbstractRankingAlgorithm';
import type { RankedItem } from './RankingAlgorithm';

/**
 * Heap sort ranking algorithm
 *
 * This algorithm sorts items using the heap sort approach:
 * 1. Build a max heap from the items by sifting down from the last parent
 * 2. Repeatedly extract the maximum (root) and place it at the end
 * 3. Sift down the new root to maintain heap property
 * 4. Each sift operation involves comparing parent with children
 */
export class HeapSortRanking extends AbstractRankingAlgorithm {
  private heap: RankedItem[] = [];
  private sorted: RankedItem[] = []; // Items extracted from heap (best to worst)
  private heapSize: number = 0;
  private phase: 'building' | 'sorting' | 'complete' = 'building';
  
  // State for ongoing sift operation
  private siftingIndex: number | null = null;
  private siftStep: 'compare_children' | 'compare_with_largest' | null = null;
  private largestChild: number | null = null;
  private buildIndex: number = -1; // Current index during heap building phase

  protected reset(): void {
    this.heap = [...this.items];
    this.sorted = [];
    this.heapSize = this.items.length;
    this.phase = 'building';
    this.siftingIndex = null;
    this.siftStep = null;
    this.largestChild = null;
    this.rankedItems = [];
    
    // Start building from the last parent node
    this.buildIndex = Math.floor(this.heapSize / 2) - 1;
  }

  getNextComparison(): [RankedItem, RankedItem] | null {
    // Building phase: sift down each parent node to build initial heap
    if (this.phase === 'building') {
      if (this.buildIndex >= 0) {
        return this.startSiftDown(this.buildIndex);
      } else {
        // Building complete, move to sorting phase
        this.phase = 'sorting';
        return this.getNextComparison();
      }
    }

    // Sorting phase: extract max and sift down
    if (this.phase === 'sorting') {
      if (this.heapSize > 1) {
        // Extract max (root) to sorted array
        this.sorted.push(this.heap[0]);
        
        // Move last element to root
        this.heap[0] = this.heap[this.heapSize - 1];
        this.heapSize--;
        
        // Sift down the new root
        return this.startSiftDown(0);
      } else if (this.heapSize === 1) {
        // Last element
        this.sorted.push(this.heap[0]);
        this.heapSize = 0;
        this.phase = 'complete';
        this.rankedItems = [...this.sorted];
        return null;
      }
    }

    // Complete
    this.phase = 'complete';
    this.rankedItems = [...this.sorted];
    return null;
  }

  private startSiftDown(index: number): [RankedItem, RankedItem] | null {
    this.siftingIndex = index;
    this.siftStep = null;
    this.largestChild = null;
    return this.continueSiftDown();
  }

  private continueSiftDown(): [RankedItem, RankedItem] | null {
    if (this.siftingIndex === null) return null;

    const index = this.siftingIndex;
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;

    // No children in heap range
    if (leftChild >= this.heapSize) {
      // Sift complete, move to next action
      this.siftingIndex = null;
      this.siftStep = null;
      this.largestChild = null;
      
      if (this.phase === 'building') {
        this.buildIndex--;
        return this.getNextComparison();
      } else {
        return this.getNextComparison();
      }
    }

    // Only left child exists
    if (rightChild >= this.heapSize) {
      this.siftStep = 'compare_with_largest';
      this.largestChild = leftChild;
      // Compare parent with left child
      return [this.heap[index], this.heap[leftChild]];
    }

    // Both children exist
    if (this.siftStep === null) {
      // First, compare the two children to find the largest
      this.siftStep = 'compare_children';
      return [this.heap[leftChild], this.heap[rightChild]];
    } else if (this.siftStep === 'compare_with_largest') {
      // Compare parent with the largest child
      return [this.heap[index], this.heap[this.largestChild!]];
    }

    return null;
  }

  submitComparison(winner: RankedItem, loser: RankedItem): void {
    if (this.siftingIndex === null) {
      throw new Error('No active sift operation');
    }

    this.validateComparison(winner, loser);

    const index = this.siftingIndex;
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;

    if (this.siftStep === 'compare_children') {
      // We just compared left vs right child
      const left = this.heap[leftChild];
      const right = this.heap[rightChild];
      
      if (winner === left) {
        this.largestChild = leftChild;
      } else {
        this.largestChild = rightChild;
      }
      
      // Next: compare parent with largest child
      this.siftStep = 'compare_with_largest';
      return;
    }

    if (this.siftStep === 'compare_with_largest') {
      const parent = this.heap[index];
      const largestChildItem = this.heap[this.largestChild!];
      
      if (winner === parent) {
        // Parent is largest, heap property satisfied, sift complete
        this.siftingIndex = null;
        this.siftStep = null;
        this.largestChild = null;
        
        if (this.phase === 'building') {
          this.buildIndex--;
        }
        return;
      } else {
        // Child is larger, swap and continue sifting down
        this.heap[index] = largestChildItem;
        this.heap[this.largestChild!] = parent;
        this.siftingIndex = this.largestChild!;
        this.siftStep = null;
        this.largestChild = null;
        return;
      }
    }

    throw new Error('Unexpected comparison state');
  }

  isComplete(): boolean {
    return this.phase === 'complete' && this.sorted.length === this.items.length;
  }

  getCurrentState(): string {
    if (this.phase === 'complete') {
      return 'Heap sort complete - all items ranked';
    }

    if (this.phase === 'building') {
      const totalParents = Math.floor(this.items.length / 2);
      const processed = totalParents - this.buildIndex - 1;
      return `Building heap (${processed}/${totalParents} nodes processed)`;
    }

    if (this.phase === 'sorting') {
      return `Extracting from heap (${this.sorted.length}/${this.items.length} extracted)`;
    }

    return 'Heap sort in progress';
  }

  getVisualState(): { items: RankedItem[]; comparing: [number, number] | null } {
    // Show the heap array followed by sorted items
    const visualItems: RankedItem[] = [];
    
    // Add current heap (only items within heapSize)
    for (let i = 0; i < this.heapSize; i++) {
      visualItems.push(this.heap[i]);
    }
    
    // Add sorted items
    visualItems.push(...this.sorted);

    let comparing: [number, number] | null = null;
    if (this.siftingIndex !== null) {
      const parent = this.siftingIndex;
      const leftChild = 2 * parent + 1;
      
      if (leftChild < this.heapSize) {
        comparing = [parent, leftChild];
      }
    }

    return { items: visualItems, comparing };
  }
}

