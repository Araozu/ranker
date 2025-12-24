<script lang="ts">
	import ThemeToggle from "../../components/theme-toggle.svelte";

	let { children } = $props();
</script>

<nav class="border-b border-primary">
	<div class="container mx-auto flex items-center justify-between px-4">
		<h1
			class="font-display text-2xl font-semibold py-4 hover:text-primary transition-colors"
		>
			Ranker
		</h1>

		<ThemeToggle />
	</div>
</nav>

<main class="container mx-auto py-10 px-4 max-w-3xl">
	{@render children?.()}
</main>
