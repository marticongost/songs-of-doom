<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		statsSheet: {
			...css.column(),
			alignItems: 'flex-start'
		},
		stat: {
			flex: '1',
			...css.row('sm'),
			...css.hpadding('sm'),
			justifyContent: 'center',
			alignItems: 'center',
			'--svg-width': '1.4em',
			'--svg-height': 'auto',
			'& + .stat': {
				borderTop: '1px solid rgba(white, 0.05)'
			}
		},
		statLabel: {
			width: '7em',
			fontFamily: css.fonts.heading,
			fontSize: '1.2em',
			fontWeight: 'bold',
			color: css.text.highlightColor
		},
		statValue: {
			fontWeight: 'bold',
			fontSize: '1.5em',
			fontFamily: css.fonts.number
		},
		statIcon: {
			color: css.text.subtleColor,
			filter: 'drop-shadow(0 0 0.5em black)'
		}
	});
</script>

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

<div {...standardAttributes(rest, styles.statsSheet)}>
	{#each statTypes as statType (statType)}
		{@const value = statsRecord[statType]}
		<span class={styles.stat} data-stat={statType}>
			<StatIcon class={styles.statIcon} stat={statType as StatType} />
			{#if showLabels}
				<span class={styles.statLabel}><Text {...stats[statType].name} /></span>
			{/if}
			<span class={styles.statValue}>{value}</span>
		</span>
	{/each}
</div>
