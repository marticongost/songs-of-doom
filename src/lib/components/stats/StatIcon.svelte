<script lang="ts">
	import { stats, type Stat, type StatType } from '$lib/catalog/models/stats';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import { standardAttributes } from '$lib/components/standardattributes';

	export let stat: Stat | StatType;
	const statObject = typeof stat === 'string' ? stats[stat] : stat;
</script>

<InlineSvg
	{...standardAttributes($$props, 'stat-icon')}
	data-stat={statObject.type}
	src="stats/{statObject.type}.svg"
/>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.stat-icon) {
		align-self: center;
	}

	@each $stat in strength, agility, intelligence, charisma, health, sanity {
		:global(.stat-icon[data-stat='#{$stat}']) {
			color: var(--stat-#{$stat}-color);
		}
	}
</style>
