<script lang="ts" module>
	import * as css from '$lib/styles';
	import type { ScalarExpressionType } from '@songsofdoom/game';

	const styles = css.styles({
		goldIndicator: {
			'--indicator-color': css.colorBindings.goldColor,
			'--indicator-value-color': css.palette.wornWhite,
			'--indicator-value-text-shadow': '0 0 0.2em black'
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

<Indicator {...standardAttributes(attributes, styles.goldIndicator)} {amount} icon="gold.svg" />
