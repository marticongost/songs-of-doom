<script lang="ts" module>
	import * as css from '$lib/styles';
	import type { ScalarExpressionType } from '@songsofdoom/game';

	const styles = css.styles({
		proficiencyIndicator: {
			'--indicator-color': css.colorBindings.proficiencyColor,
			'--indicator-value-y-offset': '0.1em'
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
	{...standardAttributes(attributes, styles.proficiencyIndicator)}
	{amount}
	icon="effects/proficiency.svg"
/>
