<!--
	@component
	Displays an EquipEffect, which allows the player to change their active equipment.
-->
<script lang="ts">
	import { type EquipEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: EquipEffect;
	}

	const { effect: _effect }: Props = $props();
</script>

<Text
	ca="Canviar l'equipament actiu"
	es="Cambiar el equipamiento activo"
	en="Change active equipment"
/>
