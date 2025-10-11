<script lang="ts">
    import ThemeToggle from "../components/theme-toggle.svelte";
    import Step1 from "./Step1.svelte";
    import Step2 from "./Step2.svelte";
    import Step3 from "./Step3.svelte";
    import { InsertionSortRanking, MergeSortRanking } from "$lib/ranking";
    import type { RankedItem } from "$lib/ranking";

    let inputText = $state("");
    let items = $state<Array<RankedItem>>([]);
    let rankedItems = $state<Array<RankedItem>>([]);
    let currentStep = $state(1);

    // Initialize ranking algorithm
    let rankingAlgorithm = new MergeSortRanking();

    function handleProcess(event: CustomEvent<{ inputText: string }>) {
        const processedItems = event.detail.inputText
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        // Create tuples with letters and text
        items = processedItems.map((text, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, ...
            return [letter, text] as RankedItem;
        });

        currentStep = 2;
    }

    function handleBack() {
        currentStep = Math.max(1, currentStep - 1);
    }

    function handleContinue() {
        currentStep = 3;
    }

    function handleRankingComplete(event: CustomEvent<{ rankedItems: RankedItem[] }>) {
        rankedItems = event.detail.rankedItems;
        currentStep = 4; // Could add a final results screen
    }
</script>

<ThemeToggle />

<h1>Ranker</h1>

<div class="max-w-2xl mx-auto mt-8">
    {#if currentStep === 1}
        <Step1 {inputText} on:process={handleProcess} />
    {:else if currentStep === 2}
        <Step2 {items} on:back={handleBack} on:continue={handleContinue} />
    {:else if currentStep === 3}
        <Step3 {items} algorithm={rankingAlgorithm} on:back={handleBack} on:complete={handleRankingComplete} />
    {/if}
</div>
