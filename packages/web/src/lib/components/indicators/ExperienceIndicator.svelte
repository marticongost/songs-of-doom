<script lang="ts" module>
	import * as css from '$lib/styles';
	import { cx } from '@emotion/css';

	const styles = css.styles({
		experienceIndicator: {
			'--indicator-color': css.palette.ivory,
			'--indicator-value-color': css.palette.somber,
			'--indicator-value-text-shadow': 'none'
		},
		negative: {
			'--indicator-color': css.palette.red,
			'--indicator-value-color': css.palette.ivory
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<Indicator
	{...standardAttributes(
		attributes,
		cx(styles.experienceIndicator, { [styles.negative]: amount < 0 })
	)}
	{amount}
	icon="experience.svg"
/>
