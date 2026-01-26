<script lang="ts">
	import type { WoundEffect } from '$lib/catalog/models/effects';
	import DamageChip from '../damage/DamageChip.svelte';
	import Text from '../localisation/Text.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: WoundEffect;
	}

	const { effect }: Props = $props();
</script>

<DamageChip amount={effect.damage} />

{#if effect.properties.length}
	<Text ca="amb" es="con" en="with" />
	<PropertyList properties={effect.properties} />
{/if}

<Text ca="a" es="a" en="to" />
<TargetChip target={effect.target} />
