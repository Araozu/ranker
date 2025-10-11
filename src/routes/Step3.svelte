<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import type { RankingAlgorithm, RankedItem } from "$lib/ranking";
    import { MergeSortRanking } from "$lib/ranking";

    interface Props {
        items: Array<RankedItem>;
        algorithm?: RankingAlgorithm;
    }

    let { items, algorithm = new MergeSortRanking() }: Props = $props();

    const dispatch = createEventDispatcher<{
        back: void;
        complete: { rankedItems: RankedItem[] };
    }>();

    let currentPair = $state<[RankedItem, RankedItem] | null>(null);
    let visualState = $state<{
        items: RankedItem[];
        comparing: [number, number] | null;
    }>({ items: [], comparing: null });

    // Initialize algorithm when items change
    $effect(() => {
        if (items.length > 0) {
            algorithm.initialize(items);
            updateState();
        }
    });

    function updateState() {
        currentPair = algorithm.getNextComparison();
        visualState = algorithm.getVisualState();
    }

    function handleChoice(winner: RankedItem, loser: RankedItem) {
        algorithm.submitComparison(winner, loser);
        updateState();
    }

    function handleBack() {
        dispatch("back");
    }

    function handleComplete() {
        dispatch("complete", { rankedItems: algorithm.getRankedItems() });
    }
</script>

<Card>
    <CardHeader>
        <CardTitle>Rank Your Items</CardTitle>
        <CardDescription>
            {#if currentPair}
                {algorithm.getCurrentState()}
            {:else}
                Ranking complete! Here are your ranked items.
            {/if}
        </CardDescription>
    </CardHeader>
    <CardContent>
        {#if currentPair}
            <div class="space-y-4">
                <p class="text-center text-lg font-medium">
                    Which do you prefer?
                </p>
                <div class="flex gap-4 justify-center">
                    <Button
                        onclick={() =>
                            handleChoice(currentPair![0], currentPair![1])}
                        class="flex-1 max-w-xs h-auto p-6 text-center overflow-ellipsis"
                        size="lg"
                        variant="outline"
                    >
                        <div class="text-xl font-semibold">
                            {currentPair[0][1]}
                        </div>
                    </Button>
                    <div class="flex items-center text-muted-foreground">
                        vs
                    </div>
                    <Button
                        onclick={() =>
                            handleChoice(currentPair![1], currentPair![0])}
                        class="flex-1 max-w-xs h-auto p-6 text-center overflow-ellipsis"
                        size="lg"
                        variant="outline"
                    >
                        <div class="text-xl font-semibold">
                            {currentPair[1][1]}
                        </div>
                    </Button>
                </div>
                <div class="text-center text-sm text-muted-foreground">
                    Progress: {algorithm.getProgress()}%
                </div>

                <!-- Visual representation of current item positions -->
                <div class="flex justify-center mb-6">
                    <div
                        class="relative flex gap-2 flex-wrap justify-center max-w-2xl"
                    >
                        {#each visualState.items as item, index}
                            {@const isComparing =
                                visualState.comparing &&
                                (visualState.comparing[0] === index ||
                                    visualState.comparing[1] === index)}
                            {@const isFirstComparing =
                                visualState.comparing &&
                                visualState.comparing[0] === index}
                            {@const isSecondComparing =
                                visualState.comparing &&
                                visualState.comparing[1] === index}
                            <div
                                class="w-4 h-4 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 relative {isComparing
                                    ? 'border-primary bg-primary/10 scale-110 shadow-lg z-10'
                                    : 'border-muted bg-background'}"
                            >
                                {item[0]}
                                {#if isFirstComparing}
                                    <div
                                        class="absolute w-3 h-3 bg-primary/50 rounded-full animate-pulse"
                                    ></div>
                                {:else if isSecondComparing}
                                    <div
                                        class="absolute w-3 h-3 bg-primary/50 rounded-full animate-pulse"
                                    ></div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {:else if algorithm.getRankedItems().length > 0}
            <div class="space-y-4">
                <p class="text-center text-lg font-medium">Your ranked list:</p>
                <ol class="space-y-2">
                    {#each algorithm.getRankedItems() as item, index}
                        <li class="p-4 bg-muted rounded-md border text-center">
                            <span class="text-2xl font-bold text-primary"
                                >#{index + 1}</span
                            >
                            <span class="ml-3 text-lg font-semibold"
                                >{item[0]}.</span
                            >
                            <span class="ml-1 text-lg">{item[1]}</span>
                        </li>
                    {/each}
                </ol>
                <div class="flex gap-2 justify-center mt-6">
                    <Button onclick={handleBack} variant="outline">Back</Button>
                    <Button onclick={handleComplete}>Done</Button>
                </div>
            </div>
        {:else}
            <p class="text-center text-muted-foreground">No items to rank.</p>
        {/if}
    </CardContent>
</Card>
