<script lang="ts">
	import { focusTypes, type FocusType } from '$lib/catalog/models/focus';
	import type { CapabilityCostType } from '$lib/catalog/models/capabilitycost';
	import { indicatorTypes, type StatType } from '$lib/catalog/models/stats';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import FocusIcon from '../focuses/FocusIcon.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import StatChip from '../stats/StatChip.svelte';

	interface Props extends StandardAttributeProps {
		type: CapabilityCostType;
	}

	const { type, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'capability-cost-chip')} data-type={type}>
	{#if (focusTypes as Array<CapabilityCostType>).includes(type)}
		<FocusIcon focus={type as FocusType} />
	{:else if (indicatorTypes as Array<CapabilityCostType>).includes(type)}
		<StatChip stat={type as StatType} />
	{:else if type === 'charges'}
		<InlineSvg class="icon" src="capabilities/charge.svg" />
	{:else if type === 'exhaust'}
		<InlineSvg class="icon" src="capabilities/exhaust.svg" />
	{:else if type === 'discard'}
		<InlineSvg class="icon" src="capabilities/discard.svg" />
	{/if}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.stat-chip {
		@include rz.row(xs);
		display: inline-flex;
		align-items: baseline;

		@each $stat in strength, agility, intelligence, charisma, will, health, sanity {
			&[data-stat='#{$stat}'] {
				color: var(--stat-#{$stat}-color);
			}
		}
	}

	.stat-name {
		font-weight: bold;
	}
</style>
