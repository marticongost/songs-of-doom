<!--
@component
Groups related toolbar elements together and renders a thin vertical separator after the
group if it is followed by any other element in the toolbar.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';
	const separator = `1px solid ${css.palette.extraLightCocoaBrown}`;

	const styles = css.styles({
		toolbarGroup: {
			...css.row(),
			borderLeft: separator,
			borderRight: separator,
			'& + .toolbar-group': {
				borderLeft: 'none'
			}
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
		/** The toolbar elements to group together. */
		children: Snippet;
	}

	const { children, ...rest }: Props = $props();
</script>

<div {...standardAttributes(rest, styles.toolbarGroup)}>
	{@render children()}
</div>
