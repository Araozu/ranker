<script lang="ts">
	import Steps from "../../components/steps.svelte";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Button } from "$lib/components/ui/button";

	let input = $state("");

	let items = $derived(
		input.split("\n").filter((line) => line.trim() !== ""),
	);
</script>

<div class="space-y-12">
	<header class="space-y-2">
		<h2 class="text-3xl font-bold tracking-tight">Welcome to Ranker</h2>
		<p class="text-muted-foreground">
			The easiest way to rank anything using pairwise comparisons.
		</p>
	</header>

	<section class="space-y-6">
		<Steps n="1" text="Write a list of things you want to rank" />
		<Textarea
			bind:value={input}
			placeholder="Enter items, one per line..."
			class="w-full min-h-[200px] text-lg p-4"
		/>
		<Button class="w-full" disabled={items.length === 0}>Start Ranking</Button>
	</section>

	<section class="opacity-50 pointer-events-none space-y-6">
		<Steps n="2" text="Rank your list" />
		<Steps n="3" text="Profit" />
	</section>
</div>
