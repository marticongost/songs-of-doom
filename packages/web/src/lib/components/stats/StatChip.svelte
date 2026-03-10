<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		statChip: {
			...css.row('xs'),
			display: 'inline-flex',
			alignItems: 'baseline'
		},
		colorCoded: {
			...css.colorBindings.stats.rules('data-stat', (color) => ({ color }))
		},
		statName: {
			fontWeight: 'bold'
		}
	});
</script>

<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { cx } from '@emotion/css';
	import { stats, type Stat, type StatType } from '@songsofdoom/game';
	import StatIcon from './StatIcon.svelte';

	interface Props extends StandardAttributeProps {
		stat: Stat | StatType;
		colorCoded?: boolean;
	}

	const { stat, colorCoded = false, ...attributes }: Props = $props();

	const statObject = $derived(typeof stat === 'string' ? stats[stat] : stat);
</script>

<span
	{...standardAttributes(attributes, cx(styles.statChip, [styles.colorCoded], colorCoded))}
	data-stat={statObject.type}
>
	<StatIcon stat={statObject} {colorCoded} />
	<span class={styles.statName}><Text {...statObject.name} /></span>
</span>
