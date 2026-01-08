<script lang="ts">
	import { DrawCardsEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import { plural2 } from '$lib/localisation';

	export let effect: DrawCardsEffect;
</script>

<Text
	ca="Robar {effect.amount} {plural2(effect.amount, 'carta', 'cartes')}"
	es="Robar {effect.amount} {plural2(effect.amount, 'carta', 'cartas')}"
	en="Draw {effect.amount} {plural2(effect.amount, 'card', 'cards')}"
/>
