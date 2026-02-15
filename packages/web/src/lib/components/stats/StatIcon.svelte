<script lang="ts">
	import { stats, type Stat, type StatType } from '@songsofdoom/game';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		stat: Stat | StatType;
		colorCoded?: boolean;
	}

	const { stat, colorCoded = false, ...attributes }: Props = $props();

	const statObject = $derived(typeof stat === 'string' ? stats[stat] : stat);
</script>

<InlineSvg
	{...standardAttributes(attributes, `stat-icon${colorCoded ? ' color-coded' : ''}`)}
	data-color-coded={colorCoded ? 'true' : 'false'}
	data-stat={statObject.type}
	src="stats/{statObject.type}.svg"
/>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.stat-icon) {
		align-self: center;
	}

	@each $stat in strength, agility, intelligence, charisma, will, health, sanity {
		:global(.stat-icon.color-coded[data-stat='#{$stat}']) {
			color: var(--stat-#{$stat}-color);
		}
	}
</style>
