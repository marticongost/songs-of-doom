<script lang="ts">
	import {
		CapabilityCost,
		scalarCapabilityCostTypes,
		type ScalarCapabilityCostType
	} from '$lib/catalog/models/capabilitycost';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import CapabilityCostChip from './CapabilityCostChip.svelte';

	interface Props extends StandardAttributeProps {
		cost: CapabilityCost | Partial<Record<ScalarCapabilityCostType, number>>;
	}

	const { cost, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'capability-cost-list')}>
	{#each scalarCapabilityCostTypes as type}
		{#each { length: cost[type] ?? 0 } as _}
			<CapabilityCostChip {type} />
		{/each}
	{/each}

	{#if cost instanceof CapabilityCost}
		{#if cost.cardTransition?.type === 'exhaust'}
			<CapabilityCostChip type="exhaust" />
		{/if}
		{#if cost.cardTransition?.type === 'discard'}
			<CapabilityCostChip type="discard" />
		{/if}
	{/if}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.capability-cost-list {
		@include rz.row(xs);
		display: inline-flex;
	}
</style>
