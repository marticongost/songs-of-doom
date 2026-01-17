<script lang="ts">
	import type { CreatureStatType } from '$lib/catalog/models/creature';
	import { standardAttributes } from './standardattributes';
	import StatIcon from './stats/StatIcon.svelte';
	export let stats: Record<CreatureStatType, number>;
</script>

<div {...standardAttributes($$props, 'creature-stats')}>
	{#each Object.entries(stats) as [stat, value]}
		<span class="creature-stat" data-stat={stat}>
			<StatIcon stat={stat as CreatureStatType} />
			<span class="creature-stat-value">{value}</span>
		</span>
	{/each}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.creature-stats {
		@include rz.row;
		background-image: linear-gradient(to bottom, transparent, rgba(black, 0.1));
		border-bottom: var(--panel-separator);
	}

	.creature-stat {
		flex: 1 0 auto;
		@include rz.row(sm);
		@include rz.padding(sm);
		justify-content: center;

		& + .creature-stat {
			border-left: 1px solid rgba(white, 0.05);
		}
	}

	.creature-stat-value {
		font-weight: bold;
		font-size: 1.3em;
	}
</style>
