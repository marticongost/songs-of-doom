<script lang="ts" module>
	import * as css from '$lib/styles';
	import type { ScalarExpressionType } from '@songsofdoom/game';

	const styles = css.styles({
		initiativeIndicator: {
			'--indicator-icon-size': '1.5em',
			'--indicator-value-y-offset': '0.1em',
			'--indicator-value-font-weight': 'normal',
			'--indicator-value-text-shadow': 'none'
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: ScalarExpressionType;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<Indicator
	{...standardAttributes(attributes, styles.initiativeIndicator)}
	{amount}
	icon="effects/initiative.svg"
/>
