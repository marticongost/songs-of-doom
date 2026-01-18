<script lang="ts">
	import { type CapabilityCostType } from '$lib/catalog/models/capabilitycost';
	import { ModifyCapabilityCostEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import CapabilityCostChip from '../capabilities/CapabilityCostChip.svelte';
	import CommaSeparatedList from '../localisation/CommaSeparatedList.svelte';

	interface Props {
		effect: ModifyCapabilityCostEffect;
	}

	const { effect }: Props = $props();
</script>

{#snippet renderCost([type, value]: [CapabilityCostType, number])}
	<span>
		<CapabilityCostChip {type} />
		<Text ca=" en " es=" en " en=" by " />
		<strong>
			{value}
		</strong>
	</span>
{/snippet}

{#if effect.group().increase}
	<Text ca="Augmentar el cost en" es="Aumentar el coste en" en="Increase the cost " />
	<CommaSeparatedList
		items={Object.entries(effect.group().increase!) as [CapabilityCostType, number][]}
		renderItem={renderCost}
	/>
{:else if effect.group().decrease}
	<Text ca="Reduir el cost en" es="Reducir el coste en" en="Decrease the cost " />
	<CommaSeparatedList
		items={Object.entries(effect.group().decrease!) as [CapabilityCostType, number][]}
		renderItem={renderCost}
	/>
{/if}
