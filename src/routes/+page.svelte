<script lang="ts">
    import ThemeToggle from "../components/theme-toggle.svelte";
    import Step1 from "./Step1.svelte";
    import Step2 from "./Step2.svelte";

    let inputText = $state("");
    let items = $state<Array<string>>([]);
    let currentStep = $state(1);

    function handleProcess(event: CustomEvent<{ inputText: string }>) {
        const processedItems = event.detail.inputText
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        items = processedItems;
        currentStep = 2;
    }

    function handleBack() {
        currentStep = 1;
    }
</script>

<ThemeToggle />

<h1>Ranker</h1>

<div class="max-w-2xl mx-auto mt-8">
    {#if currentStep === 1}
        <Step1 {inputText} on:process={handleProcess} />
    {:else if currentStep === 2}
        <Step2 {items} on:back={handleBack} />
    {/if}
</div>
