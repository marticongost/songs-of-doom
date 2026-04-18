<script lang="ts" module>
	import * as css from '$lib/styles';
	import type { ScalarExpressionType } from '@songsofdoom/game';

	const styles = css.styles({
		cardCopiesIndicator: {
			'--indicator-value-text-shadow': '0 0 0.2em black',
			'--indicator-color': css.palette.hurricane,
			"&[data-amount='0']": {
				opacity: '0.4'
			},
			"&[data-amount='0'] svg": {
				filter: 'grayscale(100%)'
			}
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
	{...standardAttributes(attributes, styles.cardCopiesIndicator)}
	{amount}
	icon="cards.svg"
	data-amount={amount}
/>
