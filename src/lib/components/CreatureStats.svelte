<script lang="ts">
	import type { CreatureStatType } from '$lib/catalog/models/creature';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';
	import StatIcon from './stats/StatIcon.svelte';

	interface Props extends StandardAttributeProps {
		stats: Record<CreatureStatType, number>;
	}

	const { stats, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, 'creature-stats')}>
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
		@include rz.column;
		background-image: linear-gradient(to right, transparent, rgba(black, 0.1));
		border-right: var(--panel-separator);
	}

	.creature-stat {
		flex: 1;
		@include rz.row(sm);
		@include rz.hpadding(sm);
		justify-content: center;
		align-items: center;

		& + .creature-stat {
			border-top: 1px solid rgba(white, 0.05);
		}
	}

	.creature-stat-value {
		font-weight: bold;
		font-size: 1.3em;
	}
</style>
