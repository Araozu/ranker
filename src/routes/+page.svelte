<script lang="ts">
    import ThemeToggle from "../components/theme-toggle.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Label } from "$lib/components/ui/label";

    let inputText = $state("");
    let items = $state<Array<string>>([]);
    let currentStep = $state(1);

    function processInput() {
        if (!inputText.trim()) return;

        const processedItems = inputText
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        items = processedItems;
        currentStep = 2;
    }
</script>

<ThemeToggle />

<h1>Ranker</h1>

{#if currentStep === 1}
    <div class="max-w-2xl mx-auto mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Enter your list of items</CardTitle>
                <CardDescription>Enter each item on a new line</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="items-input">Items</Label>
                    <Textarea
                        id="items-input"
                        bind:value={inputText}
                        placeholder="Item 1
Item 2
Item 3"
                        class="min-h-[200px] resize-none"
                    />
                </div>
                <Button onclick={processInput} disabled={!inputText.trim()} class="w-full">
                    Process Items
                </Button>
            </CardContent>
        </Card>
    </div>
{:else if currentStep === 2}
    <div class="max-w-2xl mx-auto mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Your Items</CardTitle>
                <CardDescription>Here are the items you've entered</CardDescription>
            </CardHeader>
            <CardContent>
                {#if items.length > 0}
                    <ul class="space-y-2">
                        {#each items as item, index}
                            <li class="p-3 bg-muted rounded-md border">
                                <span class="font-medium">{index + 1}.</span> {item}
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="text-muted-foreground">No items processed yet.</p>
                {/if}

                <div class="mt-6 flex gap-2">
                    <Button onclick={() => currentStep = 1} variant="outline">
                        Back to Input
                    </Button>
                    <!-- Next screen button will be added in future prompts -->
                </div>
            </CardContent>
        </Card>
    </div>
{/if}
