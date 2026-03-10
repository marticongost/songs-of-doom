<script lang="ts" module>
	import * as css from '$lib/styles';

	type Layout = 'row' | 'column';

	const layoutStyles: Record<Layout, ReturnType<typeof css.styles>> = {
		row: css.styles({
			capabilityCostList: {
				...css.row('sm'),
				display: 'inline-flex'
			},
			numericCost: {
				...css.row('xs'),
				display: 'inline-flex'
			}
		}),
		column: css.styles({
			capabilityCostList: {
				...css.column('sm')
			},
			numericCost: {
				...css.column('xs')
			}
		})
	};
</script>

<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import {
		CapabilityCost,
		scalarCapabilityCostTypes,
		type ScalarCapabilityCostType
	} from '@songsofdoom/game';
	import CapabilityCostChip from './CapabilityCostChip.svelte';

	interface Props extends StandardAttributeProps {
		cost: CapabilityCost | Partial<Record<ScalarCapabilityCostType, number>>;
		layout?: Layout;
	}

	const { cost, layout = 'row', ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, layoutStyles[layout].capabilityCostList)}>
	{#each scalarCapabilityCostTypes as type (type)}
		{@const value = cost instanceof CapabilityCost ? cost.getCostForType(type) : (cost[type] ?? 0)}
		{#if typeof value === 'number'}
			{#if value > 0}
				<span class={layoutStyles[layout].numericCost}
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
