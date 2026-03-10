<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		goldIcon: {
			alignSelf: 'center',
			width: '1.2em',
			height: '1.2em',
			color: css.colorBindings.goldColor
		}
	});
</script>

<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	const { ...attributes }: StandardAttributeProps = $props();
</script>

<InlineSvg {...standardAttributes(attributes, styles.goldIcon)} src="gold.svg" />
