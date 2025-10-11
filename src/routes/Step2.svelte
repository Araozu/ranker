<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import type { RankedItem } from "$lib/ranking";

    interface Props {
        items: Array<RankedItem>;
    }

    let { items }: Props = $props();

    const dispatch = createEventDispatcher<{
        back: void;
        continue: void;
    }>();

    function handleBack() {
        dispatch('back');
    }
</script>

<Card>
    <CardHeader>
        <CardTitle>Your Items</CardTitle>
        <CardDescription>Here are the items you've entered</CardDescription>
    </CardHeader>
    <CardContent>
        {#if items.length > 0}
            <ul class="space-y-2">
                {#each items as item}
                    <li class="p-3 bg-muted rounded-md border">
                        <span class="font-medium">{item[0]}.</span> {item[1]}
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="text-muted-foreground">No items processed yet.</p>
        {/if}

        <div class="mt-6 flex gap-2">
            <Button onclick={handleBack} variant="outline">
                Back to Input
            </Button>
            <Button onclick={() => dispatch('continue')}>
                Start Ranking
            </Button>
        </div>
    </CardContent>
</Card>
