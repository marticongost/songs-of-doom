<script lang="ts">
	import { ModifyDamageEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: ModifyDamageEffect;
	}

	const { effect }: Props = $props();
	const modifierText = effect.amount > 0 ? `+${effect.amount}` : effect.amount.toString();
</script>

<Text
	ca="Modificar el dany en {modifierText}"
	es="Modificar el daño en {modifierText}"
	en="Modify damage by {modifierText}"
/>
