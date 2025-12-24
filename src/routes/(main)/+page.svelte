<script lang="ts">
	import Steps from '../../components/steps.svelte';
	import RankingPhase from '../../components/ranking-phase.svelte';
	import RankingResults from '../../components/ranking-results.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { RankerMethod, type ComparisonPair, type RankedItem } from './RankerMethod';

	let input = $state('');
	let ranker = $state<RankerMethod | null>(null);
	let currentPair = $state<ComparisonPair | null>(null);
	let rankedItems = $state<RankedItem[]>([]);
	let comparisonCount = $state(0);
	let progress = $state(0);

	type Phase = 'input' | 'ranking' | 'results';
	let phase = $state<Phase>('input');

	let items = $derived(input.split('\n').filter((line) => line.trim() !== ''));

	function startRanking() {
		if (items.length < 2) return;

		console.log('[startRanking] Starting with items:', items);
		ranker = new RankerMethod('merge');
		ranker.initialize(items);
		console.log('[startRanking] Ranker initialized, isDone:', ranker.isDone());

		currentPair = ranker.getNextPair();
		console.log('[startRanking] First pair:', currentPair);
		comparisonCount = ranker.getComparisonCount();
		progress = ranker.getProgress();

		if (!currentPair) {
			console.log('[startRanking] No pair, finishing immediately');
			// Only one item or immediate completion
			finishRanking();
		} else {
			console.log('[startRanking] Moving to ranking phase');
			phase = 'ranking';
		}
	}

	function handlePick(winnerId: string, loserId: string) {
		if (!ranker) return;

		ranker.submitResult(winnerId, loserId);
		comparisonCount = ranker.getComparisonCount();
		progress = ranker.getProgress();

		if (ranker.isDone()) {
			finishRanking();
		} else {
			currentPair = ranker.getNextPair();
			if (!currentPair) {
				finishRanking();
			}
		}
	}

	function finishRanking() {
		if (!ranker) return;
		rankedItems = ranker.getRankedItems();
		phase = 'results';
	}

	function reset() {
		input = '';
		ranker = null;
		currentPair = null;
		rankedItems = [];
		comparisonCount = 0;
		progress = 0;
		phase = 'input';
	}
</script>

<div class="space-y-12">
	<header class="space-y-2">
		<h2 class="text-3xl font-bold tracking-tight">Welcome to Ranker</h2>
		<p class="text-muted-foreground">
			The easiest way to rank anything using pairwise comparisons.
		</p>
	</header>

	{#if phase === 'input'}
		<section class="space-y-6">
			<Steps n="1" text="Write a list of things you want to rank" />
			<Textarea
				bind:value={input}
				placeholder="Enter items, one per line..."
				class="w-full min-h-[200px] text-lg p-4"
			/>
			<Button class="w-full" disabled={items.length < 2} onclick={startRanking}>
				Start Ranking ({items.length} items)
			</Button>
		</section>

		<section class="opacity-50 pointer-events-none space-y-6">
			<Steps n="2" text="Rank your list" />
			<Steps n="3" text="Profit" />
		</section>
	{:else if phase === 'ranking' && currentPair}
		<section class="opacity-50 pointer-events-none space-y-6">
			<Steps n="1" text="Write a list of things you want to rank" done />
		</section>

		<section class="space-y-6">
			<Steps n="2" text="Rank your list" />
			<RankingPhase
				leftId={currentPair.leftId}
				leftName={currentPair.leftName}
				rightId={currentPair.rightId}
				rightName={currentPair.rightName}
				{progress}
				{comparisonCount}
				onPick={handlePick}
			/>
		</section>

		<section class="opacity-50 pointer-events-none space-y-6">
			<Steps n="3" text="Profit" />
		</section>
	{:else if phase === 'results'}
		<section class="opacity-50 pointer-events-none space-y-6">
			<Steps n="1" text="Write a list of things you want to rank" done />
		</section>

		<section class="opacity-50 pointer-events-none space-y-6">
			<Steps n="2" text="Rank your list" done />
		</section>

		<section class="space-y-6">
			<Steps n="3" text="Profit" />
			<RankingResults items={rankedItems} {comparisonCount} onReset={reset} />
		</section>
	{/if}
</div>
