import { ComparisonGraph, type SortingAlgorithm } from './SortingAlgorithm';

interface MergeTask {
	id: number;
	items: string[];
	resolved: boolean;
	result: string[];
	leftChild?: MergeTask;
	rightChild?: MergeTask;
}

interface ActiveMerge {
	task: MergeTask;
	left: string[];
	right: string[];
	merged: string[];
}

/**
 * Merge Sort based comparison algorithm.
 * Uses divide-and-conquer approach with transitive relationship tracking.
 * Cleaner recursive implementation that properly tracks merge state.
 */
export class MergeSortAlgorithm implements SortingAlgorithm {
	private graph: ComparisonGraph = new ComparisonGraph();
	private items: string[] = [];
	private sortedResult: string[] = [];
	private done = false;

	// Stack-based merge state for iterative processing
	private mergeStack: MergeTask[] = [];
	private currentMerge: ActiveMerge | null = null;

	getName(): string {
		return 'Merge Sort';
	}

	initialize(items: string[]): void {
		console.log('[MergeSort.initialize] items:', items);
		this.items = [...items];
		this.graph = new ComparisonGraph(items);
		this.sortedResult = [];
		this.done = false;
		this.mergeStack = [];
		this.currentMerge = null;

		if (items.length <= 1) {
			console.log('[MergeSort.initialize] Only 1 item, done immediately');
			this.sortedResult = [...items];
			this.done = true;
			return;
		}

		// Build the merge task tree
		this.buildMergeTree(items, 0);
		console.log('[MergeSort.initialize] Built merge tree, stack size:', this.mergeStack.length);
		console.log('[MergeSort.initialize] Merge stack:', JSON.stringify(this.mergeStack.map(t => ({ id: t.id, resolved: t.resolved, items: t.items }))));
	}

	/**
	 * Recursively build merge tasks. Returns task.
	 */
	private buildMergeTree(items: string[], taskId: number): MergeTask {
		if (items.length === 1) {
			// Leaf node - single item, already sorted
			const task: MergeTask = {
				id: taskId,
				items: [...items],
				resolved: true,
				result: [...items]
			};
			return task;
		}

		const mid = Math.floor(items.length / 2);
		const leftItems = items.slice(0, mid);
		const rightItems = items.slice(mid);

		// Create child tasks first (post-order traversal)
		const leftTask = this.buildMergeTree(leftItems, taskId * 2 + 1);
		const rightTask = this.buildMergeTree(rightItems, taskId * 2 + 2);

		// Create this merge task
		const task: MergeTask = {
			id: taskId,
			items: [...items],
			resolved: false,
			result: [],
			leftChild: leftTask,
			rightChild: rightTask
		};

		// Add to stack (will be processed in order - leaves first due to recursion)
		this.mergeStack.push(task);

		return task;
	}

	getNextPair(): [string, string] | null {
		console.log('[MergeSort.getNextPair] done:', this.done, 'stackSize:', this.mergeStack.length, 'currentMerge:', !!this.currentMerge);
		if (this.done) {
			console.log('[MergeSort.getNextPair] Already done, returning null');
			return null;
		}

		// Continue current merge if active
		if (this.currentMerge) {
			console.log('[MergeSort.getNextPair] Continuing current merge');
			const pair = this.continueCurrentMerge();
			console.log('[MergeSort.getNextPair] continueCurrentMerge returned:', pair);
			if (pair) return pair;
		}

		// Find next merge task to process
		console.log('[MergeSort.getNextPair] Looking for next task, stack:', this.mergeStack.length);
		while (this.mergeStack.length > 0) {
			// Use shift() to get from front - leaf merges were added first
			const task = this.mergeStack.shift()!;
			console.log('[MergeSort.getNextPair] Processing task:', task.id, 'leftResolved:', task.leftChild?.resolved, 'rightResolved:', task.rightChild?.resolved);

			// Children should always be resolved due to post-order traversal
			// but let's be safe
			if ((task.leftChild && !task.leftChild.resolved) || 
				(task.rightChild && !task.rightChild.resolved)) {
				console.log('[MergeSort.getNextPair] Children not resolved, putting back at end');
				// Put it back at the END and continue - process other tasks first
				this.mergeStack.push(task);
				continue;
			}

			const leftSorted = task.leftChild?.result ?? [];
			const rightSorted = task.rightChild?.result ?? [];
			console.log('[MergeSort.getNextPair] Merging left:', leftSorted, 'right:', rightSorted);

			this.currentMerge = {
				task,
				left: [...leftSorted],
				right: [...rightSorted],
				merged: []
			};

			const pair = this.continueCurrentMerge();
			console.log('[MergeSort.getNextPair] New merge pair:', pair);
			if (pair) return pair;
		}

		// All done
		console.log('[MergeSort.getNextPair] Stack empty, marking done');
		this.done = true;
		return null;
	}

	private continueCurrentMerge(): [string, string] | null {
		if (!this.currentMerge) return null;

		const { task, left, right, merged } = this.currentMerge;
		console.log('[MergeSort.continueCurrentMerge] left:', left, 'right:', right, 'merged:', merged);

		while (true) {
			// Check if merge is complete
			if (left.length === 0 && right.length === 0) {
				console.log('[MergeSort.continueCurrentMerge] Merge complete, result:', merged);
				// Merge complete
				task.result = [...merged];
				task.resolved = true;

				// Check if this was the root task
				if (task.id === 0) {
					console.log('[MergeSort.continueCurrentMerge] Root task complete!');
					this.sortedResult = [...merged];
					this.done = true;
				}

				this.currentMerge = null;
				return null;
			}

			// Drain remaining if one side empty
			if (left.length === 0) {
				merged.push(...right.splice(0));
				continue;
			}
			if (right.length === 0) {
				merged.push(...left.splice(0));
				continue;
			}

			const a = left[0];
			const b = right[0];

			// Check if relationship is known
			if (this.graph.isKnown(a, b)) {
				if (this.graph.beats_(a, b)) {
					merged.push(left.shift()!);
				} else {
					merged.push(right.shift()!);
				}
				continue;
			}

			// Need user input
			return [a, b];
		}
	}

	reportResult(winner: string, loser: string): void {
		this.graph.addResult(winner, loser);

		// Continue the current merge with this result
		if (this.currentMerge) {
			const { left, right, merged } = this.currentMerge;
			if (left.length > 0 && right.length > 0) {
				if (left[0] === winner && right[0] === loser) {
					merged.push(left.shift()!);
				} else if (right[0] === winner && left[0] === loser) {
					merged.push(right.shift()!);
				}
			}
		}
	}

	isDone(): boolean {
		return this.done;
	}

	getSortedItems(): string[] {
		if (this.done) {
			return this.sortedResult;
		}
		// Return current best guess based on graph
		return this.graph.getSortedItems();
	}
}
