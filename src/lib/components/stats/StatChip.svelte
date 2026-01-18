<script lang="ts">
	import { stats, type Stat, type StatType } from '$lib/catalog/models/stats';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import StatIcon from './StatIcon.svelte';

	interface Props extends StandardAttributeProps {
		stat: Stat | StatType;
	}

	const { stat, ...attributes }: Props = $props();

	const statObject = $derived(typeof stat === 'string' ? stats[stat] : stat);
</script>

<span {...standardAttributes(attributes, 'stat-chip')} data-stat={statObject.type}>
	<StatIcon stat={statObject} />
	<span class="stat-name"><Text {...statObject.name} /></span>
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
