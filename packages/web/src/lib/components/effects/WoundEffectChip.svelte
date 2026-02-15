<script lang="ts">
	import type { WoundEffect } from '@songsofdoom/game';
	import DamageIndicator from '../indicators/DamageIndicator.svelte';
	import Text from '../localisation/Text.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: WoundEffect;
	}

	const { effect }: Props = $props();
</script>

<DamageIndicator amount={effect.damage} />

{#if effect.properties.length}
	<Text ca="amb" es="con" en="with" />
	<PropertyList properties={effect.properties} />
{/if}

<TargetChip target={effect.target} relation="to" />
