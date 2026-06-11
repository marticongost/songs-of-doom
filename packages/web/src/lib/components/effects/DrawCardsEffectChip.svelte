<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { plural2 } from '@songsofdoom/common/localisation';
	import { DrawCardsEffect } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';

	interface Props {
		effect: DrawCardsEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Robar %(amount)" es="Robar %(amount)" en="Draw %(amount)">
	{#snippet amount()}
		{#if typeof effect.amount === 'number'}
			<Text
				ca="{effect.amount} {plural2(effect.amount, 'carta', 'cartes')}"
				es="{effect.amount} {plural2(effect.amount, 'carta', 'cartas')}"
				en="{effect.amount} {plural2(effect.amount, 'card', 'cards')}"
			/>
		{:else}
			<ExpressionChip expression={effect.amount} />
			<Text ca="cartes" es="cartas" en="cards" />
		{/if}
	{/snippet}
</Text>
