<script lang="ts">
	import { DrawCardsEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';
	import { plural2 } from '@songsofdoom/common/localisation';

	interface Props {
		effect: DrawCardsEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Robar {effect.amount} {plural2(effect.amount, 'carta', 'cartes')}"
	es="Robar {effect.amount} {plural2(effect.amount, 'carta', 'cartas')}"
	en="Draw {effect.amount} {plural2(effect.amount, 'card', 'cards')}"
/>
