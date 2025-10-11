<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Label } from "$lib/components/ui/label";

    interface Props {
        inputText: string;
    }

    let { inputText }: Props = $props();

    const dispatch = createEventDispatcher<{
        process: { inputText: string };
    }>();

    function handleProcess() {
        if (!inputText.trim()) return;
        dispatch('process', { inputText });
    }
</script>

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
        <Button onclick={handleProcess} disabled={!inputText.trim()} class="w-full">
            Process Items
        </Button>
    </CardContent>
</Card>
