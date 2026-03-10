<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		sanityIndicator: {
			'--indicator-color': css.colorBindings.stats.colors.sanity
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: number;
		contrast?: boolean;
	}

	const { amount, contrast = false, ...attributes }: Props = $props();
</script>

<Indicator
	{...standardAttributes(attributes, styles.sanityIndicator)}
	{amount}
	{contrast}
	icon="stats/sanity.svg"
/>
