<script lang="ts">
	import { ModifyRollEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import { plural2 } from '$lib/localisation';

	interface Props {
		effect: ModifyRollEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="{effect.modifier > 0 ? 'Afegir' : 'Restar'} {Math.abs(effect.modifier)} {plural2(
		Math.abs(effect.modifier),
		'dau',
		'daus'
	)} a la tirada"
	es="{effect.modifier > 0 ? 'Añadir' : 'Restar'} {Math.abs(effect.modifier)} {plural2(
		Math.abs(effect.modifier),
		'dado',
		'dados'
	)} a la tirada"
	en="{effect.modifier > 0 ? 'Add' : 'Subtract'} {Math.abs(effect.modifier)} {plural2(
		Math.abs(effect.modifier),
		'die',
		'dice'
	)} to the roll"
/>
