<script lang="ts">
	import { ModifyRollEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: ModifyRollEffect;
	}

	const { effect }: Props = $props();
	const modifierText = effect.modifier > 0 ? `+${effect.modifier}` : effect.modifier.toString();
</script>

<Text
	ca="Modificar la tirada en {modifierText}"
	es="Modificar la tirada en {modifierText}"
	en="Modify the roll by {modifierText}"
/>
