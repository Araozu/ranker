<script lang="ts">
	let { n, text }: { n: string; text: string } = $props();
</script>

<div class="border-2 border-primary/25 rounded-sm flex items-center p-2 gap-4">
	<span
		class="inline-flex h-8 w-8 rounded-full bg-primary text-background font-display font-bold items-center justify-center"
	>
		{n}
	</span>
	<div>{text}</div>
</div>
