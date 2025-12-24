<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { RankedItem } from '../routes/(main)/RankerMethod';

	interface Props {
		items: RankedItem[];
		comparisonCount: number;
		onReset: () => void;
	}

	let { items, comparisonCount, onReset }: Props = $props();

	function getMedalEmoji(rank: number): string {
		switch (rank) {
			case 1:
				return '🥇';
			case 2:
				return '🥈';
			case 3:
				return '🥉';
			default:
				return '';
		}
	}

	function getBarWidth(weight: number): number {
		return Math.max(10, weight);
	}
</script>

<div class="space-y-6">
	<div class="text-center space-y-2">
		<h3 class="text-2xl font-bold">🎉 Ranking Complete!</h3>
		<p class="text-muted-foreground">
			Sorted {items.length} items in {comparisonCount} comparisons
		</p>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Final Rankings</Card.Title>
			<Card.Description>Based on your pairwise comparisons</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-3">
			{#each items as item (item.id)}
				<div class="flex items-center gap-3">
					<span class="w-8 text-center font-mono text-sm text-muted-foreground">
						{#if item.rank <= 3}
							{getMedalEmoji(item.rank)}
						{:else}
							#{item.rank}
						{/if}
					</span>
					<div class="flex-1 space-y-1">
						<div class="flex items-center justify-between">
							<span class="font-medium">{item.name}</span>
							<span class="text-sm text-muted-foreground">{item.weight} pts</span>
						</div>
						<div class="w-full bg-secondary rounded-full h-2">
							<div
								class="bg-primary h-2 rounded-full transition-all duration-500"
								style="width: {getBarWidth(item.weight)}%"
							></div>
						</div>
					</div>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<Button class="w-full" onclick={onReset}>Start New Ranking</Button>
</div>
