<script lang="ts">
	import { indicatorTypes, stats, type Stat, type StatType } from '$lib/catalog/models/stats';
	import { standardAttributes } from '$lib/components/standardattributes';
	import Text from '$lib/components/localisation/Text.svelte';
	import AptitudeIcon from '../aptitudes/AptitudeIcon.svelte';
	import type { CapabilityCostType } from '$lib/catalog/models/capabilitycost';
	import { aptitudes, aptitudeTypes, type AptitudeType } from '$lib/catalog/models/aptitude';
	import StatChip from '../stats/StatChip.svelte';
	import ChargesChip from './ChargesChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';

	export let type: CapabilityCostType;
</script>

<span {...standardAttributes($$props, 'capability-cost-chip')} data-type={type}>
	{#if (aptitudeTypes as Array<CapabilityCostType>).includes(type)}
		<AptitudeIcon aptitude={type as AptitudeType} />
	{:else if (indicatorTypes as Array<CapabilityCostType>).includes(type)}
		<StatChip stat={type as StatType} />
	{:else if type === 'charges'}
		<InlineSvg class="icon" src="capabilities/charge.svg" />
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
