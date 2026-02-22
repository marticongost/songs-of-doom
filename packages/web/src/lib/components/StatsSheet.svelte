<script lang="ts" generics="T extends StatType = StatType">
	import { Stat, statTypes as allStatTypes, stats, type StatType } from '@songsofdoom/game';
	import { mapToRecord } from '../../../../common/src/utils';
	import Text from './localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';
	import StatIcon from './stats/StatIcon.svelte';

	interface Props extends StandardAttributeProps {
		/** The stats to display (must include all types specified in statTypes) */
		stats: Record<T, number> | Map<Stat | T, number>;

		/** Optional filter for which stats to display (default: all) */
		statTypes?: T[];

		/** Whether to show stat labels (default: false) */
		showLabels?: boolean;
	}

	const {
		stats: attributes,
		statTypes = allStatTypes as T[],
		showLabels = false,
		...rest
	}: Props = $props();
	const statsRecord = $derived(
		mapToRecord(attributes, { mapKeys: (key) => (key instanceof Stat ? key.type : key) })
	);
</script>

<div {...standardAttributes(rest, 'stats-sheet')}>
	{#each statTypes as statType (statType)}
		{@const value = statsRecord[statType]}
		<span class="stat" data-stat={statType}>
			<StatIcon class="stat-icon" stat={statType as StatType} />
			{#if showLabels}
				<span class="stat-label"><Text {...stats[statType].name} /></span>
			{/if}
			<span class="stat-value">{value}</span>
		</span>
	{/each}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.stats-sheet {
		@include rz.column;
		align-items: flex-start;

		:global(.stat-icon) {
			color: var(--text-subtle-color);
			filter: drop-shadow(0 0 0.5em black);
		}
	}

	.stat {
		flex: 1;
		@include rz.row(sm);
		@include rz.hpadding(sm);
		justify-content: center;
		align-items: center;
		--svg-width: 1.4em;
		--svg-height: auto;

		& + .stat {
			border-top: 1px solid rgba(white, 0.05);
		}
	}

	.stat-label {
		width: 7em;
		font-family: var(--heading-font);
		font-size: 1.2em;
		font-weight: bold;
		color: var(--text-highlight);
	}

	.stat-value {
		font-weight: bold;
		font-size: 1.5em;
		font-family: var(--number-font);
	}
</style>
