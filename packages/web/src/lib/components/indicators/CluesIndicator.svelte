<script lang="ts" module>
	import * as css from '$lib/styles';
	import type { ScalarExpressionType } from '@songsofdoom/game';

	const styles = css.styles({
		cluesIndicator: {
			'--indicator-icon-size': '1.5em',
			'--indicator-color': css.colorBindings.clueColor
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
	{...standardAttributes(attributes, styles.cluesIndicator)}
	{amount}
	icon="effects/clue.svg"
/>
