<script lang="ts" module>
	import * as css from '$lib/styles';
	import type { ScalarExpressionType } from '@songsofdoom/game';

	const styles = css.styles({
		healthIndicator: {
			'--indicator-color': css.colorBindings.stats.colors.health
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: ScalarExpressionType;
		contrast?: boolean;
	}

	const { amount, contrast = false, ...attributes }: Props = $props();
</script>

<Indicator
	{...standardAttributes(attributes, styles.healthIndicator)}
	{amount}
	{contrast}
	icon="stats/health.svg"
/>
