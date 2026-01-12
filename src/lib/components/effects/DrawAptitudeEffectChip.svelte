<script lang="ts">
	import { DrawAptitudeEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import { plural2 } from '$lib/localisation';

	export let effect: DrawAptitudeEffect;
</script>

<Text
	ca="Robar {effect.amount} {plural2(effect.amount, 'aptitud', 'aptituds')}"
	es="Robar {effect.amount} {plural2(effect.amount, 'aptitud', 'aptituds')}"
	en="Draw {effect.amount} {plural2(effect.amount, 'aptitude', 'aptitudes')}"
/>
