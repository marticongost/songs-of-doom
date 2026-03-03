<!--
	@component
	Displays an EquipEffect, which allows the player to change their active equipment.
-->
<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { type EquipEffect } from '@songsofdoom/game';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: EquipEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Equipar" es="Equipar" en="Equip" />
<TargetChip target={effect.target} />
