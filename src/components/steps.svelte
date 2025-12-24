<script lang="ts">
	let { n, text }: { n: string; text: string } = $props();
</script>

<div class="flex items-center gap-4">
	<span
		class="inline-flex h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground font-display font-bold items-center justify-center text-lg shadow-sm"
	>
		{n}
	</span>
	<h3 class="text-xl font-semibold tracking-tight">{text}</h3>
</div>
