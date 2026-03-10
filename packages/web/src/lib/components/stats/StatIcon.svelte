<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		statIcon: {
			alignSelf: 'center'
		},
		colorCoded: {
			...css.colorBindings.stats.rules('data-stat', (color) => ({ color }))
		}
	});
</script>

<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { cx } from '@emotion/css';
	import { stats, type Stat, type StatType } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		stat: Stat | StatType;
		colorCoded?: boolean;
	}

	const { stat, colorCoded = false, ...attributes }: Props = $props();

	const statObject = $derived(typeof stat === 'string' ? stats[stat] : stat);
</script>

<InlineSvg
	{...standardAttributes(attributes, cx(styles.statIcon, { [styles.colorCoded]: colorCoded }))}
	data-color-coded={colorCoded ? 'true' : 'false'}
	data-stat={statObject.type}
	src="stats/{statObject.type}.svg"
/>
