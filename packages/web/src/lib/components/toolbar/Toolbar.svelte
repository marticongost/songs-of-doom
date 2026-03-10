<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		toolbar: {
			...css.row(),
			backgroundColor: css.palette.lightCocoaBrown,
			border: `2px solid ${css.palette.extraLightCocoaBrown}`,
			borderRadius: css.spacing.sm
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
		children: Snippet;
	}

	const { children, ...rest }: Props = $props();
</script>

<div {...standardAttributes(rest, styles.toolbar)}>
	{@render children()}
</div>
