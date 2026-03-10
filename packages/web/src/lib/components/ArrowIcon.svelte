<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		arrowIcon: {
			color: css.text.subtleColor,
			width: '1em'
		}
	});
</script>

<script lang="ts">
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	const { ...attributes }: StandardAttributeProps = $props();
</script>

<InlineSvg {...standardAttributes(attributes, styles.arrowIcon)} src="arrow.svg" />
