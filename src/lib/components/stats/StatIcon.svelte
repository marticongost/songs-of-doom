<script lang="ts">
	import { stats, type Stat, type StatType } from '$lib/catalog/models/stats';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		stat: Stat | StatType;
	}

	const { stat, ...attributes }: Props = $props();

	const statObject = $derived(typeof stat === 'string' ? stats[stat] : stat);
</script>

<InlineSvg
	{...standardAttributes(attributes, 'stat-icon')}
	data-stat={statObject.type}
	src="stats/{statObject.type}.svg"
/>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.stat-icon) {
		align-self: center;
	}

	@each $stat in strength, agility, intelligence, charisma, will, health, sanity {
		:global(.stat-icon[data-stat='#{$stat}']) {
			color: var(--stat-#{$stat}-color);
		}
	}
</style>
