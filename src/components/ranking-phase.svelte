<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		leftId: string;
		leftName: string;
		rightId: string;
		rightName: string;
		progress: number;
		comparisonCount: number;
		onPick: (winnerId: string, loserId: string) => void;
	}

	let { leftId, leftName, rightId, rightName, progress, comparisonCount, onPick }: Props = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between text-sm text-muted-foreground">
		<span>Comparison #{comparisonCount + 1}</span>
		<span>{progress}% complete</span>
	</div>

	<div class="w-full bg-secondary rounded-full h-2">
		<div
			class="bg-primary h-2 rounded-full transition-all duration-300"
			style="width: {progress}%"
		></div>
	</div>

	<p class="text-center text-lg text-muted-foreground">Which one do you prefer?</p>

	<div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
		<Card.Root
			class="cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
			onclick={() => onPick(leftId, rightId)}
		>
			<Card.Header>
				<Card.Title class="text-center text-xl">{leftName}</Card.Title>
			</Card.Header>
			<Card.Content>
				<Button variant="outline" class="w-full">Pick this</Button>
			</Card.Content>
		</Card.Root>

		<div class="flex flex-col items-center gap-2">
			<span class="text-2xl font-bold text-muted-foreground">VS</span>
		</div>

		<Card.Root
			class="cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
			onclick={() => onPick(rightId, leftId)}
		>
			<Card.Header>
				<Card.Title class="text-center text-xl">{rightName}</Card.Title>
			</Card.Header>
			<Card.Content>
				<Button variant="outline" class="w-full">Pick this</Button>
			</Card.Content>
		</Card.Root>
	</div>

	<p class="text-center text-xs text-muted-foreground">
		Click on the card or button to select your preference
	</p>
</div>
