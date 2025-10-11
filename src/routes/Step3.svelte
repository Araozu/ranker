<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import type { RankingAlgorithm } from "$lib/ranking";
    import { InsertionSortRanking } from "$lib/ranking";

    interface Props {
        items: Array<string>;
        algorithm?: RankingAlgorithm;
    }

    let { items, algorithm = new InsertionSortRanking() }: Props = $props();

    const dispatch = createEventDispatcher<{
        back: void;
        complete: { rankedItems: string[] };
    }>();

    let currentPair = $state<[string, string] | null>(null);

    // Initialize algorithm when items change
    $effect(() => {
        if (items.length > 0) {
            algorithm.initialize(items);
            updateCurrentPair();
        }
    });

    function updateCurrentPair() {
        currentPair = algorithm.getNextComparison();
    }

    function handleChoice(winner: string, loser: string) {
        algorithm.submitComparison(winner, loser);
        updateCurrentPair();
    }

    function handleBack() {
        dispatch('back');
    }

    function handleComplete() {
        dispatch('complete', { rankedItems: algorithm.getRankedItems() });
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
                        onclick={() => handleChoice(currentPair![0], currentPair![1])}
                        class="flex-1 max-w-xs h-auto p-6 text-center"
                        size="lg"
                    >
                        <div class="text-xl font-semibold">{currentPair[0]}</div>
                    </Button>
                    <div class="flex items-center text-muted-foreground">vs</div>
                    <Button
                        onclick={() => handleChoice(currentPair![1], currentPair![0])}
                        class="flex-1 max-w-xs h-auto p-6 text-center"
                        size="lg"
                        variant="outline"
                    >
                        <div class="text-xl font-semibold">{currentPair[1]}</div>
                    </Button>
                </div>
                <div class="text-center text-sm text-muted-foreground">
                    Progress: {algorithm.getProgress()}%
                </div>
            </div>
        {:else if algorithm.getRankedItems().length > 0}
            <div class="space-y-4">
                <p class="text-center text-lg font-medium">Your ranked list:</p>
                <ol class="space-y-2">
                    {#each algorithm.getRankedItems() as item, index}
                        <li class="p-4 bg-muted rounded-md border text-center">
                            <span class="text-2xl font-bold text-primary">#{index + 1}</span>
                            <span class="ml-3 text-lg">{item}</span>
                        </li>
                    {/each}
                </ol>
                <div class="flex gap-2 justify-center mt-6">
                    <Button onclick={handleBack} variant="outline">
                        Back
                    </Button>
                    <Button onclick={handleComplete}>
                        Done
                    </Button>
                </div>
            </div>
        {:else}
            <p class="text-center text-muted-foreground">No items to rank.</p>
        {/if}
    </CardContent>
</Card>
