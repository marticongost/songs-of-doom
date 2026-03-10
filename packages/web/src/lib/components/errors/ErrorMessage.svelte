<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		errorMessage: {
			...css.hpadding('md'),
			...css.vpadding('sm'),
			backgroundColor: css.palette.red
		}
	});
</script>

<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Snippet } from 'svelte';

	interface Props extends StandardAttributeProps {
		/** The error message to display */
		children: Snippet;
	}

	const { children, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.errorMessage)}>
	{@render children()}
</div>
