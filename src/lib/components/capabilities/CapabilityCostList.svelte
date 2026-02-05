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
		layout?: 'row' | 'column';
	}

	const { cost, layout = 'row', ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'capability-cost-list')} data-layout={layout}>
	{#each scalarCapabilityCostTypes as type (type)}
		{@const value = cost instanceof CapabilityCost ? cost.getCostForType(type) : (cost[type] ?? 0)}
		{#if typeof value === 'number'}
			{#if value > 0}
				<span class="numeric-cost"
					><!--
					-->{#each { length: value } as _, index (index)}<CapabilityCostChip
							{type}
						/>{/each}<!--
				--></span
				>
			{/if}
		{:else}
			<CapabilityCostChip {type} amount={value} />
		{/if}
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
		&[data-layout='row'] {
			@include rz.row(sm);
			display: inline-flex;

			.numeric-cost {
				@include rz.row(xs);
				display: inline-flex;
			}
		}

		&[data-layout='column'] {
			@include rz.column(sm);

			.numeric-cost {
				@include rz.column(xs);
			}
		}
	}
</style>
