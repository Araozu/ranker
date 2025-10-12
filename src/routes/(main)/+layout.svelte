<script lang="ts">
	import ThemeToggle from "../../components/theme-toggle.svelte";

	let { children } = $props();
</script>

<nav class="flex items-center border-b border-primary">
	<h1
		class="font-display text-2xl font-semibold px-8 py-2 hover:text-primary transition-colors"
	>
		Ranker
	</h1>

	<ThemeToggle />
</nav>

{@render children?.()}
