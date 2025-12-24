<script lang="ts">
	let { n, text, done = false }: { n: string; text: string; done?: boolean } = $props();
</script>

<div class="flex items-center gap-4">
	<span
		class="inline-flex h-10 w-10 shrink-0 rounded-full font-display font-bold items-center justify-center text-lg shadow-sm {done
			? 'bg-green-500 text-white'
			: 'bg-primary text-primary-foreground'}"
	>
		{#if done}
			✓
		{:else}
			{n}
		{/if}
	</span>
	<h3 class="text-xl font-semibold tracking-tight {done ? 'text-muted-foreground' : ''}">{text}</h3>
</div>
