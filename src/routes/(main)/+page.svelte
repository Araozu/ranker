<script lang="ts">
	import Steps from "../../components/steps.svelte";
	import { Textarea } from "$lib/components/ui/textarea";

	let input = $state("");

	let items = $derived(
		input.split("\n").filter((line) => line.trim() !== ""),
	);
</script>

Welcome.

<div class="px-8 space-y-4">
	<Steps n="1" text="Write a list of things you want to rank:" />
	<Textarea
		bind:value={input}
		placeholder="Enter items, one per line..."
		class="w-full min-h-[100px]"
		rows={10}
	/>
</div>

<div class="px-8 space-y-4">
	<Steps n="2" text="Check your list" />
	{#if items.length > 0}
		<ul class="list-disc list-inside space-y-1">
			{#each items as item}
				<li>{item}</li>
			{/each}
		</ul>
	{/if}
</div>

<Steps n="3" text="Rank your list" />
<Steps n="4" text="Profit" />
